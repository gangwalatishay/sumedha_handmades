const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Coupon = require("../models/Coupon");
const auth = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");
const sendNewOrderEmail = require("../utils/sendEmail");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");
const { getCouponState, calculateCouponDiscount } = require("../utils/couponPricing");

const router = express.Router();
let razorpay;

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay is not configured on the server");
    error.statusCode = 503;
    throw error;
  }
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
  next();
};

function safeEqualHex(expected, received) {
  if (typeof received !== "string" || !/^[a-f0-9]+$/i.test(received)) return false;
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function getShippingAddress(address) {
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "postalCode"];
  if (!address || fields.some((field) => typeof address[field] !== "string" || !address[field].trim())) {
    const error = new Error("Complete all required delivery details");
    error.statusCode = 400;
    throw error;
  }
  const digits = address.phone.replace(/\D/g, "");
  if (!/^[0-9+()\-\s]{8,18}$/.test(address.phone.trim()) || digits.length < 8) {
    const error = new Error("Enter a valid delivery phone number");
    error.statusCode = 400;
    throw error;
  }
  return {
    fullName: address.fullName.trim().slice(0, 100),
    phone: address.phone.trim().slice(0, 18),
    addressLine1: address.addressLine1.trim().slice(0, 200),
    addressLine2: typeof address.addressLine2 === "string" ? address.addressLine2.trim().slice(0, 200) : "",
    city: address.city.trim().slice(0, 100),
    state: address.state.trim().slice(0, 100),
    postalCode: address.postalCode.trim().slice(0, 12),
    country: "India",
  };
}

async function makePaymentSnapshot(items, coupon, giftWrap) {
  if (!Array.isArray(items) || !items.length || items.length > 20) {
    const error = new Error("Your cart is empty or contains too many items");
    error.statusCode = 400;
    throw error;
  }
  const quantities = new Map();
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item?.productId) || !Number.isInteger(item?.qty) || item.qty < 1 || item.qty > 20) {
      const error = new Error("Cart items are invalid");
      error.statusCode = 400;
      throw error;
    }
    const id = item.productId.toString();
    const qty = (quantities.get(id) || 0) + item.qty;
    if (qty > 20) {
      const error = new Error("Maximum quantity is 20 per product");
      error.statusCode = 400;
      throw error;
    }
    quantities.set(id, qty);
  }

  if (typeof coupon !== "string") {
    const error = new Error("Coupon code is not valid");
    error.statusCode = 400;
    throw error;
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  if (byId.size !== quantities.size) {
    const error = new Error("One or more products are unavailable");
    error.statusCode = 409;
    throw error;
  }

  const orderItems = [];
  for (const [productId, qty] of quantities) {
    const product = byId.get(productId);
    if (product.stock < qty) {
      const error = new Error(`${product.name} has only ${product.stock} available`);
      error.statusCode = 409;
      throw error;
    }
    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.salePrice != null ? product.salePrice : product.price,
      qty,
      image: product.image,
      hsnCode: product.hsnCode,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingAmount = subtotal > 3000 ? 0 : 99;
  const giftWrapAmount = giftWrap ? 149 : 0;
  let couponRecord = null;
  let discountAmount = 0;
  if (coupon.trim()) {
    couponRecord = await Coupon.findOne({ code: coupon.trim().toUpperCase() });
    const invalidReason = getCouponState(couponRecord, subtotal);
    if (invalidReason) {
      const error = new Error(couponRecord ? invalidReason : "Coupon code is not valid");
      error.statusCode = 400;
      throw error;
    }
    discountAmount = calculateCouponDiscount(couponRecord, subtotal);
  }
  const totalAmount = Math.round((subtotal + shippingAmount + giftWrapAmount - discountAmount) * 100) / 100;
  const amountPaise = Math.round(totalAmount * 100);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100 || amountPaise > 50000000) {
    const error = new Error("Invalid checkout total");
    error.statusCode = 400;
    throw error;
  }
  return { quantities, productsById: byId, orderItems, totalAmount, amountPaise, subtotal, couponRecord, discountAmount };
}

async function reserveInventoryAndCreateOrder({ customerId, snapshot, shippingAddress, razorpayOrderId }) {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const customer = await Customer.findById(customerId).select("name email").session(session);
      if (!customer) {
        const error = new Error("Customer account not found");
        error.statusCode = 401;
        throw error;
      }
      const products = await Product.find({ _id: { $in: [...snapshot.quantities.keys()] } }).session(session);
      const latestById = new Map(products.map((product) => [product._id.toString(), product]));
      for (const [productId, qty] of snapshot.quantities) {
        const current = latestById.get(productId);
        const quoted = snapshot.productsById.get(productId);
        if (!current || current.stock < qty) {
          const error = new Error(`${quoted?.name || "A product"} no longer has enough stock`);
          error.statusCode = 409;
          throw error;
        }
        const currentPrice = current.salePrice != null ? current.salePrice : current.price;
        const quotedItem = snapshot.orderItems.find((item) => item.productId.toString() === productId);
        if (currentPrice !== quotedItem.price) {
          const error = new Error("A product price changed. Please review your cart and try again.");
          error.statusCode = 409;
          throw error;
        }
      }

      if (snapshot.couponRecord) {
        const currentCoupon = await Coupon.findById(snapshot.couponRecord._id).session(session);
        const invalidReason = getCouponState(currentCoupon, snapshot.subtotal);
        if (invalidReason || !currentCoupon || currentCoupon.code !== snapshot.couponRecord.code || calculateCouponDiscount(currentCoupon, snapshot.subtotal) !== snapshot.discountAmount) {
          const error = new Error(invalidReason || "Coupon terms changed. Apply the coupon again.");
          error.statusCode = 409;
          throw error;
        }
        const now = new Date();
        const claimFilter = {
          _id: currentCoupon._id,
          isActive: true,
          $and: [
            { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
            { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] },
          ],
        };
        if (currentCoupon.usageLimit != null) {
          claimFilter.$expr = {
            $lt: [
              { $add: [{ $ifNull: ["$usedCount", 0] }, { $ifNull: ["$reservedCount", 0] }] },
              currentCoupon.usageLimit,
            ],
          };
        }
        const claim = await Coupon.updateOne(claimFilter, { $inc: { reservedCount: 1 } }, { session });
        if (claim.matchedCount !== 1) {
          const error = new Error("This coupon has reached its usage limit. Try another code.");
          error.statusCode = 409;
          throw error;
        }
      }

      for (const [productId, qty] of snapshot.quantities) {
        const product = latestById.get(productId);
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty }, $set: { inStock: product.stock > qty } },
          { returnDocument: "after", session }
        );
        if (!updated) {
          const error = new Error(`${product.name} stock changed. Please try again.`);
          error.statusCode = 409;
          throw error;
        }
      }

      [order] = await Order.create([{
        customerId,
        shippingAddress,
        items: snapshot.orderItems,
        totalAmount: snapshot.totalAmount,
        couponId: snapshot.couponRecord?._id || null,
        couponCode: snapshot.couponRecord?.code || "",
        couponDiscount: snapshot.discountAmount,
        couponReserved: Boolean(snapshot.couponRecord),
        status: "Pending Payment",
        paymentStatus: "Pending",
        paymentProvider: "Razorpay",
        razorpayOrderId,
        paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
        inventoryReserved: true,
        hasUnreadAdminNotice: false,
      }], { session });
    });
    return order;
  } finally {
    await session.endSession();
  }
}

async function verifyCapturedPayment(order, paymentId) {
  const client = getRazorpay();
  let payment = await client.payments.fetch(paymentId);
  if (
    payment.order_id !== order.razorpayOrderId ||
    payment.amount !== Math.round(order.totalAmount * 100) ||
    payment.currency !== "INR"
  ) {
    const error = new Error("Payment details do not match this order");
    error.statusCode = 400;
    throw error;
  }
  if (payment.status === "authorized" && !payment.captured) {
    await client.payments.capture(payment.id, payment.amount, payment.currency);
    payment = await client.payments.fetch(payment.id);
  }
  if (payment.status !== "captured" || !payment.captured) {
    const error = new Error(payment.status === "failed" ? "Razorpay reports this payment as failed" : "Payment is not captured yet. Please wait a moment and try again.");
    error.statusCode = payment.status === "failed" ? 400 : 409;
    throw error;
  }
  return payment;
}

async function fulfillPaidOrder(localOrderId, payment) {
  const session = await mongoose.startSession();
  let order;
  let newlyPaid = false;
  try {
    await session.withTransaction(async () => {
      order = await Order.findById(localOrderId).session(session);
      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }
      if (order.paymentStatus === "Paid") return;
      if (order.paymentStatus !== "Pending" || order.razorpayOrderId !== payment.order_id) {
        const error = new Error("This payment order is no longer awaiting payment");
        error.statusCode = 409;
        throw error;
      }
      order.paymentStatus = "Paid";
      order.status = "Placed";
      order.razorpayPaymentId = payment.id;
      order.paymentMethod = payment.method || "";
      order.paymentFailureReason = "";
      order.paymentExpiresAt = null;
      order.paidAt = new Date();
      order.hasUnreadAdminNotice = true;
      if (order.couponReserved && order.couponId) {
        const claimed = await Coupon.updateOne(
          { _id: order.couponId, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1, usedCount: 1 } },
          { session }
        );
        if (claimed.matchedCount !== 1) {
          const error = new Error("Could not finalize the coupon redemption for this paid order");
          error.statusCode = 500;
          throw error;
        }
        order.couponReserved = false;
      }
      await order.save({ session });
      await Customer.findByIdAndUpdate(order.customerId, { cart: [] }, { session });
      newlyPaid = true;
    });
  } finally {
    await session.endSession();
  }

  order = await Order.findById(localOrderId).populate("customerId", "name email phone");
  if (newlyPaid && order?.customerId) {
    Promise.all([
      sendNewOrderEmail(order, order.customerId),
      sendInvoiceEmail(order.customerId, order),
    ]).catch((err) => console.warn("Payment captured, but order email failed:", err.message));
  }
  return order;
}

async function releaseFailedOrder(localOrderId, reason) {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findById(localOrderId).session(session);
      if (!order || order.paymentStatus !== "Pending") return;
      if (order.inventoryReserved) {
        for (const item of order.items) {
          if (!item.productId) continue;
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.qty }, $set: { inStock: true } },
            { session }
          );
        }
      }
      order.inventoryReserved = false;
      if (order.couponReserved && order.couponId) {
        await Coupon.updateOne(
          { _id: order.couponId, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1 } },
          { session }
        );
        order.couponReserved = false;
      }
      order.paymentStatus = "Failed";
      order.paymentFailureReason = String(reason || "Payment was not completed").slice(0, 200);
      order.paymentExpiresAt = null;
      order.status = "Cancelled";
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return order;
}

async function applyRefundResult(localOrderId, refund) {
  const session = await mongoose.startSession();
  let order;
  const paymentStatus = refund.status === "processed"
    ? "Refunded"
    : refund.status === "failed"
      ? "Refund Failed"
      : "Refund Pending";
  try {
    await session.withTransaction(async () => {
      order = await Order.findById(localOrderId).session(session);
      if (!order) return;
      if (paymentStatus !== "Refund Failed") {
        if (!order.inventoryReserved && order.status !== "Cancelled") {
          const error = new Error("Inventory is no longer reserved for this order");
          error.statusCode = 409;
          throw error;
        }
        if (order.inventoryReserved) {
          for (const item of order.items) {
            if (!item.productId) continue;
            await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.qty }, $set: { inStock: true } }, { session });
          }
          order.inventoryReserved = false;
        }
        order.status = "Cancelled";
      }
      order.paymentStatus = paymentStatus;
      order.razorpayRefundId = refund.id;
      if (paymentStatus === "Refund Failed") {
        order.paymentFailureReason = refund.error_description || "Razorpay could not complete the refund";
      } else {
        order.paymentFailureReason = "";
      }
      await order.save({ session });
    });
    return order;
  } finally {
    await session.endSession();
  }
}

async function reconcileGatewayOrder(order) {
  const client = getRazorpay();
  const gatewayOrder = await client.orders.fetch(order.razorpayOrderId);
  const response = await client.orders.fetchPayments(order.razorpayOrderId);
  const payments = response.items || [];
  for (const candidate of payments) {
    if (candidate.status === "captured" || candidate.status === "authorized") {
      try {
        const payment = await verifyCapturedPayment(order, candidate.id);
        return fulfillPaidOrder(order._id, payment);
      } catch (err) {
        if (err.statusCode === 409) throw err;
      }
    }
  }
  if (gatewayOrder.status === "paid") {
    const error = new Error("Razorpay order is paid but no captured payment was returned");
    error.statusCode = 409;
    throw error;
  }
  return releaseFailedOrder(order._id, "Payment was not completed before checkout expired");
}

router.post("/create-order", auth, rateLimit({ max: 10 }), async (req, res) => {
  try {
    const customerId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) return res.status(401).json({ message: "Invalid customer session" });
    const giftWrap = req.body.giftWrap ?? false;
    if (typeof giftWrap !== "boolean") return res.status(400).json({ message: "Invalid gift wrapping option" });

    const shippingAddress = getShippingAddress(req.body.shippingAddress);
    const snapshot = await makePaymentSnapshot(req.body.items, req.body.coupon || "", giftWrap);
    const client = getRazorpay();
    const gatewayOrder = await client.orders.create({
      amount: snapshot.amountPaise,
      currency: "INR",
      receipt: `sh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      notes: { customerId },
    });
    const order = await reserveInventoryAndCreateOrder({ customerId, snapshot, shippingAddress, razorpayOrderId: gatewayOrder.id });
    const customer = await Customer.findById(customerId).select("name email phone");

    res.status(201).json({
      localOrderId: order._id,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      customer: { name: shippingAddress.fullName || customer?.name, email: customer?.email, phone: shippingAddress.phone },
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    res.status(err.statusCode || 502).json({ message: err.statusCode ? err.message : "Could not start secure checkout. Please try again." });
  }
});

router.post("/verify-payment", auth, rateLimit({ max: 20 }), async (req, res) => {
  try {
    const { localOrderId, razorpay_order_id: gatewayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (![localOrderId, gatewayOrderId, paymentId, signature].every((value) => typeof value === "string")) {
      return res.status(400).json({ success: false, message: "Invalid payment details" });
    }
    if (!mongoose.Types.ObjectId.isValid(localOrderId)) return res.status(400).json({ success: false, message: "Invalid order reference" });

    const order = await Order.findOne({ _id: localOrderId, customerId: req.user.id });
    if (!order || order.razorpayOrderId !== gatewayOrderId) return res.status(404).json({ success: false, message: "Payment order not found" });
    if (order.paymentStatus === "Paid") return res.json({ success: true, orderId: order._id, paymentStatus: "Paid" });

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${paymentId}`).digest("hex");
    if (!safeEqualHex(expected, signature)) return res.status(400).json({ success: false, message: "Payment signature verification failed" });

    const payment = await verifyCapturedPayment(order, paymentId);
    const paidOrder = await fulfillPaidOrder(order._id, payment);
    res.json({ success: true, orderId: paidOrder._id, paymentStatus: paidOrder.paymentStatus });
  } catch (err) {
    console.error("Razorpay payment verification failed:", err.message);
    res.status(err.statusCode || 502).json({ success: false, message: err.statusCode ? err.message : "Could not verify payment. Your payment status is being checked." });
  }
});

router.post("/failure", auth, rateLimit({ max: 20 }), async (req, res) => {
  try {
    const { localOrderId, reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(localOrderId || "")) return res.status(400).json({ message: "Invalid order reference" });
    const order = await Order.findOne({ _id: localOrderId, customerId: req.user.id });
    if (!order) return res.status(404).json({ message: "Payment order not found" });
    if (order.paymentStatus === "Paid") return res.json({ success: true, paymentStatus: "Paid", orderId: order._id });
    if (order.paymentStatus === "Pending" && order.razorpayOrderId) {
      try {
        const reconciled = await reconcileGatewayOrder(order);
        if (reconciled?.paymentStatus === "Paid") return res.json({ success: true, paymentStatus: "Paid", orderId: reconciled._id });
      } catch (reconcileError) {
        console.warn("Payment reconciliation deferred:", reconcileError.message);
        return res.status(202).json({ success: false, paymentStatus: "Pending", message: "We are still confirming your payment. Check your orders shortly." });
      }
    }
    const failed = await releaseFailedOrder(order._id, reason || "Checkout was closed or payment failed");
    res.json({ success: true, paymentStatus: failed?.paymentStatus || "Failed" });
  } catch (err) {
    console.error("Payment failure update failed:", err.message);
    res.status(500).json({ message: "Unable to update payment status" });
  }
});

router.post("/webhook", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  if (!webhookSecret || !req.rawBody || typeof signature !== "string") {
    return res.status(503).json({ message: "Payment webhook is not configured" });
  }
  const expected = crypto.createHmac("sha256", webhookSecret).update(req.rawBody).digest("hex");
  if (!safeEqualHex(expected, signature)) return res.status(400).json({ message: "Invalid webhook signature" });

  try {
    const event = req.body?.event;
    if (event === "payment.captured") {
      const entity = req.body.payload?.payment?.entity;
      const order = await Order.findOne({ razorpayOrderId: entity?.order_id, paymentStatus: "Pending" });
      if (order && entity?.id) {
        const payment = await verifyCapturedPayment(order, entity.id);
        await fulfillPaidOrder(order._id, payment);
      }
    } else if (event === "payment.failed") {
      const entity = req.body.payload?.payment?.entity;
      const order = await Order.findOne({ razorpayOrderId: entity?.order_id, paymentStatus: "Pending" });
      if (order && entity?.id) {
        const payment = await getRazorpay().payments.fetch(entity.id);
        if (payment.order_id === order.razorpayOrderId && payment.status === "failed") {
          await Order.updateOne(
            { _id: order._id, paymentStatus: "Pending" },
            { $set: { paymentFailureReason: String(payment.error_description || "Payment attempt failed; checkout may be retried").slice(0, 200) } }
          );
        }
      }
    } else if (event === "refund.processed" || event === "refund.failed") {
      const refund = req.body.payload?.refund?.entity;
      if (refund?.id) {
        const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
        if (order) await applyRefundResult(order._id, refund);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook processing failed:", err.message);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

router.get("/admin/summary", auth, adminOnly, async (req, res) => {
  try {
    const counts = await Order.aggregate([
      { $match: { paymentStatus: { $in: ["Pending", "Paid", "Failed", "Refund Pending", "Refunded", "Refund Failed"] } } },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } },
    ]);
    res.json(counts.reduce((result, row) => {
      result[row._id] = { count: row.count, amount: row.amount };
      return result;
    }, {}));
  } catch (err) {
    console.error("Payment summary failed:", err.message);
    res.status(500).json({ message: "Unable to load payment summary" });
  }
});

router.get("/admin", auth, adminOnly, async (req, res) => {
  try {
    const payments = await Order.find({ paymentStatus: { $in: ["Pending", "Paid", "Failed", "Refund Pending", "Refunded", "Refund Failed"] } })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ payments });
  } catch (err) {
    console.error("Admin payments list failed:", err.message);
    res.status(500).json({ message: "Unable to load payments" });
  }
});

router.post("/admin/:orderId/refund", auth, adminOnly, async (req, res) => {
  let order;
  let refundClaimed = false;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) return res.status(400).json({ message: "Invalid order ID" });
    order = await Order.findById(req.params.orderId);
    if (!order || !order.razorpayPaymentId) return res.status(404).json({ message: "Captured payment not found" });
    if (!["Paid", "Refund Failed"].includes(order.paymentStatus)) return res.status(409).json({ message: "This payment cannot be refunded" });
    if (order.paymentStatus === "Paid" && !["Placed", "Processing"].includes(order.status)) {
      return res.status(409).json({ message: "Only unshipped orders can be refunded here" });
    }

    order = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $in: ["Paid", "Refund Failed"] }, status: { $in: ["Placed", "Processing", "Cancelled"] } },
      { $set: { paymentStatus: "Refund Pending", paymentFailureReason: "" } },
      { returnDocument: "after" }
    );
    if (!order) return res.status(409).json({ message: "A refund is already being processed for this payment" });
    refundClaimed = true;

    const client = getRazorpay();
    const refundList = await client.payments.fetchMultipleRefund(order.razorpayPaymentId, { count: 100 });
    const existingRefund = (refundList.items || []).find((item) =>
      item.notes?.orderId === order._id.toString() && item.amount === Math.round(order.totalAmount * 100) && item.status !== "failed"
    );
    const refund = existingRefund || await client.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100),
      notes: { orderId: order._id.toString() },
    });
    const updated = await applyRefundResult(order._id, refund);
    res.json({ success: true, paymentStatus: updated.paymentStatus, refundId: refund.id });
  } catch (err) {
    console.error("Refund request failed:", err.message);
    if (order && refundClaimed) {
      await Order.updateOne(
        { _id: order._id, paymentStatus: "Refund Pending" },
        { $set: { paymentStatus: "Refund Failed", paymentFailureReason: String(err.message).slice(0, 200) } }
      ).catch(() => {});
    }
    res.status(err.statusCode || 502).json({ message: err.statusCode ? err.message : "Razorpay could not process the refund" });
  }
});

async function reconcileExpiredPayments() {
  const expired = await Order.find({
    paymentStatus: "Pending",
    paymentExpiresAt: { $lte: new Date() },
    razorpayOrderId: { $ne: null },
  }).limit(20);
  for (const order of expired) {
    try {
      await reconcileGatewayOrder(order);
    } catch (err) {
      console.warn(`Payment reconciliation deferred for order ${order._id}:`, err.message);
    }
  }

  const staleRefunds = await Order.find({
    paymentStatus: "Refund Pending",
    updatedAt: { $lte: new Date(Date.now() - 3 * 60 * 1000) },
  }).limit(20);
  for (const order of staleRefunds) {
    try {
      const refunds = await getRazorpay().payments.fetchMultipleRefund(order.razorpayPaymentId, { count: 100 });
      const refund = (refunds.items || []).find((item) => item.notes?.orderId === order._id.toString());
      if (refund) {
        await applyRefundResult(order._id, refund);
      } else {
        await Order.updateOne(
          { _id: order._id, paymentStatus: "Refund Pending" },
          { $set: { paymentStatus: "Refund Failed", paymentFailureReason: "Refund status could not be confirmed. Retry from the admin payments page." } }
        );
      }
    } catch (err) {
      console.warn(`Refund reconciliation deferred for order ${order._id}:`, err.message);
    }
  }
}

module.exports = router;
module.exports.reconcileExpiredPayments = reconcileExpiredPayments;

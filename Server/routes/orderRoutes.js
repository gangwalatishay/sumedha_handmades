const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Customer = require("../models/Customer");

const sendOrderStatusEmail = require("../utils/sendOrderStatusEmail");
const generateInvoice = require("../utils/generateInvoice");
const { getInvoiceBuffer } = require("../utils/generateInvoice");
const transitionOrderStatus = require("../utils/transitionOrderStatus");

const auth = require("../middleware/authMiddleware");

/* =====================================================
   🛒 PLACE NEW ORDER (CUSTOMER)
===================================================== */
router.post("/", auth, (req, res) => {
  res.status(410).json({ message: "Use the secure Razorpay checkout to place orders" });
});

/* =====================================================
   📦 GET LOGGED-IN CUSTOMER ORDERS
===================================================== */
router.get("/customer", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("❌ FETCH ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* =====================================================
   ❌ CANCEL ORDER (CUSTOMER)
===================================================== */
router.put("/cancel/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await transitionOrderStatus(orderId, "Cancelled", { customerId }, ["Placed"]);

    if (order.customerId?.email) {
      sendOrderStatusEmail({
        to: order.customerId.email,
        customerName: order.customerId.name,
        orderId: order._id.toString(),
        status: "Cancelled",
      }).catch((err) => console.warn("Order cancelled, but customer email failed:", err.message));
    }

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error("❌ Cancel order error:", err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : "Failed to cancel order" });
  }
});

/* =====================================================
   📄 DOWNLOAD INVOICE (CUSTOMER)
===================================================== */
router.get("/invoice/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const customer = await Customer.findById(customerId);

    generateInvoice(order, customer, res);
  } catch (err) {
    console.error("❌ Invoice error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
});

router.get("/admin/invoice/:orderId/pdf", auth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) return res.status(400).json({ message: "Invalid invoice ID" });
    const order = await Order.findOne({
      _id: req.params.orderId,
      status: { $in: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"] },
      $or: [{ paymentStatus: "Paid" }, { paymentStatus: "Not Recorded" }, { paymentStatus: { $exists: false } }],
    }).populate("customerId", "name email phone address");
    if (!order) return res.status(404).json({ message: "A paid invoice for this order was not found" });
    const pdf = await getInvoiceBuffer(order, order.customerId);
    const invoiceNo = `INV-${order._id.toString().slice(-6)}`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoiceNo}.pdf`);
    res.send(pdf);
  } catch (error) {
    console.error("Admin invoice PDF failed:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "Could not generate this invoice" });
  }
});

/* =====================================================
   🔔 ADMIN — CHECK NEW ORDERS
===================================================== */
router.get("/has-new", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Keep recognizing pre-rename orders until the admin marks them seen.
    const newCount = await Order.collection.countDocuments({
      $or: [{ hasUnreadAdminNotice: true }, { isNew: true }],
    });
    res.json({ hasNew: newCount > 0, newCount });
  } catch (err) {
    console.error("❌ CHECK NEW ERROR:", err);
    res.status(500).json({ message: "Failed to check new orders" });
  }
});

/* =====================================================
   👀 ADMIN — MARK ORDERS AS SEEN
===================================================== */
router.put("/mark-seen", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Order.updateMany(
      { hasUnreadAdminNotice: true },
      { $set: { hasUnreadAdminNotice: false } }
    );
    await Order.collection.updateMany(
      { isNew: true },
      { $unset: { isNew: "" } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ MARK SEEN ERROR:", err);
    res.status(500).json({ message: "Failed to update orders" });
  }
});

/* =====================================================
   🔄 ADMIN — UPDATE ORDER STATUS
===================================================== */
router.put("/:orderId/status", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "Placed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await transitionOrderStatus(orderId, status);

    if (order.customerId?.email) {
      sendOrderStatusEmail({
        to: order.customerId.email,
        customerName: order.customerId.name,
        orderId: order._id.toString(),
        status,
      }).catch((err) => console.warn("Order updated, but customer email failed:", err.message));
    }

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    console.error("❌ STATUS UPDATE ERROR:", err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : "Failed to update order status" });
  }
});
/* =====================================================
   🔍 VERIFY INVOICE (PUBLIC)
===================================================== */
router.get("/verify-invoice/:invoiceNo", async (req, res) => {
  try {
    const { invoiceNo } = req.params;

    if (!/^INV-[a-f0-9]{6}$/i.test(invoiceNo || "")) {
      return res.status(400).json({ message: "Invalid invoice number" });
    }

    // Invoice IDs use the final six hexadecimal characters of the ObjectId.
    const suffix = invoiceNo.slice(4);
    const [order] = await Order.aggregate([
      { $addFields: { invoiceObjectId: { $toString: "$_id" } } },
      { $match: { invoiceObjectId: { $regex: `${suffix}$`, $options: "i" } } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $project: { status: 1, createdAt: 1 } },
    ]);

    if (!order) {
      return res.status(404).json({
        verified: false,
        message: "Invoice not found",
      });
    }

    res.json({
      verified: true,
      invoiceNo,
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error("❌ Invoice verification error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});
const archiver = require("archiver");
const { getInvoiceBuffer } = require("../utils/generateInvoice");

/* =====================================================
   📦 ADMIN — BULK INVOICE ZIP DOWNLOAD
===================================================== */
router.get("/admin/invoices/zip", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { from, to } = req.query;
    const eligibleStatuses = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
    const requestedStatus = req.query.status;
    if (requestedStatus && !eligibleStatuses.includes(requestedStatus)) {
      return res.status(400).json({ message: "Choose a valid invoice status" });
    }

    const query = {
      status: requestedStatus || { $in: eligibleStatuses },
      $or: [{ paymentStatus: "Paid" }, { paymentStatus: "Not Recorded" }, { paymentStatus: { $exists: false } }],
    };
    if (from || to) {
      const start = from ? new Date(`${from}T00:00:00.000Z`) : null;
      const end = to ? new Date(`${to}T23:59:59.999Z`) : null;
      if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime())) || (start && end && start > end)) {
        return res.status(400).json({ message: "Choose a valid invoice date range" });
      }
      query.createdAt = { ...(start && { $gte: start }), ...(end && { $lte: end }) };
    }

    const orders = await Order.find(query).populate("customerId");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    /* ---------- ZIP HEADERS ---------- */
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=invoices.zip"
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    /* ---------- ADD PDFS ---------- */
    for (const order of orders) {
      const customer = order.customerId;

      const pdfBuffer = await getInvoiceBuffer(order, customer, {
        watermark: true,
      });

      const invoiceNo = `INV-${order._id.toString().slice(-6)}`;

      archive.append(pdfBuffer, {
        name: `${invoiceNo}.pdf`,
      });
    }

    await archive.finalize();
  } catch (err) {
    console.error("❌ Bulk ZIP error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate ZIP" });
    }
  }
});
router.get("/admin/all", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }

  const orders = await Order.find()
    .populate("customerId", "name email")
    .sort({ createdAt: -1 });

  res.json({ orders });
});


module.exports = router;

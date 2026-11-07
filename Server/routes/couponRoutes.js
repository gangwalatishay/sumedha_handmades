const express = require("express");
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");
const { getCouponState, calculateCouponDiscount } = require("../utils/couponPricing");

const router = express.Router();

function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
  next();
}

function parseCoupon(body) {
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountType = body.discountType;
  const discountValue = Number(body.discountValue);
  const minOrderAmount = Number(body.minOrderAmount || 0);
  const maxDiscountAmount = body.maxDiscountAmount === "" || body.maxDiscountAmount == null ? null : Number(body.maxDiscountAmount);
  const usageLimit = body.usageLimit === "" || body.usageLimit == null ? null : Number(body.usageLimit);
  const startsAt = body.startsAt ? new Date(body.startsAt) : null;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) throw new Error("Use 3–32 letters, numbers, hyphens or underscores for the code");
  if (!["percent", "fixed"].includes(discountType)) throw new Error("Choose a percentage or fixed discount");
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === "percent" && discountValue > 100)) throw new Error("Enter a valid discount amount");
  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) throw new Error("Minimum order amount cannot be negative");
  if (maxDiscountAmount !== null && (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)) throw new Error("Maximum discount must be greater than zero");
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) throw new Error("Usage limit must be a positive whole number");
  if ((startsAt && Number.isNaN(startsAt.getTime())) || (expiresAt && Number.isNaN(expiresAt.getTime()))) throw new Error("Enter valid availability dates");
  if (startsAt && expiresAt && startsAt >= expiresAt) throw new Error("Expiry must be after the start date");

  return {
    code,
    description: String(body.description || "").trim().slice(0, 160),
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    startsAt,
    expiresAt,
    isActive: body.isActive !== false,
  };
}

function adminError(res, error) {
  if (error.code === 11000) return res.status(409).json({ message: "A coupon with this code already exists" });
  return res.status(400).json({ message: error.message || "Coupon could not be saved" });
}

router.post("/validate", rateLimit({ max: 20 }), async (req, res) => {
  try {
    const code = typeof req.body.code === "string" ? req.body.code.trim().toUpperCase() : "";
    const items = req.body.items;
    if (!code || !Array.isArray(items) || !items.length || items.length > 20) return res.status(400).json({ message: "Enter a coupon code and add items to your cart" });

    const quantities = new Map();
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item?.productId) || !Number.isInteger(item?.qty) || item.qty < 1 || item.qty > 20) return res.status(400).json({ message: "Cart items are invalid" });
      const id = String(item.productId);
      const quantity = (quantities.get(id) || 0) + item.qty;
      if (quantity > 20) return res.status(400).json({ message: "Maximum quantity is 20 per product" });
      quantities.set(id, quantity);
    }
    const [coupon, products] = await Promise.all([
      Coupon.findOne({ code }),
      Product.find({ _id: { $in: [...quantities.keys()] } }).select("price salePrice stock"),
    ]);
    if (!coupon) return res.status(404).json({ message: "That coupon code is not valid" });
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    if (byId.size !== quantities.size) return res.status(409).json({ message: "One or more cart items are unavailable" });
    let subtotal = 0;
    for (const [id, qty] of quantities) {
      const product = byId.get(id);
      if (product.stock < qty) return res.status(409).json({ message: "Your cart has an item with insufficient stock" });
      subtotal += (product.salePrice != null ? product.salePrice : product.price) * qty;
    }
    const invalidReason = getCouponState(coupon, subtotal);
    if (invalidReason) return res.status(400).json({ message: invalidReason });
    return res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: calculateCouponDiscount(coupon, subtotal),
      subtotal,
      description: coupon.description,
      itemPrices: [...quantities.keys()].map((id) => {
        const product = byId.get(id);
        return { productId: id, price: product.salePrice != null ? product.salePrice : product.price, stock: product.stock };
      }),
    });
  } catch (error) {
    console.error("Coupon validation failed:", error.message);
    return res.status(500).json({ message: "Could not validate this coupon right now" });
  }
});

router.get("/admin", auth, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: "Could not load coupons" });
  }
});

router.post("/admin", auth, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(parseCoupon(req.body));
    res.status(201).json({ coupon, message: "Coupon created" });
  } catch (error) {
    adminError(res, error);
  }
});

router.put("/admin/:id", auth, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid coupon ID" });
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    const changes = parseCoupon(req.body);
    Object.assign(coupon, changes);
    await coupon.save();
    res.json({ coupon, message: "Coupon updated" });
  } catch (error) {
    adminError(res, error);
  }
});

router.delete("/admin/:id", auth, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid coupon ID" });
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { returnDocument: "after" });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ coupon, message: "Coupon deactivated. Existing paid orders are unchanged." });
  } catch (error) {
    res.status(500).json({ message: "Coupon could not be deactivated" });
  }
});

module.exports = router;

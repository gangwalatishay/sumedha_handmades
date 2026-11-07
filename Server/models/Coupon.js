const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 3, maxlength: 32, match: /^[A-Z0-9_-]+$/ },
  description: { type: String, trim: true, maxlength: 160, default: "" },
  discountType: { type: String, enum: ["percent", "fixed"], required: true },
  discountValue: { type: Number, required: true, min: 0.01 },
  minOrderAmount: { type: Number, min: 0, default: 0 },
  maxDiscountAmount: { type: Number, min: 0, default: null },
  startsAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  usageLimit: { type: Number, min: 1, default: null },
  usedCount: { type: Number, min: 0, default: 0 },
  reservedCount: { type: Number, min: 0, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);

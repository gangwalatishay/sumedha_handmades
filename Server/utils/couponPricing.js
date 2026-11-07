function getCouponState(coupon, subtotal, now = new Date()) {
  if (!coupon || !coupon.isActive) return "This coupon is not active";
  if (coupon.startsAt && coupon.startsAt > now) return "This coupon is not available yet";
  if (coupon.expiresAt && coupon.expiresAt < now) return "This coupon has expired";
  if (Number(coupon.usageLimit) > 0 && Number(coupon.usedCount || 0) + Number(coupon.reservedCount || 0) >= coupon.usageLimit) {
    return "This coupon has reached its usage limit";
  }
  if (subtotal < Number(coupon.minOrderAmount || 0)) {
    return `Add items worth ₹${Number(coupon.minOrderAmount).toLocaleString("en-IN")} to use this coupon`;
  }
  return "";
}

function calculateCouponDiscount(coupon, subtotal) {
  const rawDiscount = coupon.discountType === "percent"
    ? subtotal * Number(coupon.discountValue) / 100
    : Number(coupon.discountValue);
  const cappedDiscount = coupon.maxDiscountAmount == null
    ? rawDiscount
    : Math.min(rawDiscount, Number(coupon.maxDiscountAmount));
  return Math.round(Math.min(subtotal, cappedDiscount) * 100) / 100;
}

module.exports = { getCouponState, calculateCouponDiscount };

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    hsnCode: { type: String, default: "7117" },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    // Optional for older orders created before delivery details were collected.
    shippingAddress: { type: shippingAddressSchema },
    items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
    totalAmount: { type: Number, required: true, min: 0.01 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, min: 0, default: 0 },
    couponReserved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending Payment", "Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    paymentStatus: {
      type: String,
      enum: ["Not Recorded", "Pending", "Paid", "Failed", "Refund Pending", "Refunded", "Refund Failed"],
      default: "Not Recorded",
      index: true,
    },
    paymentProvider: { type: String, enum: ["Razorpay", null], default: null },
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null, index: true },
    razorpayRefundId: { type: String, default: null },
    paymentMethod: { type: String, default: "" },
    paymentFailureReason: { type: String, default: "" },
    paymentExpiresAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    inventoryReserved: { type: Boolean, default: false },
    hasUnreadAdminNotice: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

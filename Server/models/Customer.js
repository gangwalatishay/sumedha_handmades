const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // 👤 BASIC INFO
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: null,
    },

    // ✅ ADMIN ACCESS
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ❤️ WISHLIST
    wishlist: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        image: String,
      },
    ],

    // 🛒 CART
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        image: String,
        qty: {
          type: Number,
          default: 1,
        },
      },
    ],

    // 🔐 LOGIN HISTORY
    loginHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        ip: String,
        userAgent: String,
      },
    ],

    // 🔐 OTP / AUTH
    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    passwordResetVerifiedAt: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);

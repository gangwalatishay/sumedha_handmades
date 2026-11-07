const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const auth = require("../middleware/authMiddleware");
const sendOrderStatusEmail = require("../utils/sendOrderStatusEmail");
const transitionOrderStatus = require("../utils/transitionOrderStatus");

/* =====================================
   🛡️ ADMIN GUARD
===================================== */
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/* =====================================
   📦 GET ALL ORDERS (ADMIN)
===================================== */
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ orders });
  } catch (err) {
    console.error("Admin order list error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/* =====================================
   🔄 UPDATE ORDER STATUS (ADMIN)
===================================== */
router.put("/:orderId/status", auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "Placed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await transitionOrderStatus(req.params.orderId, status);

    if (order.customerId?.email) {
      sendOrderStatusEmail({
        to: order.customerId.email,
        customerName: order.customerId.name,
        orderId: order._id.toString(),
        status,
      }).catch((err) => console.warn("Order updated, but customer email failed:", err.message));
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Admin order status update error:", err);
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : "Failed to update order status",
    });
  }
});

module.exports = router;

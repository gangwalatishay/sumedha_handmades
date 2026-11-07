const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const validNextStatuses = {
  Placed: ["Processing", "Shipped", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery", "Delivered"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

async function transitionOrderStatus(orderId, status, filters = {}, allowedFrom = null) {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findOne({ _id: orderId, ...filters })
        .populate("customerId", "name email phone")
        .session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (allowedFrom && !allowedFrom.includes(order.status)) {
        const error = new Error("Order cannot be cancelled now");
        error.statusCode = 400;
        throw error;
      }

      if (status === "Cancelled" && order.paymentStatus === "Paid") {
        const error = new Error("Refund the captured payment before cancelling this order");
        error.statusCode = 409;
        throw error;
      }

      if (status !== order.status && !validNextStatuses[order.status]?.includes(status)) {
        const error = new Error(`Cannot change an order from ${order.status} to ${status}`);
        error.statusCode = 400;
        throw error;
      }

      if (status === "Cancelled" && order.status !== "Cancelled" && order.inventoryReserved) {
        for (const item of order.items) {
          if (!item.productId) continue;
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.qty }, $set: { inStock: true } },
            { session }
          );
        }
        order.inventoryReserved = false;
      }

      order.status = status;
      order.hasUnreadAdminNotice = false;
      await order.save({ session });
    });
    return order;
  } finally {
    await session.endSession();
  }
}

module.exports = transitionOrderStatus;

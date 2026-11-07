const express = require("express");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

function parseDateRange(from, to) {
  const end = to ? new Date(`${to}T23:59:59.999`) : new Date();
  const start = from
    ? new Date(`${from}T00:00:00.000`)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return null;
  }
  return { start, end };
}

// Admin dashboard metrics for the selected date range.
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const range = parseDateRange(req.query.from, req.query.to);
    if (!range) {
      return res.status(400).json({ message: "Choose a valid date range" });
    }

    const dateMatch = { createdAt: { $gte: range.start, $lte: range.end } };
    const [summaryRows, dailyRows, userRows, statusRows, topProducts, lifetimeRows, totalCustomers] =
      await Promise.all([
        Order.aggregate([
          { $match: dateMatch },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              activeOrders: {
                $sum: {
                  $cond: [
                    { $not: [{ $in: ["$status", ["Cancelled", "Pending Payment"]] }] },
                    1,
                    0,
                  ],
                },
              },
              revenue: {
                $sum: {
                  $cond: [{ $ne: ["$status", "Cancelled"] }, "$totalAmount", 0],
                },
              },
              paidRevenue: {
                $sum: {
                  $cond: [
                    { $and: [{ $ne: ["$status", "Cancelled"] }, { $eq: ["$paymentStatus", "Paid"] }] },
                    "$totalAmount",
                    0,
                  ],
                },
              },
              paidOrders: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] } },
            },
          },
        ]),
        Order.aggregate([
          { $match: dateMatch },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              orders: { $sum: 1 },
              revenue: {
                $sum: {
                  $cond: [{ $ne: ["$status", "Cancelled"] }, "$totalAmount", 0],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Customer.aggregate([
          { $match: { createdAt: { $gte: range.start, $lte: range.end }, isAdmin: { $ne: true } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              users: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: dateMatch },
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { ...dateMatch, paymentStatus: "Paid", status: { $ne: "Cancelled" } } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.name",
              units: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
            },
          },
          { $sort: { units: -1 } },
          { $limit: 5 },
        ]),
        Order.aggregate([
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              activeOrders: {
                $sum: {
                  $cond: [
                    { $not: [{ $in: ["$status", ["Cancelled", "Pending Payment"]] }] },
                    1,
                    0,
                  ],
                },
              },
              paidRevenue: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ["$paymentStatus", "Paid"] }, { $ne: ["$status", "Cancelled"] }] },
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]),
        Customer.countDocuments({ isAdmin: { $ne: true } }),
      ]);

    const summary = summaryRows[0] || {
      totalOrders: 0,
      activeOrders: 0,
      revenue: 0,
      paidRevenue: 0,
      paidOrders: 0,
    };
    const lifetimeSummary = lifetimeRows[0] || { totalOrders: 0, activeOrders: 0, paidRevenue: 0 };

    res.json({
      range: { from: range.start, to: range.end },
      summary: {
        ...summary,
        averageOrderValue: summary.paidOrders
          ? summary.paidRevenue / summary.paidOrders
          : 0,
      },
      totals: { ...lifetimeSummary, totalCustomers },
      orders: dailyRows,
      users: userRows,
      statusCounts: statusRows.reduce((counts, row) => {
        counts[row._id || "Unknown"] = row.count;
        return counts;
      }, {}),
      topProducts,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Unable to load analytics" });
  }
});

module.exports = router;

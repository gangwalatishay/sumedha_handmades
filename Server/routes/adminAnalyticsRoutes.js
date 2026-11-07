// const express = require("express");
// const router = express.Router();
// const Customer = require("../models/Customer");
// const Order = require("../models/Order");
// const auth = require("../middleware/authMiddleware");

// // 👥 Customer stats
// router.get("/customers", async (req, res) => {
//   const totalCustomers = await Customer.countDocuments();

//   const last7Days = new Date();
//   last7Days.setDate(last7Days.getDate() - 7);

//   const newCustomers = await Customer.countDocuments({
//     createdAt: { $gte: last7Days },
//   });

//   res.json({
//     totalCustomers,
//     newCustomers,
//   });
// });

// // 📦 Order stats
// router.get("/orders", async (req, res) => {
//   const orders = await Order.find();

//   const totalOrders = orders.length;
//   const revenue = orders.reduce(
//     (sum, o) => sum + o.totalAmount,
//     0
//   );

//   res.json({
//     totalOrders,
//     revenue,
//   });
// });

// // ❤️ Most wishlisted products
// router.get("/wishlist", async (req, res) => {
//   const customers = await Customer.find();

//   const productMap = {};

//   customers.forEach((c) => {
//     c.wishlist.forEach((item) => {
//       productMap[item.name] =
//         (productMap[item.name] || 0) + 1;
//     });
//   });

//   res.json(productMap);
// });
// /* =====================================================
//    📊 ADMIN — INVOICE ANALYTICS
// ===================================================== */
// router.get("/invoices", auth, async (req, res) => {
//   try {
//     if (!req.user.isAdmin) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const orders = await Order.find();

//     /* ---------- BASIC STATS ---------- */
//     const totalInvoices = orders.length;
//     const totalRevenue = orders.reduce(
//       (sum, o) => sum + o.totalAmount,
//       0
//     );

//     const avgOrderValue = totalInvoices
//       ? (totalRevenue / totalInvoices).toFixed(2)
//       : 0;

//     /* ---------- GST ---------- */
//     let gstCollected = 0;
//     orders.forEach((o) => {
//       gstCollected += o.totalAmount * 0.18;
//     });

//     /* ---------- STATUS COUNT ---------- */
//     const statusCount = {};
//     orders.forEach((o) => {
//       statusCount[o.status] = (statusCount[o.status] || 0) + 1;
//     });

//     /* ---------- DAILY REVENUE ---------- */
//     const dailyRevenue = {};
//     orders.forEach((o) => {
//       const date = o.createdAt.toISOString().slice(0, 10);
//       dailyRevenue[date] =
//         (dailyRevenue[date] || 0) + o.totalAmount;
//     });

//     /* ---------- TOP PRODUCTS ---------- */
//     const productMap = {};
//     orders.forEach((o) => {
//       o.items.forEach((item) => {
//         productMap[item.name] =
//           (productMap[item.name] || 0) + item.qty;
//       });
//     });

//     const topProducts = Object.entries(productMap)
//       .map(([name, qty]) => ({ name, qty }))
//       .sort((a, b) => b.qty - a.qty)
//       .slice(0, 5);

//     res.json({
//       summary: {
//         totalInvoices,
//         totalRevenue,
//         gstCollected: gstCollected.toFixed(2),
//         avgOrderValue,
//       },
//       statusCount,
//       dailyRevenue,
//       topProducts,
//     });
//   } catch (err) {
//     console.error("❌ Analytics error:", err);
//     res.status(500).json({ message: "Analytics failed" });
//   }
// });
// const { Parser } = require("json2csv");

// router.get("/invoices/export/csv", auth, async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const orders = await Order.find();

//   const rows = orders.map((o) => ({
//     InvoiceNo: o._id.toString().slice(-6),
//     Date: o.createdAt.toISOString().slice(0, 10),
//     Total: o.totalAmount,
//     GST: (o.totalAmount * 0.18).toFixed(2),
//     Status: o.status,
//   }));

//   const parser = new Parser();
//   const csv = parser.parse(rows);

//   res.header("Content-Type", "text/csv");
//   res.attachment("invoice-analytics.csv");
//   return res.send(csv);
// });
// router.get("/invoice/:orderId", auth, async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const order = await Order.findById(req.params.orderId)
//     .populate("customerId");

//   if (!order) {
//     return res.status(404).json({ message: "Invoice not found" });
//   }

//   res.json({
//     invoiceNo: order._id.toString().slice(-6),
//     customer: order.customerId,
//     items: order.items,
//     total: order.totalAmount,
//     gst: (order.totalAmount * 0.18).toFixed(2),
//     status: order.status,
//     createdAt: order.createdAt,
//   });
// });
// router.get("/analytics/invoices", auth, async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const summaryAgg = await Order.aggregate([
//     {
//       $group: {
//         _id: null,
//         totalRevenue: { $sum: "$totalAmount" },
//         totalInvoices: { $sum: 1 },
//       },
//     },
//   ]);

//   const statusAgg = await Order.aggregate([
//     { $group: { _id: "$status", count: { $sum: 1 } } },
//   ]);

//   const monthlyAgg = await Order.aggregate([
//     {
//       $group: {
//         _id: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//         },
//         revenue: { $sum: "$totalAmount" },
//       },
//     },
//     { $sort: { "_id.year": 1, "_id.month": 1 } },
//   ]);

//   const statusCount = {};
//   statusAgg.forEach(s => statusCount[s._id] = s.count);

//   res.json({
//     summary: {
//       totalRevenue: summaryAgg[0]?.totalRevenue || 0,
//       totalInvoices: summaryAgg[0]?.totalInvoices || 0,
//       gstCollected: ((summaryAgg[0]?.totalRevenue || 0) * 0.18).toFixed(2),
//       avgOrderValue:
//         summaryAgg[0]
//           ? (summaryAgg[0].totalRevenue / summaryAgg[0].totalInvoices).toFixed(2)
//           : 0,
//     },
//     statusCount,
//     monthlyRevenue: monthlyAgg.map(m => ({
//       month: `${m._id.month}/${m._id.year}`,
//       revenue: m.revenue,
//     })),
//   });
// });
// router.get("/analytics/gst/monthly", auth, async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const gstAgg = await Order.aggregate([
//     {
//       $group: {
//         _id: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//         },
//         taxableValue: { $sum: "$totalAmount" },
//       },
//     },
//     { $sort: { "_id.year": 1, "_id.month": 1 } },
//   ]);

//   res.json(
//     gstAgg.map(g => ({
//       month: `${g._id.month}/${g._id.year}`,
//       taxableValue: g.taxableValue.toFixed(2),
//       cgst: (g.taxableValue * 0.09).toFixed(2),
//       sgst: (g.taxableValue * 0.09).toFixed(2),
//       igst: (g.taxableValue * 0.18).toFixed(2),
//       totalGST: (g.taxableValue * 0.18).toFixed(2),
//     }))
//   );
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const { Parser } = require("json2csv");

const Customer = require("../models/Customer");
const Order = require("../models/Order");
const auth = require("../middleware/authMiddleware");

const invoiceStatuses = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

function getInvoiceQuery(query = {}) {
  const clauses = [
    { status: { $in: invoiceStatuses } },
    { $or: [{ paymentStatus: "Paid" }, { paymentStatus: "Not Recorded" }, { paymentStatus: { $exists: false } }] },
  ];
  if (query.status && query.status !== "All statuses") {
    if (!invoiceStatuses.includes(query.status)) throw new Error("Choose a valid invoice status");
    clauses.push({ status: query.status });
  }
  if (query.from || query.to) {
    const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : null;
    const to = query.to ? new Date(`${query.to}T23:59:59.999Z`) : null;
    if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime())) || (from && to && from > to)) {
      throw new Error("Choose a valid invoice date range");
    }
    clauses.push({ createdAt: { ...(from && { $gte: from }), ...(to && { $lte: to }) } });
  }
  return { $and: clauses };
}

/* =====================================================
   👥 ADMIN — CUSTOMER ANALYTICS
===================================================== */
router.get("/customers", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalCustomers = await Customer.countDocuments();

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: last7Days },
    });

    res.json({ totalCustomers, newCustomers });
  } catch (err) {
    console.error("❌ Customer analytics error:", err);
    res.status(500).json({ message: "Failed to fetch customer analytics" });
  }
});

/* =====================================================
   📦 ADMIN — ORDER ANALYTICS
===================================================== */
router.get("/orders", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find();

    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({ totalOrders, revenue });
  } catch (err) {
    console.error("❌ Order analytics error:", err);
    res.status(500).json({ message: "Failed to fetch order analytics" });
  }
});

/* =====================================================
   ❤️ ADMIN — MOST WISHLISTED PRODUCTS
===================================================== */
router.get("/wishlist", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const customers = await Customer.find();
    const productMap = {};

    customers.forEach((c) => {
      (c.wishlist || []).forEach((item) => {
        productMap[item.name] = (productMap[item.name] || 0) + 1;
      });
    });

    res.json(productMap);
  } catch (err) {
    console.error("❌ Wishlist analytics error:", err);
    res.status(500).json({ message: "Failed to fetch wishlist analytics" });
  }
});

/* =====================================================
   📊 ADMIN — INVOICE ANALYTICS DASHBOARD
===================================================== */
router.get("/invoices", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    const match = getInvoiceQuery(req.query);
    const [summaryRows, statusRows, dailyRows, productRows, invoiceCount, invoices] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          paidInvoices: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] } },
        } },
      ]),
      Order.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, invoices: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", units: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
        { $sort: { units: -1 } },
        { $limit: 5 },
      ]),
      Order.countDocuments(match),
      Order.find(match).populate("customerId", "name email").sort({ createdAt: -1 }).limit(500).lean(),
    ]);
    const summary = summaryRows[0] || { totalInvoices: 0, totalRevenue: 0, paidInvoices: 0 };

    res.json({
      summary: {
        ...summary,
        averageInvoiceValue: summary.totalInvoices ? summary.totalRevenue / summary.totalInvoices : 0,
      },
      statusCount: statusRows.reduce((result, row) => ({ ...result, [row._id]: row.count }), {}),
      dailyRevenue: dailyRows,
      topProducts: productRows,
      invoices,
      invoiceCount,
      truncated: invoiceCount > invoices.length,
    });
  } catch (err) {
    console.error("❌ Invoice analytics error:", err);
    res.status(err.message?.startsWith("Choose a valid") ? 400 : 500).json({ message: err.message?.startsWith("Choose a valid") ? err.message : "Invoice analytics failed" });
  }
});

/* =====================================================
   📤 ADMIN — EXPORT INVOICE ANALYTICS (CSV)
===================================================== */
router.get("/invoices/export/csv", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const match = getInvoiceQuery(req.query);
    const orders = await Order.find(match).populate("customerId", "name email").sort({ createdAt: -1 });

    const rows = orders.map((o) => ({
      InvoiceNo: `INV-${o._id.toString().slice(-6)}`,
      Date: o.createdAt.toISOString().slice(0, 10),
      Customer: o.customerId?.name || "",
      Email: o.customerId?.email || "",
      Total: o.totalAmount,
      PaymentStatus: o.paymentStatus || "Not Recorded",
      OrderStatus: o.status,
      Coupon: o.couponCode || "",
      CouponDiscount: o.couponDiscount || 0,
    }));

    const parser = new Parser({ fields: ["InvoiceNo", "Date", "Customer", "Email", "Total", "PaymentStatus", "OrderStatus", "Coupon", "CouponDiscount"] });
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("invoice-analytics.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ CSV export error:", err);
    res.status(err.message?.startsWith("Choose a valid") ? 400 : 500).json({ message: err.message?.startsWith("Choose a valid") ? err.message : "CSV export failed" });
  }
});

/* =====================================================
   🧾 ADMIN — SINGLE INVOICE DETAILS
===================================================== */
router.get("/invoice/:orderId", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const order = await Order.findOne({ _id: req.params.orderId, ...getInvoiceQuery() }).populate("customerId", "name email phone address");

    if (!order) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      invoiceNo: `INV-${order._id.toString().slice(-6)}`,
      customer: order.customerId,
      items: order.items,
      total: order.totalAmount,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error("❌ Invoice fetch error:", err);
    res.status(500).json({ message: "Failed to fetch invoice" });
  }
});

/* =====================================================
   📈 ADMIN — MONTHLY GST REPORT
===================================================== */
router.get("/analytics/gst/monthly", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const gstAgg = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          taxableValue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(
      gstAgg.map((g) => ({
        month: `${g._id.month}/${g._id.year}`,
        taxableValue: g.taxableValue.toFixed(2),
        cgst: (g.taxableValue * 0.09).toFixed(2),
        sgst: (g.taxableValue * 0.09).toFixed(2),
        igst: (g.taxableValue * 0.18).toFixed(2),
        totalGST: (g.taxableValue * 0.18).toFixed(2),
      }))
    );
  } catch (err) {
    console.error("❌ GST analytics error:", err);
    res.status(500).json({ message: "GST analytics failed" });
  }
});
router.get("/ping", (req, res) => {
  res.json({ message: "Admin analytics backend alive" });
});


module.exports = router;

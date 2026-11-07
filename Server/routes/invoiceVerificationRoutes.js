const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


/* =====================================================
   🔍 VERIFY INVOICE (PUBLIC)
   URL: /api/invoice/verify/:invoiceNo
===================================================== */
router.get("/verify/:invoiceNo", async (req, res) => {
  try {
    const { invoiceNo } = req.params;

    // Expected format: INV-XXXXXX
    if (!/^INV-[a-f0-9]{6}$/i.test(invoiceNo || "")) {
      return res.status(400).json({
        valid: false,
        message: "Invalid invoice format",
      });
    }

    const suffix = invoiceNo.slice(4);

    // Match using last 6 chars of ObjectId
    const [order] = await Order.aggregate([
      { $addFields: { invoiceObjectId: { $toString: "$_id" } } },
      { $match: { invoiceObjectId: { $regex: `${suffix}$`, $options: "i" } } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $project: { status: 1, createdAt: 1 } },
    ]);

    if (!order) {
      return res.status(404).json({
        valid: false,
        message: "Invoice not found",
      });
    }

    res.json({
      valid: true,
      invoiceNo,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error("❌ Invoice verification error:", err);
    res.status(500).json({
      valid: false,
      message: "Failed to verify invoice",
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

/**
 * ❤️ ADD ITEM TO WISHLIST
 * - Keeps original $push behavior
 * - Prevents duplicates
 */
router.post("/add", auth, async (req, res) => {
  try {
    const { product } = req.body;
    const customerId = req.user.id;

    if (!customerId || !product || !product._id) {
      return res.status(400).json({ message: "Missing data" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const exists = customer.wishlist.some(
      (item) => item._id.toString() === product._id
    );

    if (!exists) {
      customer.wishlist.push(product);
      await customer.save();
    }

    res.json({
      message: "Added to wishlist",
      wishlist: customer.wishlist,
    });
  } catch (err) {
    console.error("❌ Add wishlist error:", err);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

/**
 * 💔 REMOVE ITEM FROM WISHLIST
 * - FIXES original $pull bug
 * - Removes by product _id
 */
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const customerId = req.user.id;

    if (!customerId || !productId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.wishlist = customer.wishlist.filter(
      (item) => item._id.toString() !== productId
    );

    await customer.save();

    res.json({
      message: "Removed from wishlist",
      wishlist: customer.wishlist,
    });
  } catch (err) {
    console.error("❌ Remove wishlist error:", err);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

/**
 * 📄 GET CUSTOMER WISHLIST
 */
router.get("/:customerId", auth, async (req, res) => {
  try {
    if (req.params.customerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer.wishlist);
  } catch (err) {
    console.error("❌ Fetch wishlist error:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

module.exports = router;

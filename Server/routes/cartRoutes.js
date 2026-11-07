const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

/**
 * 🛒 SYNC CART
 * Supports BOTH:
 * 1️⃣ { customerId, cart }
 * 2️⃣ { customerId, cartItems }
 */
router.post("/sync", auth, async (req, res) => {
  try {
    const { cart, cartItems } = req.body;
    const customerId = req.user.id;

    const finalCart = cartItems || cart;

    if (!customerId || !Array.isArray(finalCart)) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { cart: finalCart },
      { returnDocument: "after" }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      message: "Cart synced successfully",
      cart: customer.cart,
    });
  } catch (err) {
    console.error("❌ Cart sync error:", err);
    res.status(500).json({ message: "Failed to sync cart" });
  }
});

/**
 * 📥 GET CUSTOMER CART
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

    const cart = customer.cart || [];
    const productIds = cart.map((item) => item.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).select("name image price salePrice stock");
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    res.json(cart.map((item) => {
      const saved = item.toObject();
      const product = byId.get(item.productId?.toString());
      return {
        ...saved,
        productId: item.productId?.toString(),
        name: product?.name || saved.name,
        image: product?.image || saved.image,
        price: product ? (product.salePrice != null ? product.salePrice : product.price) : saved.price,
        stock: product?.stock ?? 0,
      };
    }));
  } catch (err) {
    console.error("❌ Fetch cart error:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

/**
 * ❌ CLEAR CART (after order placed)
 */
router.delete("/clear/:customerId", auth, async (req, res) => {
  try {
    if (req.params.customerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    await Customer.findByIdAndUpdate(req.user.id, {
      cart: [],
    });

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

module.exports = router;

const express = require("express");

const Product = require("../models/Product");
const mongoose = require("mongoose");

const auth =
  require("../middleware/authMiddleware");

const router = express.Router();
const productFields = [
  "name", "description", "image", "media", "price", "salePrice", "categories",
  "category", "stock", "featured", "bestseller", "trending", "rating",
  "reviewsCount", "hsnCode",
];

const pickProductFields = (body) => Object.fromEntries(
  productFields.filter((field) => Object.hasOwn(body || {}, field)).map((field) => [field, body[field]])
);

/* =========================================
   GET ALL PRODUCTS
========================================= */

router.get("/", async (req, res) => {

  try {

    const products =
      await Product.find().sort({
        createdAt: -1,
      });

    res.json(products);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message:
        "Failed to fetch products",
    });
  }
});

/* =========================================
   GET FEATURED PRODUCTS
========================================= */

router.get(
  "/featured",
  async (req, res) => {

    try {

      const products =
        await Product.find({
          featured: true,
        }).limit(8);

      res.json(products);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Failed to fetch featured products",
      });
    }
  }
);

/* =========================================
   GET SINGLE PRODUCT
========================================= */

router.get(
  "/:id",
  async (req, res) => {

    try {

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      res.json(product);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Failed to fetch product",
      });
    }
  }
);

/* =========================================
   CREATE PRODUCT
========================================= */

router.post(
  "/",
  auth,
  async (req, res) => {

    try {

      if (!req.user.isAdmin) {

        return res.status(403).json({
          message:
            "Admin access required",
        });
      }

      const product = await Product.create(pickProductFields(req.body));

      res.status(201).json(product);

    } catch (err) {

      console.error(
        "Add product error:",
        err
      );

      res.status(err.name === "ValidationError" || err.name === "CastError" ? 400 : 500).json({
        message: err.name === "ValidationError" ? err.message : "Failed to add product",
      });
    }
  }
);

/* =========================================
   UPDATE PRODUCT
========================================= */

router.put(
  "/:id",
  auth,
  async (req, res) => {

    try {

      if (!req.user.isAdmin) {

        return res.status(403).json({
          message:
            "Admin access required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      product.set(pickProductFields(req.body));
      const updated = await product.save();

      res.json(updated);

    } catch (err) {

      console.error(err);

      res.status(err.name === "ValidationError" || err.name === "CastError" ? 400 : 500).json({
        message: err.name === "ValidationError" ? err.message : "Failed to update product",
      });
    }
  }
);

/* =========================================
   DELETE PRODUCT
========================================= */

router.delete(
  "/:id",
  auth,
  async (req, res) => {

    try {

      if (!req.user.isAdmin) {

        return res.status(403).json({
          message:
            "Admin access required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Product not found" });

      res.json({
        message:
          "Product deleted successfully",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Failed to delete product",
      });
    }
  }
);

module.exports = router;

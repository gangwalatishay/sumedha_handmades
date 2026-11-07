require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const paymentRoutes = require("./routes/paymentRoutes");
const Coupon = require("./models/Coupon");

const app = express();
const port = Number(process.env.PORT) || 5050;

const allowedOrigins = new Set(
  ["http://localhost:3000", process.env.CLIENT_ORIGIN].filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    const localDevelopmentOrigin = process.env.NODE_ENV !== "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

    if (!origin || allowedOrigins.has(origin) || localDevelopmentOrigin) {
      return callback(null, true);
    }
    return callback(new Error(`Origin is not allowed by CORS: ${origin}`));
  },
}));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

app.use(express.json({
  limit: "1mb",
  verify: (req, res, buffer) => { req.rawBody = Buffer.from(buffer); },
}));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/admin/analytics", require("./routes/adminAnalyticsRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/invoice", require("./routes/invoiceVerificationRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/payment", paymentRoutes);
app.use("/api/coupons", require("./routes/couponRoutes"));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Sumedha Handmades API" });
});

app.use((err, req, res, next) => {
  console.error("Request failed:", err.message);
  if (res.headersSent) return next(err);
  if (err.message?.startsWith("Origin is not allowed by CORS:")) {
    return res.status(403).json({ message: "This website is not allowed to access the API" });
  }
  return res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the server environment");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");
  await Coupon.updateOne(
    { code: "SUMEDHA10" },
    { $setOnInsert: { code: "SUMEDHA10", description: "Welcome discount", discountType: "percent", discountValue: 10 } },
    { upsert: true }
  );
  const paymentReconciliation = setInterval(() => {
    paymentRoutes.reconcileExpiredPayments().catch((err) => {
      console.error("Payment reconciliation failed:", err.message);
    });
  }, 60 * 1000);
  paymentReconciliation.unref();
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}

startServer().catch((err) => {
  console.error("❌ Server startup failed. Check the error below for the cause.");
  console.error(err);
  process.exit(1);
});

// // // // const express = require("express");
// // // // const router = express.Router();
// // // // const Customer = require("../models/Customer");

// // // // /**
// // // //  * 🧾 REGISTER CUSTOMER
// // // //  */
// // // // router.post("/register", async (req, res) => {
// // // //   try {
// // // //     const { name, email, password } = req.body;

// // // //     if (!name || !email || !password) {
// // // //       return res.status(400).json({ message: "All fields are required" });
// // // //     }

// // // //     const exists = await Customer.findOne({ email });
// // // //     if (exists) {
// // // //       return res.status(400).json({ message: "Email already exists" });
// // // //     }

// // // //     const customer = await Customer.create({
// // // //       name,
// // // //       email,
// // // //       password,
// // // //       wishlist: [],
// // // //       cart: [],
// // // //       loginHistory: [],
// // // //     });

// // // //     res.status(201).json({
// // // //       message: "Registered successfully",
// // // //       customer: {
// // // //         id: customer._id,
// // // //         name: customer.name,
// // // //         email: customer.email,
// // // //       },
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("❌ Register error:", err);
// // // //     res.status(500).json({ message: "Registration failed" });
// // // //   }
// // // // });

// // // // /**
// // // //  * 🔐 LOGIN CUSTOMER
// // // //  */
// // // // router.post("/login", async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;

// // // //     const customer = await Customer.findOne({ email });
// // // //     if (!customer || customer.password !== password) {
// // // //       return res.status(401).json({ message: "Invalid credentials" });
// // // //     }

// // // //     // 📊 Analytics: login history
// // // //     customer.loginHistory.push({
// // // //       ip: req.ip,
// // // //       userAgent: req.headers["user-agent"],
// // // //       date: new Date(),
// // // //     });

// // // //     await customer.save();

// // // //     res.json({
// // // //       message: "Login successful",
// // // //       customer: {
// // // //         id: customer._id,
// // // //         name: customer.name,
// // // //         email: customer.email,
// // // //         isAdmin: customer.isAdmin || false,
// // // //       },
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("❌ Login error:", err);
// // // //     res.status(500).json({ message: "Login failed" });
// // // //   }
// // // // });

// // // // const sendOtpEmail = require("../utils/sendOtpEmail");

// // // // /**
// // // //  * 🔐 FORGOT PASSWORD → SEND OTP
// // // //  */
// // // // router.post("/forgot-password", async (req, res) => {
// // // //   try {
// // // //     const { email } = req.body;

// // // //     const customer = await Customer.findOne({ email });
// // // //     if (!customer) {
// // // //       return res.status(404).json({ message: "Email not registered" });
// // // //     }

// // // //     const otp = Math.floor(100000 + Math.random() * 900000).toString();

// // // //     customer.otp = otp;
// // // //     customer.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
// // // //     await customer.save();

// // // //     await sendOtpEmail(email, otp);

// // // //     res.json({ message: "OTP sent to email" });
// // // //   } catch (err) {
// // // //     console.error("❌ Forgot password error:", err);
// // // //     res.status(500).json({ message: "Failed to send OTP" });
// // // //   }
// // // //   /**
// // // //  * 🔐 VERIFY OTP
// // // //  */
// // // // router.post("/verify-otp", async (req, res) => {
// // // //   try {
// // // //     const { email, otp } = req.body;

// // // //     if (!email || !otp) {
// // // //       return res.status(400).json({ message: "Email and OTP required" });
// // // //     }

// // // //     const customer = await Customer.findOne({ email });

// // // //     if (!customer || !customer.otp) {
// // // //       return res.status(400).json({ message: "Invalid request" });
// // // //     }

// // // //     // ⏰ Check expiry
// // // //     if (customer.otpExpiresAt < new Date()) {
// // // //       return res.status(400).json({ message: "OTP expired" });
// // // //     }

// // // //     // ❌ Check OTP
// // // //     if (customer.otp !== otp) {
// // // //       return res.status(400).json({ message: "Invalid OTP" });
// // // //     }

// // // //     // ✅ OTP verified — allow reset
// // // //     res.json({ message: "OTP verified successfully" });
// // // //   } catch (err) {
// // // //     console.error("❌ OTP verification error:", err);
// // // //     res.status(500).json({ message: "OTP verification failed" });
// // // //   }
// // // // });
// // // // const bcrypt = require("bcrypt");

// // // // /**
// // // //  * 🔑 RESET PASSWORD
// // // //  */
// // // // router.post("/reset-password", async (req, res) => {
// // // //   try {
// // // //     const { email, newPassword } = req.body;

// // // //     if (!email || !newPassword) {
// // // //       return res.status(400).json({ message: "Missing data" });
// // // //     }

// // // //     if (newPassword.length < 6) {
// // // //       return res
// // // //         .status(400)
// // // //         .json({ message: "Password must be at least 6 characters" });
// // // //     }

// // // //     const customer = await Customer.findOne({ email });

// // // //     if (!customer) {
// // // //       return res.status(404).json({ message: "User not found" });
// // // //     }

// // // //     // 🔐 Hash new password
// // // //     const hashedPassword = await bcrypt.hash(newPassword, 10);

// // // //     customer.password = hashedPassword;
// // // //     customer.otp = null;
// // // //     customer.otpExpiresAt = null;
// // // //     customer.isVerified = true;

// // // //     await customer.save();

// // // //     res.json({ message: "Password reset successful" });
// // // //   } catch (err) {
// // // //     console.error("❌ Reset password error:", err);
// // // //     res.status(500).json({ message: "Failed to reset password" });
// // // //   }
// // // // });

// // // // module.exports = router;
// // // const express = require("express");
// // // const router = express.Router();
// // // const bcrypt = require("bcrypt");

// // // const Customer = require("../models/Customer");
// // // const sendOtpEmail = require("../utils/sendOtpEmail");

// // // /* =====================================================
// // //    🧾 REGISTER CUSTOMER
// // // ===================================================== */
// // // router.post("/register", async (req, res) => {
// // //   try {
// // //     const { name, email, password, phone } = req.body;

// // //     if (!name || !email || !password) {
// // //       return res.status(400).json({ message: "All fields required" });
// // //     }

// // //     const exists = await Customer.findOne({ email });
// // //     if (exists) {
// // //       return res.status(400).json({ message: "Email already exists" });
// // //     }

// // //     const hashed = await bcrypt.hash(password, 10);

// // //     const customer = await Customer.create({
// // //       name,
// // //       email,
// // //       password: hashed,
// // //       phone,
// // //       wishlist: [],
// // //       cart: [],
// // //     });

// // //     const token = generateToken(customer);

// // //     res.status(201).json({
// // //       message: "Signup successful",
// // //       token,
// // //       customer: {
// // //         id: customer._id,
// // //         name: customer.name,
// // //         email: customer.email,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Signup failed" });
// // //   }
// // // });


// // // /* =====================================================
// // //    🔐 LOGIN CUSTOMER
// // // ===================================================== */
// // // // const bcrypt = require("bcrypt");
// // // const generateToken = require("../utils/generateToken");

// // // router.post("/login", async (req, res) => {
// // //   try {
// // //     const { email, password } = req.body;

// // //     const customer = await Customer.findOne({ email });
// // //     if (!customer) {
// // //       return res.status(401).json({ message: "Invalid credentials" });
// // //     }

// // //     const match = await bcrypt.compare(password, customer.password);
// // //     if (!match) {
// // //       return res.status(401).json({ message: "Invalid credentials" });
// // //     }

// // //     // 📊 Login history
// // //     customer.loginHistory.push({
// // //       ip: req.ip,
// // //       userAgent: req.headers["user-agent"],
// // //     });
// // //     await customer.save();

// // //     // 🔐 JWT
// // //     const token = generateToken(customer);

// // //     res.json({
// // //       message: "Login successful",
// // //       token,
// // //       customer: {
// // //         id: customer._id,
// // //         name: customer.name,
// // //         email: customer.email,
// // //         isAdmin: customer.isAdmin || false,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Login failed" });
// // //   }
// // // });


// // // /* =====================================================
// // //    🔐 FORGOT PASSWORD → SEND OTP
// // // ===================================================== */
// // // router.post("/forgot-password", async (req, res) => {
// // //   try {
// // //     const { email } = req.body;

// // //     if (!email) {
// // //       return res.status(400).json({ message: "Email required" });
// // //     }

// // //     const customer = await Customer.findOne({ email });
// // //     if (!customer) {
// // //       return res.status(404).json({ message: "Email not registered" });
// // //     }

// // //     const otp = Math.floor(100000 + Math.random() * 900000).toString();

// // //     customer.otp = otp;
// // //     customer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
// // //     await customer.save();

// // //     await sendOtpEmail(email, otp);

// // //     res.json({ message: "OTP sent to email" });
// // //   } catch (err) {
// // //     console.error("❌ Forgot password error:", err);
// // //     res.status(500).json({ message: "Failed to send OTP" });
// // //   }
// // // });

// // // /* =====================================================
// // //    🔐 VERIFY OTP
// // // ===================================================== */
// // // router.post("/verify-otp", async (req, res) => {
// // //   try {
// // //     const { email, otp } = req.body;

// // //     if (!email || !otp) {
// // //       return res.status(400).json({ message: "Email and OTP required" });
// // //     }

// // //     const customer = await Customer.findOne({ email });

// // //     if (!customer || !customer.otp) {
// // //       return res.status(400).json({ message: "Invalid request" });
// // //     }

// // //     if (customer.otpExpiresAt < new Date()) {
// // //       return res.status(400).json({ message: "OTP expired" });
// // //     }

// // //     if (customer.otp !== otp) {
// // //       return res.status(400).json({ message: "Invalid OTP" });
// // //     }

// // //     res.json({ message: "OTP verified successfully" });
// // //   } catch (err) {
// // //     console.error("❌ OTP verification error:", err);
// // //     res.status(500).json({ message: "OTP verification failed" });
// // //   }
// // // });

// // // /* =====================================================
// // //    🔑 RESET PASSWORD
// // // ===================================================== */
// // // router.post("/reset-password", async (req, res) => {
// // //   try {
// // //     const { email, newPassword } = req.body;

// // //     if (!email || !newPassword) {
// // //       return res.status(400).json({ message: "Missing data" });
// // //     }

// // //     if (newPassword.length < 6) {
// // //       return res
// // //         .status(400)
// // //         .json({ message: "Password must be at least 6 characters" });
// // //     }

// // //     const customer = await Customer.findOne({ email });
// // //     if (!customer) {
// // //       return res.status(404).json({ message: "User not found" });
// // //     }

// // //     const hashedPassword = await bcrypt.hash(newPassword, 10);

// // //     customer.password = hashedPassword;
// // //     customer.otp = null;
// // //     customer.otpExpiresAt = null;
// // //     customer.isVerified = true;

// // //     await customer.save();

// // //     res.json({ message: "Password reset successful" });
// // //   } catch (err) {
// // //     console.error("❌ Reset password error:", err);
// // //     res.status(500).json({ message: "Failed to reset password" });
// // //   }
// // // });

// // // module.exports = router;
// // const express = require("express");
// // const router = express.Router();
// // const bcrypt = require("bcrypt");
// // const jwt = require("jsonwebtoken");
// // const Customer = require("../models/Customer");
// // const sendOtpEmail = require("../utils/sendOtpEmail");

// // /* ==============================
// //    🔑 JWT HELPER
// // ================================ */
// // const generateToken = (customer) => {
// //   return jwt.sign(
// //     { id: customer._id, email: customer.email },
// //     process.env.JWT_SECRET,
// //     { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
// //   );
// // };

// // /* ==============================
// //    🧾 REGISTER CUSTOMER
// // ================================ */
// // router.post("/register", async (req, res) => {
// //   try {
// //     const { name, email, password, phone } = req.body;

// //     if (!name || !email || !password) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     const exists = await Customer.findOne({ email });
// //     if (exists) {
// //       return res.status(400).json({ message: "Email already exists" });
// //     }

// //     // 🔐 Hash password
// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const customer = await Customer.create({
// //       name,
// //       email,
// //       password: hashedPassword,
// //       phone,
// //       wishlist: [],
// //       cart: [],
// //       loginHistory: [],
// //       isVerified: true,
// //     });

// //     const token = generateToken(customer);

// //     res.status(201).json({
// //       message: "Registered successfully",
// //       token,
// //       customer: {
// //         id: customer._id,
// //         name: customer.name,
// //         email: customer.email,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("❌ Register error:", err);
// //     res.status(500).json({ message: "Registration failed" });
// //   }
// // });

// // /* ==============================
// //    🔐 LOGIN CUSTOMER
// // ================================ */
// // router.post("/login", async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const customer = await Customer.findOne({ email });
// //     if (!customer) {
// //       return res.status(401).json({ message: "Invalid credentials" });
// //     }

// //     const isMatch = await bcrypt.compare(password, customer.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ message: "Invalid credentials" });
// //     }

// //     // 📊 Login history
// //     customer.loginHistory.push({
// //       ip: req.ip,
// //       userAgent: req.headers["user-agent"],
// //       date: new Date(),
// //     });

// //     await customer.save();

// //     const token = generateToken(customer);

// //     res.json({
// //       message: "Login successful",
// //       token,
// //       customer: {
// //         id: customer._id,
// //         name: customer.name,
// //         email: customer.email,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("❌ Login error:", err);
// //     res.status(500).json({ message: "Login failed" });
// //   }
// // });

// // /* ==============================
// //    🔐 FORGOT PASSWORD → SEND OTP
// // ================================ */
// // router.post("/forgot-password", async (req, res) => {
// //   try {
// //     const { email } = req.body;

// //     const customer = await Customer.findOne({ email });
// //     if (!customer) {
// //       return res.status(404).json({ message: "Email not registered" });
// //     }

// //     const otp = Math.floor(100000 + Math.random() * 900000).toString();

// //     customer.otp = otp;
// //     customer.otpExpiresAt = Date.now() + 10 * 60 * 1000;
// //     await customer.save();

// //     await sendOtpEmail(email, otp);

// //     res.json({ message: "OTP sent to email" });
// //   } catch (err) {
// //     console.error("❌ Forgot password error:", err);
// //     res.status(500).json({ message: "Failed to send OTP" });
// //   }
// // });

// // /* ==============================
// //    🔐 VERIFY OTP
// // ================================ */
// // router.post("/verify-otp", async (req, res) => {
// //   try {
// //     const { email, otp } = req.body;

// //     const customer = await Customer.findOne({ email });

// //     if (
// //       !customer ||
// //       !customer.otp ||
// //       customer.otp !== otp ||
// //       customer.otpExpiresAt < Date.now()
// //     ) {
// //       return res.status(400).json({ message: "Invalid or expired OTP" });
// //     }

// //     res.json({ message: "OTP verified successfully" });
// //   } catch (err) {
// //     console.error("❌ OTP verify error:", err);
// //     res.status(500).json({ message: "OTP verification failed" });
// //   }
// // });

// // /* ==============================
// //    🔑 RESET PASSWORD
// // ================================ */
// // router.post("/reset-password", async (req, res) => {
// //   try {
// //     const { email, newPassword } = req.body;

// //     if (!newPassword || newPassword.length < 6) {
// //       return res
// //         .status(400)
// //         .json({ message: "Password must be at least 6 characters" });
// //     }

// //     const customer = await Customer.findOne({ email });
// //     if (!customer) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     customer.password = await bcrypt.hash(newPassword, 10);
// //     customer.otp = null;
// //     customer.otpExpiresAt = null;
// //     customer.isVerified = true;

// //     await customer.save();

// //     res.json({ message: "Password reset successful" });
// //   } catch (err) {
// //     console.error("❌ Reset password error:", err);
// //     res.status(500).json({ message: "Failed to reset password" });
// //   }
// // });

// // module.exports = router;















// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const Customer = require("../models/Customer");
// const sendOtpEmail = require("../utils/sendOtpEmail");

// /* =====================================
//    🔑 JWT HELPER
// ===================================== */
// const generateToken = (customer) => {
//   return jwt.sign(
//     { id: customer._id, email: customer.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// /* =====================================
//    🧾 REGISTER CUSTOMER
// ===================================== */
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const exists = await Customer.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const customer = await Customer.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       wishlist: [],
//       cart: [],
//       loginHistory: [],
//       isVerified: true,
//     });

//     const token = generateToken(customer);

//     res.status(201).json({
//       message: "Registered successfully",
//       token,
//       customer: {
//         id: customer._id,
//         name: customer.name,
//         email: customer.email,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Register error:", err);
//     res.status(500).json({ message: "Registration failed" });
//   }
// });

// /* =====================================
//    🔐 LOGIN CUSTOMER
// ===================================== */
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const customer = await Customer.findOne({ email });
//     if (!customer) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, customer.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     customer.loginHistory.push({
//       ip: req.ip,
//       userAgent: req.headers["user-agent"],
//       date: new Date(),
//     });
//     await customer.save();

//     const token = generateToken(customer);

//     res.json({
//       message: "Login successful",
//       token,
//       customer: {
//         id: customer._id,
//         name: customer.name,
//         email: customer.email,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

// /* =====================================
//    🔐 FORGOT PASSWORD → SEND OTP
// ===================================== */
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email required" });
//     }

//     const customer = await Customer.findOne({ email });
//     if (!customer) {
//       return res.status(404).json({ message: "Email not registered" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     customer.otp = otp;
//     customer.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min
//     await customer.save();

//     await sendOtpEmail(email, otp);

//     res.json({ message: "OTP sent to email" });
//   } catch (err) {
//     console.error("❌ Forgot password error:", err);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// });

// /* =====================================
//    🔐 VERIFY OTP
// ===================================== */
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP required" });
//     }

//     const customer = await Customer.findOne({ email });

//     if (
//       !customer ||
//       !customer.otp ||
//       customer.otp !== otp ||
//       customer.otpExpiresAt < Date.now()
//     ) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     res.json({ message: "OTP verified successfully" });
//   } catch (err) {
//     console.error("❌ OTP verify error:", err);
//     res.status(500).json({ message: "OTP verification failed" });
//   }
// });

// /* =====================================
//    🔑 RESET PASSWORD
// ===================================== */
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;

//     if (!email || !newPassword || newPassword.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Valid email and password required" });
//     }

//     const customer = await Customer.findOne({ email });
//     if (!customer) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     customer.password = await bcrypt.hash(newPassword, 10);
//     customer.otp = null;
//     customer.otpExpiresAt = null;
//     customer.isVerified = true;

//     await customer.save();

//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("❌ Reset password error:", err);
//     res.status(500).json({ message: "Failed to reset password" });
//   }
// });

// module.exports = router;










// // const express = require("express");
// // const router = express.Router();
// // const bcrypt = require("bcrypt");
// // const jwt = require("jsonwebtoken");

// // const Customer = require("../models/Customer");
// // const sendOtpEmail = require("../utils/sendOtpEmail");

// // /* =====================================
// //    🔑 JWT HELPER
// //    ✅ FIX: isAdmin added to token payload
// // ===================================== */
// // const generateToken = (customer) => {
// //   return jwt.sign(
// //     {
// //       id: customer._id,
// //       email: customer.email,
// //       isAdmin: customer.isAdmin || false, // ✅ FIXED HERE
// //     },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "7d" }
// //   );
// // };

// // /* =====================================
// //    🧾 REGISTER CUSTOMER
// // ===================================== */
// // router.post("/register", async (req, res) => {
// //   try {
// //     const { name, email, password, phone } = req.body;

// //     if (!name || !email || !password) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     const exists = await Customer.findOne({ email });
// //     if (exists) {
// //       return res.status(400).json({ message: "Email already exists" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const customer = await Customer.create({
// //       name,
// //       email,
// //       password: hashedPassword,
// //       phone,
// //       wishlist: [],
// //       cart: [],
// //       loginHistory: [],
// //       isVerified: true,
// //     });

// //     const token = generateToken(customer);

// //     res.status(201).json({
// //       message: "Registered successfully",
// //       token,
// //       customer: {
// //         id: customer._id,
// //         name: customer.name,
// //         email: customer.email,
// //         isAdmin: customer.isAdmin || false,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("❌ Register error:", err);
// //     res.status(500).json({ message: "Registration failed" });
// //   }
// // });

// // /* =====================================
// //    🔐 LOGIN CUSTOMER
// // ===================================== */
// // router.post("/login", async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const customer = await Customer.findOne({ email });
// //     if (!customer) {
// //       return res.status(401).json({ message: "Invalid credentials" });
// //     }

// //     const isMatch = await bcrypt.compare(password, customer.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ message: "Invalid credentials" });
// //     }

// //     customer.loginHistory.push({
// //       ip: req.ip,
// //       userAgent: req.headers["user-agent"],
// //       date: new Date(),
// //     });
// //     await customer.save();

// //     const token = generateToken(customer);

// //     res.json({
// //       message: "Login successful",
// //       token,
// //       customer: {
// //         id: customer._id,
// //         name: customer.name,
// //         email: customer.email,
// //         isAdmin: customer.isAdmin || false, // ✅ surfaced to frontend
// //       },
// //     });
// //   } catch (err) {
// //     console.error("❌ Login error:", err);
// //     res.status(500).json({ message: "Login failed" });
// //   }
// // });

// // /* =====================================
// //    🔐 FORGOT PASSWORD → SEND OTP
// // ===================================== */
// // router.post("/forgot-password", async (req, res) => {
// //   try {
// //     const { email } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email required" });
// //     }

// //     const customer = await Customer.findOne({ email });
// //     if (!customer) {
// //       return res.status(404).json({ message: "Email not registered" });
// //     }

// //     const otp = Math.floor(100000 + Math.random() * 900000).toString();

// //     customer.otp = otp;
// //     customer.otpExpiresAt = Date.now() + 10 * 60 * 1000;
// //     await customer.save();

// //     await sendOtpEmail(email, otp);

// //     res.json({ message: "OTP sent to email" });
// //   } catch (err) {
// //     console.error("❌ Forgot password error:", err);
// //     res.status(500).json({ message: "Failed to send OTP" });
// //   }
// // });

// // /* =====================================
// //    🔐 VERIFY OTP
// // ===================================== */
// // router.post("/verify-otp", async (req, res) => {
// //   try {
// //     const { email, otp } = req.body;

// //     if (!email || !otp) {
// //       return res.status(400).json({ message: "Email and OTP required" });
// //     }

// //     const customer = await Customer.findOne({ email });

// //     if (
// //       !customer ||
// //       !customer.otp ||
// //       customer.otp !== otp ||
// //       customer.otpExpiresAt < Date.now()
// //     ) {
// //       return res.status(400).json({ message: "Invalid or expired OTP" });
// //     }

// //     res.json({ message: "OTP verified successfully" });
// //   } catch (err) {
// //     console.error("❌ OTP verify error:", err);
// //     res.status(500).json({ message: "OTP verification failed" });
// //   }
// // });

// // /* =====================================
// //    🔑 RESET PASSWORD
// // ===================================== */
// // router.post("/reset-password", async (req, res) => {
// //   try {
// //     const { email, newPassword } = req.body;

// //     if (!email || !newPassword || newPassword.length < 6) {
// //       return res
// //         .status(400)
// //         .json({ message: "Valid email and password required" });
// //     }

// //     const customer = await Customer.findOne({ email });
// //     if (!customer) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     customer.password = await bcrypt.hash(newPassword, 10);
// //     customer.otp = null;
// //     customer.otpExpiresAt = null;
// //     customer.isVerified = true;

// //     await customer.save();

// //     res.json({ message: "Password reset successful" });
// //   } catch (err) {
// //     console.error("❌ Reset password error:", err);
// //     res.status(500).json({ message: "Failed to reset password" });
// //   }
// // });

// // module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Customer = require("../models/Customer");
const sendOtpEmail = require("../utils/sendOtpEmail");
const rateLimit = require("../middleware/rateLimit");

/* =====================================
   🔑 JWT HELPER
===================================== */
const generateToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      email: customer.email,
      isAdmin: customer.isAdmin || false,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* =====================================
   🧾 REGISTER CUSTOMER
===================================== */
router.post("/register", rateLimit({ max: 10 }), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const exists = await Customer.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      phone,
      wishlist: [],
      cart: [],
      loginHistory: [],
      isVerified: true,
    });

    const token = generateToken(customer);

    res.status(201).json({
      message: "Registered successfully",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        isAdmin: customer.isAdmin || false,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

/* =====================================
   🔐 LOGIN CUSTOMER
===================================== */
router.post("/login", rateLimit({ max: 10 }), async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    customer.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      date: new Date(),
    });

    await customer.save();

    const token = generateToken(customer);

    res.json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        isAdmin: customer.isAdmin || false,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

/* =====================================
   🔐 FORGOT PASSWORD
===================================== */
router.post("/forgot-password", rateLimit({ max: 5 }), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required",
      });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.json({ message: "If the account exists, an OTP has been sent" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    customer.otp = otp;
    customer.otpExpiresAt =
      Date.now() + 10 * 60 * 1000;
    customer.passwordResetVerifiedAt = null;

    await customer.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "If the account exists, an OTP has been sent" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);

    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
});

/* =====================================
   🔐 VERIFY OTP
===================================== */
router.post("/verify-otp", rateLimit({ max: 5 }), async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required",
      });
    }

    const customer = await Customer.findOne({
      email,
    });

    if (
      !customer ||
      !customer.otp ||
      customer.otp !== otp ||
      customer.otpExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    customer.passwordResetVerifiedAt = new Date();
    await customer.save();

    res.json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("❌ OTP verify error:", err);

    res.status(500).json({
      message: "OTP verification failed",
    });
  }
});

/* =====================================
   🔑 RESET PASSWORD
===================================== */
router.post("/reset-password", rateLimit({ max: 5 }), async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (
      !email ||
      !newPassword ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "Valid email and password required",
      });
    }

    const customer = await Customer.findOne({
      email,
    });

    if (!customer) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !customer.otp ||
      !customer.otpExpiresAt ||
      customer.otpExpiresAt < Date.now() ||
      !customer.passwordResetVerifiedAt ||
      Date.now() - customer.passwordResetVerifiedAt.getTime() > 10 * 60 * 1000
    ) {
      return res.status(400).json({
        message: "Verify a current OTP before resetting the password",
      });
    }

    customer.password = await bcrypt.hash(
      newPassword,
      10
    );

    customer.otp = null;
    customer.otpExpiresAt = null;
    customer.passwordResetVerifiedAt = null;
    customer.isVerified = true;

    await customer.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);

    res.status(500).json({
      message: "Failed to reset password",
    });
  }
});

module.exports = router;

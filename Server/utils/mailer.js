const nodemailer = require("nodemailer");

/*
  IMPORTANT:
  Use Gmail App Password (not normal Gmail password)
*/

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. your@gmail.com
    pass: process.env.EMAIL_PASS, // App Password (16 chars)
  },
});

module.exports = transporter;

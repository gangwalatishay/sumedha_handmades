const nodemailer = require("nodemailer");

const sendOtpEmail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Sumedha Handmade" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password Reset OTP - Sumedha Handmade",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🔐 Password Reset Request</h2>
          <p>Your OTP for resetting your password is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p>— Sumedha Handmade Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent to:", toEmail);
  } catch (error) {
    console.error("❌ OTP EMAIL ERROR:", error);
    throw error; // 🔥 THIS is important
  }
};

module.exports = sendOtpEmail;

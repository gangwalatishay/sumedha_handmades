const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASS,
  },
});

const sendNewOrderEmail = async (order, customer) => {
  await transporter.sendMail({
    from: `"Sumedha Handmade" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "🎉 New Order Received!",
    html: `
      <h2>New Order Received</h2>
      <p><b>Customer:</b> ${customer.name}</p>
      <p><b>Total:</b> ₹${order.totalAmount}</p>
      ${order.couponCode ? `<p><b>Coupon:</b> ${order.couponCode} (₹${order.couponDiscount || 0} off)</p>` : ""}
      <p><b>Order ID:</b> ${order._id}</p>
      <p>Please check the admin panel for details.</p>
    `,
  });
};

module.exports = sendNewOrderEmail;

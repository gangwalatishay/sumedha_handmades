const nodemailer = require("nodemailer");

/* =====================================
   📧 MAIL TRANSPORTER
===================================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

/* =====================================
   🔔 ORDER STATUS EMAIL
===================================== */
const sendOrderStatusEmail = async ({
  to,
  customerName,
  orderId,
  status,
  isAdminAction = true,
}) => {
  const subject = isAdminAction
    ? `📦 Order Status Updated – ${status}`
    : `❌ Order Cancelled – ${orderId}`;

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Sumedha Handmade</h2>
      <p>Hello <b>${customerName}</b>,</p>

      <p>
        Your order <b>#${orderId.slice(-6)}</b> has been
        <b>${status}</b>.
      </p>

      ${
        status === "Cancelled"
          ? `<p>If this cancellation was not expected, please contact support.</p>`
          : `<p>We’ll keep you updated as your order progresses.</p>`
      }

      <br />
      <p>Thank you for shopping with us 💜</p>
      <p><b>– Team Sumedha Handmade</b></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Sumedha Handmade" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendOrderStatusEmail;

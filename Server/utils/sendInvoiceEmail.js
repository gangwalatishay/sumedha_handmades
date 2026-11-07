// const transporter = require("./mailer");
// const { getInvoiceBuffer } = require("./generateInvoice");

// module.exports = async function sendInvoiceEmail(customer, order) {
//   const pdfBuffer = await getInvoiceBuffer(order, customer);

//   await transporter.sendMail({
//     from: `"Sumedha Handmade" <${process.env.EMAIL_USER}>`,
//     to: customer.email,
//     subject: `Invoice for Order ${order._id}`,
//     text: "Please find your invoice attached.",
//     attachments: [
//       {
//         filename: `invoice-${order._id}.pdf`,
//         content: pdfBuffer,
//       },
//     ],
//   });

//   console.log("📄 Invoice email sent");
// };
const transporter = require("./mailer");
const { getInvoiceBuffer } = require("./generateInvoice");

module.exports = async function sendInvoiceEmail(customer, order) {
  try {
    const pdfBuffer = await getInvoiceBuffer(order, customer);

    const mailOptions = {
      from: `"Sumedha Handmade" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `Invoice for Order ${order._id}`,
      text: `Hi ${customer.name},

Thank you for shopping with Sumedha Handmade.

Please find your invoice attached.

Warm regards,
Sumedha Handmade`,
      attachments: [
        {
          filename: `invoice-${order._id}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Invoice email sent to", customer.email);
  } catch (err) {
    console.error("❌ Failed to send invoice email:", err.message);
    throw err;
  }
};

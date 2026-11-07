const PDFDocument = require("pdfkit");
const path = require("path");
const QRCode = require("qrcode");

/* =====================================================
   🔁 INTERNAL: BUILD PDF (shared)
===================================================== */
async function buildInvoicePDF(doc, order, customer, options = {}) {
  const {
    interstate = false, // true → IGST, false → CGST+SGST
    watermark = true,
    verificationBaseUrl = "https://sumedhahandmade.com/invoice/verify",
  } = options;

  const orderIdStr = order._id.toString();
  const invoiceNo = `INV-${orderIdStr.slice(-6)}`;

  /* ================= FONT ================= */
  const fontPath = path.join(
    __dirname,
    "../assets/fonts/Roboto-VariableFont_wdth,wght.ttf"
  );

  try {
    doc.font(fontPath);
  } catch {
    doc.font("Helvetica");
  }

  /* ================= WATERMARK ================= */
  if (watermark) {
    doc
      .save()
      .fontSize(60)
      .fillColor("#e9d5ff")
      .opacity(0.15)
      .rotate(-30, { origin: [300, 400] })
      .text("SUMEDHA HANDMADE", 100, 300)
      .restore()
      .opacity(1);
  }

  /* ================= HEADER ================= */
  doc
    .fontSize(24)
    .fillColor("#6b21a8")
    .text("Sumedha Handmade", 50, 50);

  doc
    .fontSize(10)
    .fillColor("#555")
    .text("Handcrafted Products • Made in India")
    .text("GSTIN: 29ABCDE1234F1Z5")
    .text("Email: support@sumedhahandmade.com");

  doc
    .fontSize(16)
    .fillColor("#000")
    .text("TAX INVOICE", 400, 50, { align: "right" });

  doc.moveDown(2);

  /* ================= META ================= */
  doc
    .fontSize(11)
    .fillColor("#000")
    .text(`Invoice No: ${invoiceNo}`)
    .text(`Order ID: ${orderIdStr}`)
    .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    .text(`Order Status: ${order.status}`);

  doc.moveDown(1.5);

  /* ================= BILL TO ================= */
  doc.fontSize(12).fillColor("#6b21a8").text("BILL TO");

  doc
    .fontSize(11)
    .fillColor("#000")
    .text(customer?.name || "N/A")
    .text(customer?.email || "N/A");

  doc.moveDown(1.5);

  /* ================= SHIPPING ================= */
  doc.fontSize(12).fillColor("#6b21a8").text("SHIPPING ADDRESS");

  const shippingAddress = order.shippingAddress;
  const formattedShippingAddress = shippingAddress
    ? [shippingAddress.fullName, shippingAddress.addressLine1, shippingAddress.addressLine2, shippingAddress.city, shippingAddress.state, shippingAddress.postalCode, shippingAddress.country]
      .filter(Boolean)
      .join(", ")
    : customer?.address || "Address not provided";

  doc
    .fontSize(11)
    .fillColor("#000")
    .text(formattedShippingAddress);

  doc.moveDown(2);

  /* ================= TABLE HEADER ================= */
  const tableTop = doc.y;
  const col = {
    item: 50,
    hsn: 250,
    price: 300,
    qty: 360,
    total: 430,
  };

  doc.rect(50, tableTop, 500, 22).fill("#6b21a8");

  doc
    .fillColor("#fff")
    .fontSize(10)
    .text("Item", col.item, tableTop + 6)
    .text("HSN", col.hsn, tableTop + 6)
    .text("Price", col.price, tableTop + 6)
    .text("Qty", col.qty, tableTop + 6)
    .text("Total", col.total, tableTop + 6);

  doc.fillColor("#000");

  /* ================= ITEMS ================= */
  let y = tableTop + 30;
  let subTotal = 0;

  order.items.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    subTotal += lineTotal;

    doc
      .fontSize(10)
      .text(`${i + 1}. ${item.name}`, col.item, y, { width: 190 })
      .text(item.hsnCode || "7117", col.hsn, y)
      .text(`₹ ${item.price}`, col.price, y)
      .text(item.qty.toString(), col.qty, y)
      .text(`₹ ${lineTotal}`, col.total, y);

    y += 22;
  });

  /* ================= GST ================= */
  const GST_RATE = 0.18;
  const gst = subTotal * GST_RATE;

  doc.moveDown(2).fontSize(11);

  doc.text(`Subtotal: ₹ ${subTotal.toFixed(2)}`, 350);

  if (interstate) {
    doc.text(`IGST (18%): ₹ ${gst.toFixed(2)}`, 350);
  } else {
    doc.text(`CGST (9%): ₹ ${(gst / 2).toFixed(2)}`, 350);
    doc.text(`SGST (9%): ₹ ${(gst / 2).toFixed(2)}`, 350);
  }

  if (order.couponCode && order.couponDiscount > 0) {
    doc.fillColor("#39714b").text(`Coupon ${order.couponCode}: −₹ ${order.couponDiscount.toFixed(2)}`, 350);
    doc.fillColor("#000");
  }

  doc
    .fontSize(13)
    .fillColor("#000")
    .text(`Grand Total: ₹ ${order.totalAmount.toFixed(2)}`, 350);

  /* ================= QR VERIFICATION ================= */
  const verifyUrl = `${verificationBaseUrl}/${invoiceNo}`;
  const qrData = await QRCode.toDataURL(verifyUrl);

  doc
    .image(qrData, 50, doc.y + 20, { width: 90 })
    .fontSize(9)
    .fillColor("#444")
    .text("Scan to verify invoice", 50, doc.y + 115);

  /* ================= FOOTER ================= */
  doc
    .moveDown(6)
    .fontSize(10)
    .fillColor("#666")
    .text("This is a system-generated GST invoice.", { align: "center" })
    .text("Thank you for supporting handmade artisans 💜", {
      align: "center",
    });
}

/* =====================================================
   📄 STREAM TO RESPONSE (DOWNLOAD)
===================================================== */
module.exports = async function generateInvoice(order, customer, res, options) {
  try {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=invoice-${order._id.toString()}.pdf`
      );
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    await buildInvoicePDF(doc, order, customer, options);

    doc.end();
  } catch (err) {
    console.error("❌ generateInvoice error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Invoice generation failed" });
    }
  }
};

/* =====================================================
   📦 BUFFER VERSION (EMAIL / ZIP)
===================================================== */
module.exports.getInvoiceBuffer = async function (order, customer, options) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      await buildInvoicePDF(doc, order, customer, options);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

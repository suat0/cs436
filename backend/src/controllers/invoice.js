const db = require('../controllers/db');
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const nodemailer = require('nodemailer');

// === Load and encode logo ===
const logoPath = path.join(__dirname, '../../../frontend/src/images/logo_white.jpg');
const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
const logoDataURI = `data:image/png;base64,${logoBase64}`;

// === Shared PDF generator ===
function generateInvoicePDF(order, itemsResult, callback) {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => callback(Buffer.concat(buffers)));

  // === Logo (top-left) ===
  doc.image(logoPath, 30, 45, { width: 70 });

  // === Header (right) ===
  doc.fontSize(22).text("INVOICE", 400, 50, { align: "right" });
  doc.fontSize(10).text("Pearl", 400, 90, { align: "right" });
  doc.text("Sabanci Street", { align: "right" });
  doc.text("Istanbul", { align: "right" });
  doc.text("Türkiye", { align: "right" });

  doc.moveDown(2);

  // === Customer Info (left) ===
  doc.font("Helvetica-Bold").text(order.customer_name, 50, 140);
  doc.font("Helvetica").text(order.delivery_address, 50, doc.y);
  doc.text(order.email, 50, doc.y + 15);

  doc.moveDown(3);

  // === Table Header ===
  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 250;
  const col3 = 330;
  const col4 = 420;

  doc.font("Helvetica-Bold");
  doc.text("Products", col1, tableTop);
  doc.text("Quantity", col2, tableTop);
  doc.text("Price", col3, tableTop);
  doc.text("Total", col4, tableTop);
  doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  doc.moveDown(1);
  doc.font("Helvetica");

  let total = 0;
  let y = tableTop + 25;

  itemsResult.forEach((item) => {
    const itemTotal = item.quantity * item.price_at_purchase;
    total += itemTotal;

    doc.text(item.product_name, col1, y);
    doc.text(item.quantity.toString(), col2, y);
    doc.text(`$${parseFloat(item.price_at_purchase).toFixed(2)}`, col3, y);
    doc.text(`$${itemTotal.toFixed(2)}`, col4, y);
    y += 20;
  });

  // === Totals ===
  doc.moveTo(col3, y + 10).lineTo(550, y + 10).stroke();
  doc.font("Helvetica-Bold");
  doc.text("Subtotal:", col3, y + 20);
  doc.text(`$${total.toFixed(2)}`, col4, y + 20);
  doc.text("Total:", col3, y + 40);
  doc.text(`$${total.toFixed(2)}`, col4, y + 40);

  // === Footer ===
  doc.font("Helvetica").fontSize(12).text("Thank you for shopping with us!", 0, 700, { align: "center" });

  doc.end();
}

// === Route: Generate and view invoice PDF ===
exports.generateInvoice = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const [orderResult] = await db.execute(`
      SELECT o.*, u.name AS customer_name, u.email 
      FROM Orders o
      JOIN Users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orderResult.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orderResult[0];

    const [itemsResult] = await db.execute(`
      SELECT oi.quantity, oi.price_at_purchase, p.name AS product_name 
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    generateInvoicePDF(order, itemsResult, (pdfBuffer) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=invoice_${orderId}.pdf`);
      res.send(pdfBuffer);
    });

  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ success: false, message: "Failed to generate invoice" });
  }
};

// === Route: Email invoice PDF ===
exports.sendInvoiceByEmail = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const [orderResult] = await db.execute(`
      SELECT o.*, u.name AS customer_name, u.email 
      FROM Orders o
      JOIN Users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orderResult.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orderResult[0];

    const [itemsResult] = await db.execute(`
      SELECT oi.quantity, oi.price_at_purchase, p.name AS product_name 
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    generateInvoicePDF(order, itemsResult, async (pdfBuffer) => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        }
      });

      await transporter.sendMail({
        from: '"Pearl Store" <pearljewelry1997@gmail.com>',
        to: order.email,
        subject: `Your Invoice for Order #${order.id}`,
        text: `Hello ${order.customer_name},\n\nThank you for your purchase! Please find your invoice attached.`,
        attachments: [
          {
            filename: `invoice_${order.id}.pdf`,
            content: pdfBuffer,
          }
        ]
      });

      res.json({ success: true, message: "Invoice sent to email." });
    });

  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ success: false, message: "Failed to send invoice email" });
  }
};

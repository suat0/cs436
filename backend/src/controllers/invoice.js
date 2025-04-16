const easyinvoice = require("easyinvoice");
const db = require('../controllers/db');
const path = require("path");
const fs = require("fs");
const logoPath = path.join(__dirname, '../../../frontend/src/images/logo_white.jpg');
const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
const logoDataURI = `data:image/png;base64,${logoBase64}`;


exports.generateInvoice = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // Fetch order and order items from DB (your existing code)...
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

    // Prepare invoice data
    const invoiceData = {
      documentTitle: "INVOICE",
      currency: "USD",
      logo: logoDataURI,
      sender: {
        company: "Pearl",
        address: "Sabancı Street",
        city: "Istanbul",
        country: "Türkiye"
      },
      client: {
        company: order.customer_name,
        address: order.delivery_address
      },
      invoiceNumber: order.id.toString(),
      invoiceDate: order.date.toISOString().split("T")[0],
      products: itemsResult.map(item => ({
        quantity: item.quantity,
        description: item.product_name,
        price: parseFloat(item.price_at_purchase)
      })),
      bottomNotice: "Thank you for shopping with us!",
    };

    // Generate PDF in memory
    const result = await easyinvoice.createInvoice(invoiceData);
    const pdfBuffer = Buffer.from(result.pdf, "base64");

    // Return PDF directly without saving
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to generate invoice" });
  }
};



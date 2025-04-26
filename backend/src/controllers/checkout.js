const db = require('../controllers/db'); 
const authenticate = require('../middleware/authMiddleware').isAuthenticated;
const router = require('../routes/auth');
// Mask card details to protect sensitive data

class checkoutController {
  constructor() {
    this.checkout = this.checkout.bind(this);
  }

  // Mask card number (keep first 4 and last 4 digits visible)
  maskCardNumber(cardNumber) {
    return cardNumber.slice(0, 4) + '********' + cardNumber.slice(-4);
  }
  
  // Validate Card Number Format (Basic Check)
  validateCardNumber(cardNumber) {
    return /^\d{16}$/.test(cardNumber);
  }
  
  // Validate CVV Format (3 or 4 digits)
  validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }
  
  // Validate Expiry Date (Format MM/YY or MM/YYYY)
  validateExpiryDate(expiryDate) {
    const regex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    return regex.test(expiryDate);
  }

  async checkout(req, res) {
    try {
      // Notice how we renamed them to match your DB columns
      // e.g. payment_name, delivery_address, etc.
      const { cartItems, payment_name, delivery_address, paymentDetails } = req.body;
  
      // Basic checks
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty!' });
      }
      if (!payment_name || !delivery_address || !paymentDetails) {
        return res.status(400).json({ error: 'payment_name, delivery_address, and paymentDetails are required!' });
      }
  
      // Validate payment details
      const { cardNumber, cvv, expiryDate } = paymentDetails;
      if (!this.validateCardNumber(cardNumber) || !this.validateCVV(cvv) || !this.validateExpiryDate(expiryDate)) {
        return res.status(400).json({ error: 'Invalid payment details.' });
      }
  
      // Mask the card number (optional) before storing
      const maskedCard = this.maskCardNumber(cardNumber);
  
      // Start a DB transaction
      await db.query('START TRANSACTION');
  
      // Calculate total price and prepare to insert order_items
      let totalPrice = 0;
      const orderItemsData = [];
  
      for (const item of cartItems) {
        // Make sure product exists and has enough stock
        const [productRows] = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
        if (!productRows || productRows.length === 0) {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: `Product with ID ${item.productId} does not exist.` });
        }
        const product = productRows[0];
        if (product.quantity < item.quantity) {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: `Not enough stock for product ID ${item.productId}.` });
        }
  
        // Accumulate total price
        totalPrice += product.price * item.quantity;
  
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }
  
      // Insert into `orders` table
      // Make sure the columns match exactly the schema in your DB
      const [orderResult] = await db.query(`
        INSERT INTO orders 
        (user_id, total_price, delivery_address, status, payment_name, payment_card, payment_expiry, payment_cvc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.user.id,          // user_id
        totalPrice,           // total_price
        delivery_address,     // delivery_address
        'processing',         // status
        payment_name,         // payment_name
        maskedCard,           // payment_card (store masked or partial)
        expiryDate,           // payment_expiry
        cvv                   // payment_cvc (Note: Not recommended to store CVV in real production)
      ]);
  
      const orderId = orderResult.insertId;
  
      // Insert order_items, update product quantities
      for (const item of orderItemsData) {
        await db.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
          VALUES (?, ?, ?, ?)
        `, [ orderId, item.productId, item.quantity, item.price ]);
  
        // Update product stock
        await db.query(`
          UPDATE products 
          SET quantity_in_stock = quantity_in_stock - ?
          WHERE id = ? AND quantity_in_stock >= ?
        `, [ item.quantity, item.productId, item.quantity ]);
      }
  
      // Commit transaction
      await db.query('COMMIT');
  
      // Return response
      res.status(201).json({ message: 'Order placed successfully!', orderId });

      //reset shopping cart
      await db.query('DELETE FROM shopping_cart WHERE user_id = ?', [req.user.id]);
      console.log('Shopping cart reset for user:', req.user.id);
      // Optional: simulate shipping updates
      setTimeout(async () => {
        try {
          await db.query('UPDATE orders SET status = ? WHERE id = ?', ['in-transit', orderId]);
          console.log(`Order ${orderId} updated to in-transit.`);
        } catch (err) {
          console.error(`Error updating order ${orderId} to in-transit:`, err);
        }
      }, 30000);
  
      setTimeout(async () => {
        try {
          await db.query('UPDATE orders SET status = ? WHERE id = ?', ['delivered', orderId]);
          console.log(`Order ${orderId} updated to delivered.`);
        } catch (err) {
          console.error(`Error updating order ${orderId} to delivered:`, err);
        }
      }, 50000);
  
    } catch (error) {
      console.error('Checkout Error Details:', error);
      await db.query('ROLLBACK');
      res.status(500).json({ error: 'Something went wrong during checkout.' });
    }
  }
}
module.exports = new checkoutController();

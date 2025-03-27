const express = require('express');
const router = express.Router();
const db = require('../config');  // ✅ Correct import
const authenticate = require('../middleware/authMiddleware');

router.post('/', authenticate, async (req, res) => {
  try {
    const { cartItems, paymentMethod, address } = req.body;

    console.log('Received Checkout Request:', req.body); // ✅ Log request data

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty!' });
    }

    if (!paymentMethod || !address) {
      return res.status(400).json({ error: 'Payment method and address are required!' });
    }

    // Calculate total price
    let totalPrice = 0;
    const productData = []; // Store product data for inserting order items

    for (const item of cartItems) {
      const [product] = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
      console.log('Product Query Result:', product); // ✅ Log product data

      if (!product || product.length === 0 || product[0].quantity < item.quantity) {
        return res.status(400).json({ error: `Product with ID ${item.productId} is out of stock!` });
      }

      totalPrice += product[0].price * item.quantity;
      productData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product[0].price, // Correct price from product
      });
    }

    console.log('Total Price Calculated:', totalPrice); // ✅ Log total price

    // Insert order into the database
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_price, payment_method, address, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, totalPrice, paymentMethod, address, 'processing']
    );

    const orderId = orderResult.insertId;
    console.log('Order Insert Result:', orderResult); // ✅ Log order result

    // Insert order items using the correct price
    for (const item of productData) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );

      // Reduce stock in the products table
      await db.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    res.status(201).json({ message: 'Order placed successfully!', orderId });
} catch (error) {
    console.error('Checkout Error Details:', error); // ✅ Log full error
    res.status(500).json({ error: 'Something went wrong during checkout.' });
  }
  
});

module.exports = router;

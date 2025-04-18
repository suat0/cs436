const express = require('express');
const router = express.Router();
const db = require('../controllers/db');
const authenticate = require('../middleware/authMiddleware');

// GET /api/orders - Get orders for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// routes/orders.js
// Update Order Status - Only Product Manager can do this
router.put('/:id/status', authenticate, async (req, res) => {
  console.log(req.user.role);

  if (!req.user || req.user.role !== 'product_manager') {
    return res.status(403).json({ error: 'Access Denied: Only Product Manager can update order status' });
  }

  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['processing', 'in-transit', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid Status' });
  }

  try {
    await db.query('UPDATE Orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// routes/orders.js
router.get('/deliveries', authenticate, async (req, res) => {
  if (!req.user || req.user.role !== 'product_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        o.id AS order_id,
        o.delivery_address,
        o.status,
        o.date,
        p.name AS product_name,
        oi.quantity
      FROM Orders o
      JOIN Order_Items oi ON o.id = oi.order_id
      JOIN Products p ON oi.product_id = p.id
      ORDER BY o.date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).json({ error: 'Failed to fetch delivery data' });
  }
});

module.exports = router;

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

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../controllers/db');

//----FYI-------Product manager is not currently available so change the situation of comment manually
//----can use, UPDATE Comments SET status = 'approved' WHERE id = "ID of the comment"; on mySQL

// POST /api/comments
router.post('/', async (req, res) => {
  const { product_id, user_id, comment } = req.body;

  if (!product_id || !user_id || !comment) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    await db.execute(
      `INSERT INTO Comments (product_id, user_id, comment, status) VALUES (?, ?, ?, 'pending')`,
      [product_id, user_id, comment]
    );

    res.status(201).json({ success: true, message: 'Comment submitted for review.' });
  } catch (err) {
    console.error('Error submitting comment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/comments/product/:id
router.get('/product/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const [comments] = await db.execute(
      `
      SELECT c.*, u.name AS user_name
      FROM Comments c
      JOIN Users u ON c.user_id = u.id
      WHERE c.product_id = ? AND c.status = 'approved'
      ORDER BY c.date DESC
      `,
      [productId]
    );

    res.json({ success: true, comments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

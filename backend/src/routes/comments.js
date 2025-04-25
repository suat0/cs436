const express = require('express');
const router = express.Router();
const db = require('../controllers/db');
const isAuthenticated = require('../middleware/authMiddleware').isAuthenticated;



// Helper to check if user bought the product
async function userPurchasedProduct(user_id, product_id) {
  const [result] = await db.execute(
    `SELECT COUNT(*) as count
     FROM Orders o
     JOIN Order_Items oi ON o.id = oi.order_id
     WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'`,
    [user_id, product_id]
  );
  return result[0].count > 0;
}

// POST /api/comments
router.post('/', isAuthenticated, async (req, res) => {
  const { product_id, comment } = req.body;
  const user_id = req.user.id;

  if (!product_id || !user_id || !comment) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Check if user purchased the product
    const hasPurchased = await userPurchasedProduct(user_id, product_id);
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'You can only comment on products you have purchased which have been delivered.'
      });
    }

    // Check if this user already commented on this product
    const [existing] = await db.execute(
      'SELECT id FROM Comments WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already commented on this product.',
      });
    }

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
  const userId = req.query.userId || null;
  try {
    const [comments] = await db.execute(
        `
        (
      -- Approved comments or user's own comment (any status)
      SELECT 
        c.comment, 
        c.date, 
        u.name AS user_name, 
        r.rating, 
        c.user_id,
        c.status
      FROM Comments c
      JOIN Users u ON c.user_id = u.id
      LEFT JOIN Ratings r 
        ON r.user_id = c.user_id AND r.product_id = c.product_id
      WHERE c.product_id = ? AND (
        c.status = 'approved' OR 
        (? IS NOT NULL AND c.user_id = ?)
      )
    )

    UNION

    (
      -- Ratings for users who don't have a comment (approved or their own)
      SELECT 
        NULL AS comment, 
        r.created_at AS date, 
        u.name AS user_name, 
        r.rating, 
        r.user_id,
        NULL AS status
      FROM Ratings r
      JOIN Users u ON r.user_id = u.id
      WHERE r.product_id = ?
      AND NOT EXISTS (
        SELECT 1 FROM Comments c2
        WHERE c2.product_id = r.product_id
          AND c2.user_id = r.user_id
          AND (
            c2.status = 'approved' OR 
            (? IS NOT NULL AND c2.user_id = ?)
          )
      )
    )

    ORDER BY date DESC;`,
    [productId, userId, userId, productId, userId, userId]
  );

    res.json({ success: true, comments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/comments - Update user's comment
router.put('/', isAuthenticated, async (req, res) => {
  const { product_id, comment } = req.body;
  const user_id = req.user.id;

  if (!product_id || !comment) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM Comments WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Reset status to pending after update
    await db.execute(
      'UPDATE Comments SET comment = ?, date = CURRENT_TIMESTAMP, status = "pending" WHERE product_id = ? AND user_id = ?',
      [comment, product_id, user_id]
    );

    res.json({ success: true, message: 'Comment updated and marked as pending' });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// GET /api/comments/me - Get current logged-in user info
router.get('/me', isAuthenticated, (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name
    }
  });
});


module.exports = router;

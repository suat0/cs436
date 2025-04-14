const express = require('express');
const router = express.Router();
const db = require('../controllers/db');
const isAuthenticated = require('../middleware/authMiddleware');


// Submit a new rating
router.post('/', isAuthenticated, async (req, res) => {
  const { product_id, rating } = req.body;
  const user_id = req.user.id; 
  
  if (!product_id || !user_id || !rating) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Prevent duplicate rating
    const [existing] = await db.execute(
      'SELECT id FROM Ratings WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You already rated this product.' });
    }

    // Insert rating
    await db.execute(
      'INSERT INTO Ratings (product_id, user_id, rating) VALUES (?, ?, ?)',
      [product_id, user_id, rating]
    );

    res.status(201).json({ success: true, message: 'Rating submitted.' });
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get average rating for a product
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const [ratings] = await db.execute(
      `SELECT rating FROM Ratings WHERE product_id = ?`,
      [productId]
    );

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const average = ratings.length > 0 ? (total / ratings.length).toFixed(2) : 0;

    res.json({
      success: true,
      average: parseFloat(average),
      count: ratings.length
    });
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

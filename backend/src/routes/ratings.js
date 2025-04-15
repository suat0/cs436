const express = require('express');
const router = express.Router();
const db = require('../controllers/db');
const isAuthenticated = require('../middleware/authMiddleware');


// Helper command toheck if user purchased the product
async function userPurchasedProduct(user_id, product_id) {
  const [result] = await db.execute(
    `SELECT COUNT(*) as count
     FROM Orders o
     JOIN Order_Items oi ON o.id = oi.order_id
     WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'`, //askhjdvbsakjhdbsahj
    [user_id, product_id]
  );
  return result[0].count > 0;
}

// Submit a new rating
router.post('/', isAuthenticated, async (req, res) => {
  const { product_id, rating } = req.body;
  const user_id = req.user.id; 
  
  if (!product_id || !user_id || !rating) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Check if user has purchased the product
    const hasPurchased = await userPurchasedProduct(user_id, product_id);
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate products you have purchased.'
      });
    }

    // Prevent duplicate rating
    const [existing] = await db.execute(
      'SELECT id FROM Ratings WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You already rated this product.' });
    }

    // Insert new rating
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

// PUT /api/ratings - Update user's rating
router.put('/', isAuthenticated, async (req, res) => {
  const { product_id, rating } = req.body;
  const user_id = req.user.id;

  if (!product_id || !rating) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM Ratings WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    await db.execute(
      'UPDATE Ratings SET rating = ? WHERE product_id = ? AND user_id = ?',
      [rating, product_id, user_id]
    );    

    res.json({ success: true, message: 'Rating updated' });
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;

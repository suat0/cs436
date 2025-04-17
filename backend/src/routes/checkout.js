const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout');
const authenticate = require('../middleware/authMiddleware');

// Temporary middleware to simulate a logged-in user with id 1
router.post('/', authenticate, checkoutController.checkout);


module.exports = router;

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/authMiddleware').isAuthenticated;
router.use(authMiddleware);
// POST /api/payment - Mock Payment Endpoint
router.post('/', paymentController.processPayment);

module.exports = router;

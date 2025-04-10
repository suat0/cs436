const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');

// POST /api/payment - Mock Payment Endpoint
router.post('/', paymentController.processPayment);

module.exports = router;

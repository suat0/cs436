const express = require('express');
const router = express.Router();

// POST /api/payment - Mock Payment Endpoint
router.post('/', async (req, res) => {
  const { cardNumber, expiryDate, cvv, amount } = req.body;

  // Basic validation of payment details
  if (!cardNumber || !expiryDate || !cvv || !amount) {
    return res.status(400).json({ error: 'Payment information is incomplete!' });
  }

  if (cardNumber.length !== 16 || isNaN(cardNumber)) {
    return res.status(400).json({ error: 'Invalid credit card number!' });
  }

  if (cvv.length !== 3 || isNaN(cvv)) {
    return res.status(400).json({ error: 'Invalid CVV!' });
  }

  // Simulate successful payment
  const paymentResult = {
    success: true,
    transactionId: `txn_${Date.now()}`,
    message: 'Payment processed successfully!',
  };

  res.status(200).json(paymentResult);
});

module.exports = router;

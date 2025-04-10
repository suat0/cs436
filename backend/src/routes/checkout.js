const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout');
const authenticate = require('../middleware/authMiddleware');


router.post('/', /*authenticate,*/ checkoutController.checkout );

module.exports = router;

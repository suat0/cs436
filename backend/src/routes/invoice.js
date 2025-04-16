const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice');

router.get('/:orderId', invoiceController.generateInvoice);

module.exports = router;
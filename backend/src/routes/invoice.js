const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice');

router.get('/:orderId', invoiceController.generateInvoice);
router.get('/send/:orderId', invoiceController.sendInvoiceByEmail);


module.exports = router;
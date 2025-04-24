const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice');
const authMiddleware = require('../middleware/authMiddleware').isAuthenticated;
router.use(authMiddleware);
router.get('/:orderId', invoiceController.generateInvoice);
router.get('/send/:orderId', invoiceController.sendInvoiceByEmail);


module.exports = router;
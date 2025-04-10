const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { body } = require('express-validator');

// Get the current cart (for user or guest)
router.get('/', cartController.getCart.bind(cartController));

// Add an item to the cart
router.post(
  '/items',
  [
    body('product_id').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  cartController.addItem.bind(cartController)
);

// Update a cart item's quantity
router.put(
  '/:cartId/items/:itemId',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  cartController.updateItem.bind(cartController)
);

// Remove a cart item
router.delete('/:cartId/items/:itemId', cartController.removeItem.bind(cartController));

// Clear the entire cart
router.delete('/:cartId', cartController.clearCart.bind(cartController));

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { body } = require('express-validator');

// Public routes
// GET /api/products - Get all products (with optional filters)
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get a single product by ID
router.get('/:id', productController.getProductById);

// GET /api/products/search - Search for products
router.get('/search', productController.searchProducts);

// Routes without authentication middleware

// POST /api/products - Create a new product (product manager only)
router.post('/', 
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('serial_number').notEmpty().withMessage('Serial number is required'),
    body('category_id').isInt().withMessage('Valid category ID is required')
  ],
  productController.createProduct
);

// PUT /api/products/:id - Update a product (role-based)
router.put('/:id', 
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('model').optional().notEmpty().withMessage('Model cannot be empty'),
    body('category_id').optional().isInt().withMessage('Valid category ID is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    body('quantity_in_stock').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
  ],
  productController.updateProduct
);

// DELETE /api/products/:id - Delete a product (product manager only)
router.delete('/:id', productController.deleteProduct);

// POST /api/products/:id/price - Set product price (sales manager only)
router.post('/:id/price', 
  [
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than zero'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number')
  ],
  productController.setProductPrice
);

// POST /api/products/:id/stock - Update product stock (product manager only)
router.post('/:id/stock', 
  [
    body('quantity').isInt().withMessage('Quantity must be an integer'),
    body('action').optional().isIn(['add', 'subtract', 'set']).withMessage('Action must be add, subtract, or set')
  ],
  productController.updateProductStock
);

// PATCH /api/products/:id/visibility - Toggle product visibility (sales manager only)
router.patch('/:id/visibility', productController.toggleVisibility);

module.exports = router;
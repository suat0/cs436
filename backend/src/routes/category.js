const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const { body } = require('express-validator');

// Public routes
// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Get a single category by ID
router.get('/:id', categoryController.getCategoryById);

// GET /api/categories/:id/products - Get products in a category
router.get('/:id/products', categoryController.getCategoryProducts);

// Routes without authentication middleware

// POST /api/categories - Create a new category
router.post('/', 
  [
    body('name').notEmpty().withMessage('Category name is required')
  ],
  categoryController.createCategory
);

// PUT /api/categories/:id - Update a category
router.put('/:id', 
  [
    body('name').optional().notEmpty().withMessage('Category name cannot be empty')
  ],
  categoryController.updateCategory
);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', categoryController.deleteCategory);

// PATCH /api/categories/:id/status - Toggle category active status
router.patch('/:id/status', categoryController.toggleCategoryStatus);

module.exports = router;

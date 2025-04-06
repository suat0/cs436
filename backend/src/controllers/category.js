const Category = require('../models/Category');
const db = require('../controllers/db');
const { validationResult } = require('express-validator');

class CategoryController {
  // Get all categories with optional filtering
  async getAllCategories(req, res) {
    try {
      const options = {
        activeOnly: req.query.active !== 'false', // Default to showing only active categories
        orderBy: req.query.sort_by || 'name',
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.page ? parseInt(req.query.limit) * (parseInt(req.query.page) - 1) : null
      };

      const categories = await Category.getAll(db, options);
      
      // Get product counts if requested
      if (req.query.withProductCount === 'true') {
        for (const category of categories) {
          category.productCount = await Category.getProductCount(
            db, 
            category.id,
            req.query.countHiddenProducts !== 'true' // Only count visible products by default
          );
        }
      }
      
      return res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a single category by ID
  async getCategoryById(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await Category.getById(db, categoryId);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Get category products if requested
      if (req.query.withProducts === 'true') {
        const options = {
          visibleOnly: req.query.showHiddenProducts !== 'true', // Only show visible products by default
          inStockOnly: req.query.inStockOnly === 'true',
          orderBy: req.query.sort_by || 'name',
          limit: req.query.limit ? parseInt(req.query.limit) : null,
          offset: req.query.page ? parseInt(req.query.limit) * (parseInt(req.query.page) - 1) : null
        };
        
        category.products = await Category.getProducts(db, categoryId, options);
        category.productCount = category.products.length;
      } else if (req.query.withProductCount === 'true') {
        // Just get the count if requested
        category.productCount = await Category.getProductCount(
          db, 
          categoryId,
          req.query.countHiddenProducts !== 'true' // Only count visible products by default
        );
      }

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create a new category (product manager only)
  async createCategory(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Check user role
      if (req.user.role !== 'product_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only product managers can create categories'
        });
      }

      const categoryData = {
        name: req.body.name,
        image_url: req.body.image_url || '',
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
      };

      const newCategory = await Category.create(db, categoryData);

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update a category (product manager only)
  async updateCategory(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Check user role
      if (req.user.role !== 'product_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only product managers can update categories'
        });
      }

      const categoryId = parseInt(req.params.id);
      const category = await Category.getById(db, categoryId);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Update category properties
      if (req.body.name) category.name = req.body.name;
      if (req.body.image_url !== undefined) category.image_url = req.body.image_url;
      if (req.body.is_active !== undefined) category.is_active = req.body.is_active;

      await category.update(db);

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete a category (product manager only)
  async deleteCategory(req, res) {
    try {
      // Check user role
      if (req.user.role !== 'product_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only product managers can delete categories'
        });
      }

      const categoryId = parseInt(req.params.id);
      const category = await Category.getById(db, categoryId);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      try {
        await Category.delete(db, categoryId);
      } catch (error) {
        if (error.message.includes('associated products')) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete category that contains products. Remove or reassign products first.'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Toggle category active status (product manager only)
  async toggleCategoryStatus(req, res) {
    try {
      // Check user role
      if (req.user.role !== 'product_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only product managers can change category status'
        });
      }

      const categoryId = parseInt(req.params.id);
      const category = await Category.getById(db, categoryId);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await category.toggleActive(db);

      return res.status(200).json({
        success: true,
        message: `Category is now ${category.is_active ? 'active' : 'inactive'}`,
        data: {
          id: category.id,
          name: category.name,
          is_active: category.is_active
        }
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while toggling category status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get products in a category
  async getCategoryProducts(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await Category.getById(db, categoryId);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Only show products from active categories to customers
      if (!category.is_active && req.user && req.user.role === 'customer') {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const options = {
        visibleOnly: !req.user || req.user.role === 'customer', // Only admin users can see hidden products
        inStockOnly: req.query.inStockOnly === 'true',
        orderBy: req.query.sort_by || 'name',
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.page ? parseInt(req.query.limit) * (parseInt(req.query.page) - 1) : null
      };
      
      const products = await Category.getProducts(db, categoryId, options);
      
      return res.status(200).json({
        success: true,
        count: products.length,
        data: {
          category: {
            id: category.id,
            name: category.name,
            is_active: category.is_active,
            image_url: category.image_url
          },
          products
        }
      });
    } catch (error) {
      console.error('Error fetching category products:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching category products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CategoryController();
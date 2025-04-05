const Product = require('../models/Product');
const db = require('../controllers/db');
const { validationResult } = require('express-validator');

class ProductController {
  // Get all products with optional filtering
  async getAllProducts(req, res) {
    try {
      const options = {
        visibleOnly: req.query.visible !== 'false', // Default to showing only visible products
        category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
        orderBy: req.query.sort_by || 'name',
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.page ? parseInt(req.query.limit) * (parseInt(req.query.page) - 1) : null
      };

      const products = await Product.getAll(db, options);
      
      return res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a single product by ID
  async getProductById(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const product = await Product.getById(db, productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Get additional product info if requested
      if (req.query.withDetails === 'true') {
        const category = await Product.getCategory(db, productId);
        const comments = await Product.getComments(db, productId);
        const avgRating = await Product.getAverageRating(db, productId);
        
        return res.status(200).json({
          success: true,
          data: {
            ...product,
            category,
            comments,
            avgRating
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create a new product (product manager only)
  async createProduct(req, res) {
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
          message: 'Access denied. Only product managers can create products'
        });
      }

      const productData = {
        name: req.body.name,
        category_id: req.body.category_id,
        model: req.body.model,
        serial_number: req.body.serial_number,
        description: req.body.description || '',
        quantity_in_stock: req.body.quantity_in_stock || 0,
        distributor_info: req.body.distributor_info || '',
        warranty_status: req.body.warranty_status || false,
        image_url: req.body.image_url || ''
        // Price will be set by sales manager later
      };

      const newProduct = await Product.create(db, productData);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Check for duplicate serial number
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'A product with this serial number already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Server error while creating product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update a product
  async updateProduct(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const productId = parseInt(req.params.id);
      const product = await Product.getById(db, productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check permissions based on what's being updated and user role
      if (req.body.price || req.body.cost_price) {
        // Only sales managers can update prices
        if (req.user.role !== 'sales_manager') {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Only sales managers can update product prices'
          });
        }
      } else if (req.user.role !== 'product_manager') {
        // Non-price updates are for product managers only
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only product managers can update product details'
        });
      }

      // Update product properties
      if (req.body.name) product.name = req.body.name;
      if (req.body.category_id) product.category_id = req.body.category_id;
      if (req.body.model) product.model = req.body.model;
      if (req.body.description) product.description = req.body.description;
      if (req.body.distributor_info) product.distributor_info = req.body.distributor_info;
      if (req.body.image_url) product.image_url = req.body.image_url;
      if (req.body.warranty_status !== undefined) product.warranty_status = req.body.warranty_status;
      
      // Only product managers can update stock
      if (req.user.role === 'product_manager' && req.body.quantity_in_stock !== undefined) {
        product.quantity_in_stock = req.body.quantity_in_stock;
      }
      
      // Only sales managers can update price
      if (req.user.role === 'sales_manager') {
        if (req.body.price) product.setPrice(req.body.price);
        if (req.body.cost_price) product.cost_price = req.body.cost_price;
        if (req.body.visibility !== undefined) product.visibility = req.body.visibility;
      }

      await product.update(db);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete a product (product manager only)
  async deleteProduct(req, res) {
    try {
      // Check user role
      if (req.user.role !== 'product_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only product managers can delete products'
        });
      }

      const productId = parseInt(req.params.id);
      const product = await Product.getById(db, productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.delete(db, productId);

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search for products
  async searchProducts(req, res) {
    try {
      const searchTerm = req.query.q || '';
      
      const options = {
        visibleOnly: true, // Only show visible products in search results
        categoryId: req.query.category_id ? parseInt(req.query.category_id) : null,
        minPrice: req.query.min_price ? parseFloat(req.query.min_price) : null,
        maxPrice: req.query.max_price ? parseFloat(req.query.max_price) : null,
        inStock: req.query.in_stock === 'true',
        orderBy: req.query.sort_by || 'name',
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.page ? parseInt(req.query.limit) * (parseInt(req.query.page) - 1) : 0
      };

      const products = await Product.searchProducts(db, searchTerm, options);
      
      return res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Error searching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while searching products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Set product price (sales manager only)
  async setProductPrice(req, res) {
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
      if (req.user.role !== 'sales_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only sales managers can set product prices'
        });
      }

      const productId = parseInt(req.params.id);
      const product = await Product.getById(db, productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const price = parseFloat(req.body.price);
      const costPrice = req.body.cost_price ? parseFloat(req.body.cost_price) : price * 0.5;

      product.setPrice(price);
      product.cost_price = costPrice;
      
      await product.update(db);

      return res.status(200).json({
        success: true,
        message: 'Product price set successfully',
        data: {
          id: product.id,
          name: product.name,
          price: product.price,
          cost_price: product.cost_price,
          profit_margin: product.calculateProfitMargin(),
          visibility: product.visibility
        }
      });
    } catch (error) {
      console.error('Error setting product price:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while setting product price',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update product stock (product manager only)
  async updateProductStock(req, res) {
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
          message: 'Access denied. Only product managers can update stock'
        });
      }

      const productId = parseInt(req.params.id);
      const product = await Product.getById(db, productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const changeAmount = parseInt(req.body.quantity);
      
      if (req.body.action === 'add') {
        product.updateStock(changeAmount);
      } else if (req.body.action === 'subtract') {
        if (product.quantity_in_stock < changeAmount) {
          return res.status(400).json({
            success: false,
            message: 'Cannot subtract more than current stock'
          });
        }
        product.reduceStock(changeAmount);
      } else {
        // Set absolute value
        product.quantity_in_stock = Math.max(0, changeAmount);
      }
      
      await product.update(db);

      return res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        data: {
          id: product.id,
          name: product.name,
          quantity_in_stock: product.quantity_in_stock,
          in_stock: product.isInStock()
        }
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating product stock',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Toggle product visibility (sales manager only)
  async toggleVisibility(req, res) {
    try {
      // Check user role
      if (req.user.role !== 'sales_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only sales managers can toggle product visibility'
        });
      }

      const productId = parseInt(req.params.id);
      const product = await Product.getById(db, productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Can't make product visible if price isn't set
      if (!product.visibility && (!product.price || product.price <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot make product visible without setting a price first'
        });
      }

      product.visibility = !product.visibility;
      await product.update(db);

      return res.status(200).json({
        success: true,
        message: `Product is now ${product.visibility ? 'visible' : 'hidden'}`,
        data: {
          id: product.id,
          name: product.name,
          visibility: product.visibility
        }
      });
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while toggling product visibility',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ProductController();
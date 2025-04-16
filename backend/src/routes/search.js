const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const productController = require("../controllers/product");

// GET /api/search?q=...
router.get(
  "/",
  [
    query("q").notEmpty().withMessage("Search query is required")
  ],
  productController.searchProducts.bind(productController)
);

module.exports = router;

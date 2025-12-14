// Import Express Router
const express = require('express');
const router = express.Router();

// Import database query helper
const { query } = require('../db/connection');

// GET /products
// Retrieve all products
// Returns a list of all products in the database
router.get('/', async (req, res) => {
  try {
    // Query database for all products using parameterized query
    const result = await query('SELECT id, name, quantity, price, created_at, updated_at FROM products ORDER BY id');
    
    res.json({
      message: 'Products retrieved successfully',
      products: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Error retrieving products',
      error: error.message
    });
  }
});

// GET /products/:id
// Retrieve a single product by ID
// Returns product details for the specified product ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID is a valid integer
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID',
        error: 'Product ID must be a valid integer'
      });
    }
    
    // Query database for product with matching ID using parameterized query
    const result = await query(
      'SELECT id, name, quantity, price, created_at, updated_at FROM products WHERE id = $1',
      [productId]
    );
    
    // Return 404 if product not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Product not found',
        error: `Product with ID ${id} does not exist`
      });
    }
    
    // Return the product
    res.json({
      message: 'Product retrieved successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error retrieving product',
      error: error.message
    });
  }
});

// POST /products
// Create a new product
// Accepts product data (name, quantity, price) in request body
// Returns the newly created product
router.post('/', async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Product name is required'
      });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Quantity is required'
      });
    }
    
    if (price === undefined || price === null) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Price is required'
      });
    }
    
    // Validate data types
    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Quantity must be a non-negative integer'
      });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Price must be a non-negative number'
      });
    }
    
    // Insert new product into database using parameterized query
    const result = await query(
      'INSERT INTO products (name, quantity, price) VALUES ($1, $2, $3) RETURNING id, name, quantity, price, created_at, updated_at',
      [name.trim(), quantity, price]
    );
    
    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Error creating product',
      error: error.message
    });
  }
});

// PUT /products/:id
// Update an existing product by ID
// Accepts updated product data in request body
// Returns the updated product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price } = req.body;
    
    // Validate ID is a valid integer
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID',
        error: 'Product ID must be a valid integer'
      });
    }
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Product name is required'
      });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Quantity is required'
      });
    }
    
    if (price === undefined || price === null) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Price is required'
      });
    }
    
    // Validate data types
    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Quantity must be a non-negative integer'
      });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Price must be a non-negative number'
      });
    }
    
    // Update product in database using parameterized query
    // Update updated_at timestamp to current time
    const result = await query(
      'UPDATE products SET name = $1, quantity = $2, price = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, quantity, price, created_at, updated_at',
      [name.trim(), quantity, price, productId]
    );
    
    // Return 404 if product not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Product not found',
        error: `Product with ID ${id} does not exist`
      });
    }
    
    // Return the updated product
    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Error updating product',
      error: error.message
    });
  }
});

// DELETE /products/:id
// Delete a product by ID
// Removes the product from the database
// Returns confirmation message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID is a valid integer
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID',
        error: 'Product ID must be a valid integer'
      });
    }
    
    // Delete product from database using parameterized query
    // Check if product exists by checking rowCount after deletion
    const result = await query(
      'DELETE FROM products WHERE id = $1',
      [productId]
    );
    
    // Return 404 if product not found (no rows were deleted)
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Product not found',
        error: `Product with ID ${id} does not exist`
      });
    }
    
    // Return success message when deletion succeeds
    res.json({
      message: 'Product deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Export the router for use in app.js
module.exports = router;


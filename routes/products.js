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
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: Query database for product with matching ID
  res.json({
    message: `Get product ${id} - placeholder`,
    product: null
  });
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
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, price } = req.body;
  // TODO: Update product in database
  res.json({
    message: `Update product ${id} - placeholder`,
    product: { id, name, quantity, price }
  });
});

// DELETE /products/:id
// Delete a product by ID
// Removes the product from the database
// Returns confirmation message
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: Delete product from database
  res.json({
    message: `Delete product ${id} - placeholder`,
    success: true
  });
});

// Export the router for use in app.js
module.exports = router;


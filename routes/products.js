// Import Express Router
const express = require('express');
const router = express.Router();

// GET /products
// Retrieve all products
// Returns a list of all products in the database
router.get('/', (req, res) => {
  // TODO: Query database for all products
  res.json({
    message: 'Get all products - placeholder',
    products: []
  });
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
router.post('/', (req, res) => {
  const { name, quantity, price } = req.body;
  // TODO: Insert new product into database
  res.json({
    message: 'Create product - placeholder',
    product: { name, quantity, price }
  });
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


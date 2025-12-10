// Import Express framework
const express = require('express');

// Create Express application instance
const app = express();

// Define port number
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Import product routes
const productRoutes = require('./routes/products');

// Register product routes at /products endpoint
app.use('/products', productRoutes);

// Simple GET route for root path
app.get('/', (req, res) => {
  // Return a JSON message
  res.json({
    message: 'Welcome to Cloud Application Project',
    status: 'success'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


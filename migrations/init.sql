-- Initial database migration for products table
-- This migration creates the products table to store product information

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    -- Primary key: auto-incrementing unique identifier for each product
    id SERIAL PRIMARY KEY,
    
    -- Product name: text field for the product's name
    name VARCHAR(255) NOT NULL,
    
    -- Quantity: integer representing the available stock quantity
    quantity INTEGER NOT NULL DEFAULT 0,
    
    -- Price: decimal number representing the product price
    -- Using NUMERIC(10, 2) to store prices with 2 decimal places (e.g., 99999999.99)
    price NUMERIC(10, 2) NOT NULL,
    
    -- Timestamp for when the record was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamp for when the record was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on product name for faster searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Add a comment to the table for documentation
COMMENT ON TABLE products IS 'Stores product information including name, quantity, and price';
COMMENT ON COLUMN products.id IS 'Unique identifier for each product';
COMMENT ON COLUMN products.name IS 'Name of the product';
COMMENT ON COLUMN products.quantity IS 'Available stock quantity';
COMMENT ON COLUMN products.price IS 'Product price in LKR';


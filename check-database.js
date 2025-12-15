// Script to check database, tables, and data
const { query } = require('./db/connection');

async function checkDatabase() {
  try {
    console.log('=== Checking Database Connection ===\n');
    
    // Check if we can connect
    const connectionTest = await query('SELECT NOW() as current_time, current_database() as database_name');
    console.log('✓ Database connection successful!');
    console.log(`  Database: ${connectionTest.rows[0].database_name}`);
    console.log(`  Current time: ${connectionTest.rows[0].current_time}\n`);
    
    // Check if products table exists
    console.log('=== Checking Products Table ===\n');
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as table_exists
    `);
    
    if (tableCheck.rows[0].table_exists) {
      console.log('✓ Products table exists!\n');
      
      // Get table structure
      console.log('=== Products Table Structure ===\n');
      const columns = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'products'
        ORDER BY ordinal_position
      `);
      
      console.log('Columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      console.log('');
      
      // Check row count
      console.log('=== Checking Data ===\n');
      const countResult = await query('SELECT COUNT(*) as total FROM products');
      const total = parseInt(countResult.rows[0].total);
      console.log(`Total products: ${total}\n`);
      
      if (total > 0) {
        // Get sample data
        console.log('=== Sample Data (first 10 products) ===\n');
        const products = await query('SELECT * FROM products ORDER BY id LIMIT 10');
        
        console.log('Products:');
        products.rows.forEach((product, index) => {
          console.log(`\n  Product ${index + 1}:`);
          console.log(`    ID: ${product.id}`);
          console.log(`    Name: ${product.name}`);
          console.log(`    Quantity: ${product.quantity}`);
          console.log(`    Price: ${product.price}`);
          console.log(`    Created: ${product.created_at}`);
          console.log(`    Updated: ${product.updated_at}`);
        });
      } else {
        console.log('⚠ No products found in the database.');
        console.log('  You can add products using the POST /products endpoint.\n');
      }
    } else {
      console.log('✗ Products table does NOT exist!');
      console.log('  You need to run the migration: migrations/init.sql\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error checking database:');
    console.error(`  ${error.message}\n`);
    process.exit(1);
  }
}

checkDatabase();


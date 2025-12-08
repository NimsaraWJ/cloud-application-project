// Import PostgreSQL client library
const { Pool } = require('pg');

// Create a connection pool using DATABASE_URL from environment variables
// DATABASE_URL format: postgresql://user:password@host:port/database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enable SSL for production environments (e.g., cloud databases)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Reusable query helper function
// Executes SQL queries and returns results
// Usage: const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error: error.message });
    throw error;
  }
};

// Export the query helper for use in other modules
module.exports = {
  query,
  pool
};


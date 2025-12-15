// Import PostgreSQL client library
const { Pool } = require('pg');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Function to get DATABASE_URL from Secret Manager or environment variable
let databaseUrlPromise = null;

async function getDatabaseUrl() {
  // Return cached promise if already fetching
  if (databaseUrlPromise) {
    return databaseUrlPromise;
  }

  databaseUrlPromise = (async () => {
    // First, try environment variable (for local development)
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }

    // Only use Secret Manager in App Engine (when running in production on GCP)
    // Check if we're actually running on App Engine, not just if GOOGLE_CLOUD_PROJECT is set
    const isAppEngine = process.env.GAE_SERVICE || process.env.GAE_INSTANCE || 
                       (process.env.GOOGLE_CLOUD_PROJECT && process.env.NODE_ENV === 'production');
    
    if (isAppEngine) {
      try {
        const client = new SecretManagerServiceClient();
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'project-6c0d0bce-1897-4806-852';
        const name = `projects/${projectId}/secrets/DATABASE_URL/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        return version.payload.data.toString();
      } catch (error) {
        console.error('Error fetching DATABASE_URL from Secret Manager:', error);
        throw new Error('Failed to get DATABASE_URL from Secret Manager: ' + error.message);
      }
    }

    throw new Error('DATABASE_URL not found. Please set DATABASE_URL environment variable for local development.');
  })();

  return databaseUrlPromise;
}

// Create connection pool
let pool = null;
let poolInitialized = false;

async function initializePool() {
  if (poolInitialized && pool) {
    return pool;
  }

  const connectionString = await getDatabaseUrl();
  
  // Determine SSL configuration
  // Unix socket connections (Cloud SQL via App Engine) don't support SSL
  // TCP connections (local development with Cloud SQL Proxy) may need SSL
  const isUnixSocket = connectionString.includes('/cloudsql/');
  const sslConfig = isUnixSocket ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false);
  
  pool = new Pool({
    connectionString: connectionString,
    ssl: sslConfig
  });

  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  poolInitialized = true;
  return pool;
}

// Initialize pool immediately (non-blocking)
initializePool().catch(err => {
  console.error('Failed to initialize database pool:', err);
});

// Reusable query helper function
// Executes SQL queries and returns results
// Usage: const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
const query = async (text, params) => {
  // Ensure pool is initialized
  const dbPool = await initializePool();
  const start = Date.now();
  try {
    const res = await dbPool.query(text, params);
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
  get pool() {
    return initializePool();
  }
};

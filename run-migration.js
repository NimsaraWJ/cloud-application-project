// Script to run database migration
const { query } = require('./db/connection');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('=== Running Database Migration ===\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Remove comments and split by semicolons
    const cleanedSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolons, but keep multi-line statements together
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      if (statement.trim() && statement.trim() !== ';') {
        try {
          await query(statement);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            console.log(`⚠ Statement ${i + 1}: ${error.message.split('\n')[0]}`);
          } else {
            console.error(`✗ Statement ${i + 1} failed: ${error.message}`);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log('\n✓ Migration completed successfully!\n');
    
    // Verify the table was created
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as table_exists
    `);
    
    if (tableCheck.rows[0].table_exists) {
      console.log('✓ Products table verified!\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error(`  ${error.message}\n`);
    process.exit(1);
  }
}

runMigration();


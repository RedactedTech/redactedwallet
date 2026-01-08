const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:NajctWeCLYaSywSNHKxkWElcSbTsDSPc@caboose.proxy.rlwy.net:58182/railway';

const pool = new Pool({ connectionString });

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_session_password_to_trades...');

    const sql = fs.readFileSync(
      path.join(__dirname, '../backend/src/db/migrations/add_session_password_to_trades.sql'),
      'utf8'
    );

    await pool.query(sql);

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

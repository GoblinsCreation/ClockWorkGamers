import { pool } from '../server/db';

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Add referral_code column to users table
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
    `);
    console.log('Added referral_code column to users table');
    
    // Create chat_messages table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        room_id TEXT NOT NULL DEFAULT 'public',
        message TEXT NOT NULL,
        sent_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created chat_messages table');
    
    // Create referrals table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER NOT NULL,
        referred_id INTEGER NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending',
        reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created referrals table');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
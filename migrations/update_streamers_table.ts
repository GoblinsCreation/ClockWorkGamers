/**
 * Migration script to update the streamers table with additional Twitch API fields
 * Run with: npx tsx migrations/update_streamers_table.ts
 */
import { db } from "../server/db";
import { sql } from 'drizzle-orm';
import { streamers } from '../shared/schema';
import { log } from '../server/vite';

async function runMigration() {
  console.log('Starting migration: update streamers table');
  
  try {
    // Add new columns to streamers table
    await db.execute(sql`
      ALTER TABLE streamers
      ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP,
      ADD COLUMN IF NOT EXISTS game_id TEXT,
      ADD COLUMN IF NOT EXISTS stream_type TEXT,
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS language TEXT;
    `);
    
    console.log('Successfully added new columns to streamers table');
    
    // Update last_updated for all existing streamers
    await db.update(streamers)
      .set({ lastUpdated: new Date() })
      .where(sql`true`);
      
    console.log('Successfully updated lastUpdated for existing streamers');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigration();
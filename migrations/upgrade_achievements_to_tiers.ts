/**
 * Migration script to upgrade the achievement system with tier progression
 * Run with: npx tsx migrations/upgrade_achievements_to_tiers.ts
 */
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

async function runMigration() {
  console.log('Starting achievement system upgrade to support tier progression...');
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);

  try {
    // 1. Add next_tier_unlocked to user_achievement_progress
    console.log('Adding next_tier_unlocked column to user_achievement_progress table...');
    await db.execute(sql`
      ALTER TABLE user_achievement_progress
      ADD COLUMN IF NOT EXISTS next_tier_unlocked BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    // 2. Create achievement_series table if it doesn't exist
    console.log('Creating achievement_series table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS achievement_series (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        base_icon TEXT NOT NULL,
        category TEXT NOT NULL,
        requirement_type TEXT NOT NULL,
        base_requirement_value INTEGER NOT NULL,
        max_tier INTEGER NOT NULL DEFAULT 6,
        base_reward_type TEXT NOT NULL,
        base_reward_value INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Add series_id to guild_achievements table
    console.log('Adding series_id to guild_achievements table...');
    await db.execute(sql`
      ALTER TABLE guild_achievements
      ADD COLUMN IF NOT EXISTS series_id INTEGER REFERENCES achievement_series(id),
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'gaming',
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
    `);

    // 4. Update existing guild_achievements with a category if null
    console.log('Updating existing achievements with missing category...');
    await db.execute(sql`
      UPDATE guild_achievements
      SET category = 'gaming'
      WHERE category IS NULL;
    `);

    // 5. Create user_series_progress table
    console.log('Creating user_series_progress table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_series_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        series_id INTEGER NOT NULL REFERENCES achievement_series(id),
        current_tier INTEGER NOT NULL DEFAULT 0,
        highest_achievement_id INTEGER REFERENCES guild_achievements(id),
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, series_id)
      );
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});
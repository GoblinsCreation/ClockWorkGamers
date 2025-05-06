/**
 * Migration script to create user_preferences and user_interests tables
 * Run with: npx tsx migrations/create_onboarding_tables.ts
 */
import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Creating onboarding tables...");

    // Create user_preferences table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        experience_level TEXT NOT NULL DEFAULT 'beginner',
        email_notifications BOOLEAN NOT NULL DEFAULT true,
        browser_notifications BOOLEAN NOT NULL DEFAULT true,
        achievement_notifications BOOLEAN NOT NULL DEFAULT true,
        event_notifications BOOLEAN NOT NULL DEFAULT true,
        onboarding_completed BOOLEAN NOT NULL DEFAULT false,
        onboarding_completed_at TIMESTAMP,
        onboarding_skipped BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create user_interests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_interests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        interest_type TEXT NOT NULL,
        interest_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add foreign key constraints
    await db.execute(sql`
      ALTER TABLE user_preferences
      ADD CONSTRAINT fk_user_preferences_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
    `);

    await db.execute(sql`
      ALTER TABLE user_interests
      ADD CONSTRAINT fk_user_interests_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
    `);

    // Add index for performance
    await db.execute(sql`
      CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX idx_user_interests_type ON user_interests(interest_type);
    `);

    console.log("Successfully created onboarding tables");
  } catch (error) {
    console.error("Error creating onboarding tables:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
/**
 * Migration script to create payment, course_purchases, and rental_purchases tables
 * Run with: npx tsx migrations/create_payment_tables.ts
 */
import { db, pool } from "../server/db";
import {
  payments,
  coursePurchases,
  rentalPurchases,
} from "../shared/schema";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Starting migration to create payment tables...");

  try {
    // Create payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "amount" INTEGER NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'usd',
        "status" TEXT NOT NULL,
        "payment_method" TEXT NOT NULL,
        "payment_intent_id" TEXT,
        "paypal_order_id" TEXT,
        "description" TEXT,
        "metadata" JSONB DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Created payments table");

    // Create course_purchases table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "course_purchases" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "course_id" INTEGER NOT NULL,
        "payment_id" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "access_expires" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
        FOREIGN KEY ("course_id") REFERENCES "courses" ("id"),
        FOREIGN KEY ("payment_id") REFERENCES "payments" ("id")
      );
    `);
    console.log("Created course_purchases table");

    // Create rental_purchases table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "rental_purchases" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "rental_id" INTEGER NOT NULL,
        "payment_id" INTEGER NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
        FOREIGN KEY ("rental_id") REFERENCES "rentals" ("id"),
        FOREIGN KEY ("payment_id") REFERENCES "payments" ("id")
      );
    `);
    console.log("Created rental_purchases table");

    console.log("Successfully completed migration to create payment tables");
  } catch (error) {
    console.error("Error running migration:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
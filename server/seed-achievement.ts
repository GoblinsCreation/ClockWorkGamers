/**
 * Script to seed initial achievements
 */
import { db } from './db';
import { guildAchievements, InsertGuildAchievement } from '@shared/schema';

const initialAchievements: InsertGuildAchievement[] = [
  {
    name: "Welcome to CWG",
    description: "Join ClockWork Gamers and complete your profile",
    icon: "trophy",
    requirementType: "profile_complete",
    requirementValue: 1,
    rewardType: "tokens",
    rewardValue: 100,
    tier: 1,
    isGlobal: true
  },
  {
    name: "Social Butterfly",
    description: "Connect all your social media accounts",
    icon: "award",
    requirementType: "social_accounts",
    requirementValue: 3,
    rewardType: "tokens",
    rewardValue: 200,
    tier: 1,
    isGlobal: true
  },
  {
    name: "Game Enthusiast",
    description: "Add 3 games to your profile",
    icon: "gamepad",
    requirementType: "games_added",
    requirementValue: 3,
    rewardType: "tokens",
    rewardValue: 150,
    tier: 1,
    isGlobal: true
  },
  {
    name: "First Referral",
    description: "Refer a friend to join ClockWork Gamers",
    icon: "star",
    requirementType: "referrals",
    requirementValue: 1,
    rewardType: "tokens",
    rewardValue: 300,
    tier: 1,
    isGlobal: true
  },
  {
    name: "Crypto Novice",
    description: "Connect your first Web3 wallet",
    icon: "sparkle",
    requirementType: "wallet_connect",
    requirementValue: 1,
    rewardType: "tokens",
    rewardValue: 250,
    tier: 1,
    isGlobal: true
  }
];

export async function seedAchievements() {
  try {
    console.log("Seeding achievements...");
    
    // Check if achievements already exist to avoid duplicates
    const existingAchievements = await db.select().from(guildAchievements);
    
    if (existingAchievements.length > 0) {
      console.log(`${existingAchievements.length} achievements already exist, skipping seed.`);
      return;
    }
    
    // Insert achievements
    const result = await db.insert(guildAchievements).values(initialAchievements).returning();
    
    console.log(`Successfully seeded ${result.length} achievements.`);
  } catch (error) {
    console.error("Error seeding achievements:", error);
  }
}

// Note: Direct execution of this module is supported via npx tsx
// or can be called from index.ts during server startup
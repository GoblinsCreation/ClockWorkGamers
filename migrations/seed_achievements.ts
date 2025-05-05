import { db } from "../server/db";
import { guildAchievements } from "../shared/schema";

/**
 * Seed script to add initial guild achievements
 * Run with: npx tsx migrations/seed_achievements.ts
 */
async function seedAchievements() {
  console.log("Starting to seed achievements...");

  // Check if achievements already exist to avoid duplicates
  const existingAchievements = await db.select().from(guildAchievements);
  
  if (existingAchievements.length > 0) {
    console.log(`Found ${existingAchievements.length} existing achievements.`);
    console.log("To re-seed achievements, first clear the existing ones.");
    return;
  }

  const initialAchievements = [
    {
      name: "Welcome to the Guild",
      description: "Join ClockWork Gamers and create an account",
      icon: "trophy",
      category: "onboarding",
      requirementType: "join",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 10
    },
    {
      name: "Profile Master",
      description: "Complete your profile with avatar and bio",
      icon: "star",
      category: "onboarding",
      requirementType: "profile_completion",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 25
    },
    {
      name: "Social Networker",
      description: "Connect your social media accounts",
      icon: "star",
      category: "onboarding",
      requirementType: "social_connections",
      requirementValue: 2,
      rewardType: "tokens",
      rewardValue: 15
    },
    {
      name: "Wallet Warrior",
      description: "Connect your cryptocurrency wallet",
      icon: "shield",
      category: "web3",
      requirementType: "wallet_connection",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 50
    },
    {
      name: "First Transaction",
      description: "Make your first transaction with CWG tokens",
      icon: "star",
      category: "web3",
      requirementType: "token_transaction",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 20
    },
    {
      name: "NFT Collector",
      description: "Purchase your first CWG NFT",
      icon: "star",
      category: "web3",
      requirementType: "nft_purchase",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 100
    },
    {
      name: "Conversation Starter",
      description: "Send your first message in the chat",
      icon: "shield",
      category: "community",
      requirementType: "chat_message",
      requirementValue: 1,
      rewardType: "points",
      rewardValue: 5
    },
    {
      name: "Active Chatter",
      description: "Send 50 messages in the chat",
      icon: "shield",
      category: "community",
      requirementType: "chat_message",
      requirementValue: 50,
      rewardType: "points",
      rewardValue: 25
    },
    {
      name: "Community Builder",
      description: "Refer a friend to join the guild",
      icon: "star",
      category: "community",
      requirementType: "referral",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 30
    },
    {
      name: "Referral Champion",
      description: "Refer 5 friends to join the guild",
      icon: "trophy",
      category: "community",
      requirementType: "referral",
      requirementValue: 5,
      rewardType: "tokens",
      rewardValue: 200
    },
    {
      name: "Streaming Debut",
      description: "Go live with your first stream",
      icon: "star",
      category: "streaming",
      requirementType: "stream",
      requirementValue: 1,
      rewardType: "xp",
      rewardValue: 50
    },
    {
      name: "Stream Marathon",
      description: "Stream for a total of 10 hours",
      icon: "trophy",
      category: "streaming",
      requirementType: "stream_hours",
      requirementValue: 10,
      rewardType: "xp",
      rewardValue: 200
    },
    {
      name: "Game Explorer",
      description: "Play 5 different games within the guild",
      icon: "star",
      category: "gaming",
      requirementType: "unique_games",
      requirementValue: 5,
      rewardType: "points",
      rewardValue: 50
    },
    {
      name: "Tournament Participant",
      description: "Participate in your first tournament",
      icon: "shield",
      category: "gaming",
      requirementType: "tournament",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 25
    },
    {
      name: "Tournament Winner",
      description: "Win a tournament",
      icon: "trophy",
      category: "gaming",
      requirementType: "tournament_win",
      requirementValue: 1,
      rewardType: "tokens",
      rewardValue: 100
    },
    {
      name: "Rental Pioneer",
      description: "Rent your first NFT or in-game item",
      icon: "star",
      category: "rentals",
      requirementType: "rental",
      requirementValue: 1,
      rewardType: "points",
      rewardValue: 10
    },
    {
      name: "Knowledge Seeker",
      description: "Complete your first course",
      icon: "star",
      category: "learning",
      requirementType: "course_completion",
      requirementValue: 1,
      rewardType: "xp",
      rewardValue: 50
    },
    {
      name: "Guild Scholar",
      description: "Complete 5 courses",
      icon: "trophy",
      category: "learning",
      requirementType: "course_completion",
      requirementValue: 5,
      rewardType: "tokens",
      rewardValue: 75
    },
    {
      name: "First Investment",
      description: "Make your first investment",
      icon: "shield",
      category: "investment",
      requirementType: "investment",
      requirementValue: 1,
      rewardType: "points",
      rewardValue: 25
    },
    {
      name: "Diamond Hands",
      description: "Hold an investment for 30 days",
      icon: "trophy",
      category: "investment",
      requirementType: "investment_duration",
      requirementValue: 30,
      rewardType: "tokens",
      rewardValue: 50
    }
  ];

  // Insert all achievements
  await db.insert(guildAchievements).values(initialAchievements);
  
  console.log(`Successfully seeded ${initialAchievements.length} achievements.`);
}

// Self-executing async function
(async () => {
  try {
    await seedAchievements();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding achievements:", error);
    process.exit(1);
  }
})();
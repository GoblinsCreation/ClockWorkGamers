/**
 * Onboarding Service for ClockWork Gamers
 * 
 * Handles user onboarding flow, preferences, and personalization.
 */
import { Request, Response } from 'express';
import { db } from './db';
import { users, userProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { createNotification } from './notifications';

// Define the schema directly due to schema updates
import { pgTable, serial, integer, text, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";

const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  experienceLevel: text("experience_level").notNull().default('beginner'),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  browserNotifications: boolean("browser_notifications").default(true).notNull(),
  achievementNotifications: boolean("achievement_notifications").default(true).notNull(),
  eventNotifications: boolean("event_notifications").default(true).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  onboardingSkipped: boolean("onboarding_skipped").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const userInterests = pgTable("user_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  interestType: text("interest_type").notNull(), // "game", "web3", "goal"
  interestId: text("interest_id").notNull(), // The ID of the game, web3 interest, or goal
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Check if a user needs to go through the onboarding process
 */
export async function checkOnboardingStatus(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user.id;

  try {
    // Check if user has completed onboarding by looking for preferences record
    const [preferences] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    // Check if user has interests set
    const interests = await db.select()
      .from(userInterests)
      .where(eq(userInterests.userId, userId));

    // User needs onboarding if they don't have preferences or interests
    const needsOnboarding = !preferences || interests.length === 0;

    return res.json({ needsOnboarding });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return res.status(500).json({ message: 'Server error checking onboarding status' });
  }
}

/**
 * Save user preferences and interests during onboarding
 */
export async function completeOnboarding(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user.id;
  
  const {
    preferredGames,
    experienceLevel,
    web3Interests,
    primaryGoals,
    bio,
    notifications,
  } = req.body;

  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      // Update user profile bio
      // Find if user has a profile
      const [existingProfile] = await tx.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
      
      if (existingProfile) {
        await tx.update(userProfiles)
          .set({ bio })
          .where(eq(userProfiles.userId, userId));
      } else {
        await tx.insert(userProfiles)
          .values({ 
            userId,
            bio,
            displayName: req.user.username,
          });
      }

      // Check if preferences already exist
      const [existingPrefs] = await tx.select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));

      // Update or insert preferences
      if (existingPrefs) {
        await tx.update(userPreferences)
          .set({
            experienceLevel,
            emailNotifications: notifications.email,
            browserNotifications: notifications.browser,
            achievementNotifications: notifications.achievements,
            eventNotifications: notifications.events,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
          })
          .where(eq(userPreferences.userId, userId));
      } else {
        await tx.insert(userPreferences)
          .values({
            userId,
            experienceLevel,
            emailNotifications: notifications.email,
            browserNotifications: notifications.browser,
            achievementNotifications: notifications.achievements,
            eventNotifications: notifications.events,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
          });
      }

      // Clear existing interests
      await tx.delete(userInterests)
        .where(eq(userInterests.userId, userId));

      // Insert new interests (games)
      for (const gameId of preferredGames) {
        await tx.insert(userInterests)
          .values({
            userId,
            interestType: 'game',
            interestId: gameId,
          });
      }

      // Insert new interests (web3)
      for (const web3Id of web3Interests) {
        await tx.insert(userInterests)
          .values({
            userId,
            interestType: 'web3',
            interestId: web3Id,
          });
      }

      // Insert new interests (goals)
      for (const goalId of primaryGoals) {
        await tx.insert(userInterests)
          .values({
            userId,
            interestType: 'goal',
            interestId: goalId,
          });
      }
    });

    // Create a welcome notification
    await createNotification({
      userId,
      type: 'system',
      title: 'Welcome to ClockWork Gamers!',
      message: 'Your profile has been personalized based on your preferences. Explore the platform to discover features tailored to your interests!',
      isRead: false,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return res.status(500).json({ message: 'Server error saving onboarding data' });
  }
}

/**
 * Skip the onboarding process
 */
export async function skipOnboarding(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user.id;

  try {
    // Set basic preference record to indicate onboarding was skipped
    const [existingPrefs] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (existingPrefs) {
      await db.update(userPreferences)
        .set({
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          onboardingSkipped: true,
        })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences)
        .values({
          userId,
          experienceLevel: 'beginner', // Default value
          emailNotifications: true,
          browserNotifications: true,
          achievementNotifications: true,
          eventNotifications: true,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          onboardingSkipped: true,
        });
    }

    // Create a default welcome notification
    await createNotification({
      userId,
      type: 'system',
      title: 'Welcome to ClockWork Gamers!',
      message: 'You can personalize your experience anytime from your profile settings.',
      isRead: false,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    return res.status(500).json({ message: 'Server error skipping onboarding' });
  }
}

/**
 * Get user's personalized content recommendations based on preferences
 */
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user.id;

  try {
    // Get user interests
    const interests = await db.select()
      .from(userInterests)
      .where(eq(userInterests.userId, userId));

    // Get game categories they're interested in
    const gameInterests = interests
      .filter(interest => interest.interestType === 'game')
      .map(interest => interest.interestId);

    // Get web3 areas they're interested in
    const web3Interests = interests
      .filter(interest => interest.interestType === 'web3')
      .map(interest => interest.interestId);

    // Get user goals
    const userGoals = interests
      .filter(interest => interest.interestType === 'goal')
      .map(interest => interest.interestId);

    // Get user experience level
    const [preferences] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    // Here you would implement logic to fetch personalized recommendations
    // based on the user's interests, goals, and experience level
    // This is a placeholder implementation
    const recommendations = {
      featuredGames: [], 
      suggestedCourses: [],
      recommendedStreamers: [],
      relevantNews: [],
      upcomingEvents: []
    };

    return res.json(recommendations);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return res.status(500).json({ message: 'Server error fetching recommendations' });
  }
}
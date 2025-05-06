/**
 * Achievement Service for ClockWork Gamers
 * 
 * Handles guild achievements, user progress, and reward claims.
 */
import { Request, Response } from "express";
import { db } from "./db";
import { 
  guildAchievements, 
  userAchievementProgress, 
  users, 
  InsertUserAchievementProgress,
  UserAchievementProgress,
  GuildAchievement 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { createNotification, createAchievementUnlockedNotification, createAchievementClaimedNotification } from "./notifications";

// Type combining achievement with progress data
export type AchievementWithProgress = GuildAchievement & {
  progress: UserAchievementProgress | null;
};

/**
 * Get all achievements with user's progress
 */
export async function getUserAchievements(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
    
    // First, get all achievements
    const allAchievements = await db.select().from(guildAchievements);
    
    // Then get this user's progress on all achievements
    const userProgress = await db.select()
      .from(userAchievementProgress)
      .where(eq(userAchievementProgress.userId, userId));
    
    // Map progress to each achievement
    const achievementsWithProgress: AchievementWithProgress[] = allAchievements.map(achievement => {
      const progress = userProgress.find(p => p.achievementId === achievement.id) || null;
      return {
        ...achievement,
        progress: progress
      };
    });
    
    res.json(achievementsWithProgress);
  } catch (error) {
    console.error("Error getting user achievements:", error);
    res.status(500).json({ error: "Failed to get achievements" });
  }
}

/**
 * Get user's completed achievements
 */
export async function getUserCompletedAchievements(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
    
    // Get the user's completed achievements
    const userProgress = await db.select()
      .from(userAchievementProgress)
      .where(and(
        eq(userAchievementProgress.userId, userId),
        eq(userAchievementProgress.isCompleted, true)
      ));
    
    // Get the achievement details for all completed achievements
    if (userProgress.length === 0) {
      return res.json([]);
    }
    
    const achievementIds = userProgress.map(p => p.achievementId);
    const completedAchievements = await db.select()
      .from(guildAchievements)
      .where(
        achievementIds.length > 0 
          ? eq(guildAchievements.id, achievementIds[0]) // For simplicity, using first ID
          : undefined
      );
    
    // Combine achievement data with progress data
    const achievementsWithProgress: AchievementWithProgress[] = completedAchievements.map(achievement => {
      const progress = userProgress.find(p => p.achievementId === achievement.id) || null;
      return {
        ...achievement,
        progress: progress
      };
    });
    
    res.json(achievementsWithProgress);
  } catch (error) {
    console.error("Error getting completed achievements:", error);
    res.status(500).json({ error: "Failed to get completed achievements" });
  }
}

/**
 * Update user's progress on an achievement
 */
export async function updateAchievementProgress(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { achievementId, valueToAdd = 1 } = req.body;
    const userId = req.user.id;
    
    if (!achievementId) {
      return res.status(400).json({ error: "Achievement ID is required" });
    }
    
    // Get the achievement
    const [achievement] = await db.select()
      .from(guildAchievements)
      .where(eq(guildAchievements.id, achievementId));
    
    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }
    
    // Get or create progress record
    let [progress] = await db.select()
      .from(userAchievementProgress)
      .where(and(
        eq(userAchievementProgress.userId, userId),
        eq(userAchievementProgress.achievementId, achievementId)
      ));
    
    if (!progress) {
      // Create a new progress record if none exists
      const newProgress: InsertUserAchievementProgress = {
        userId,
        achievementId,
        currentValue: 0,
        isCompleted: false,
        rewardClaimed: false
      };
      
      const [created] = await db.insert(userAchievementProgress)
        .values(newProgress)
        .returning();
        
      progress = created;
    }
    
    // Update progress if not already completed
    if (!progress.isCompleted) {
      // Calculate new value
      const newValue = progress.currentValue + valueToAdd;
      const isNowCompleted = newValue >= achievement.requirementValue;
      
      // Update progress
      const [updated] = await db.update(userAchievementProgress)
        .set({ 
          currentValue: newValue, 
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? new Date() : undefined
        })
        .where(eq(userAchievementProgress.id, progress.id))
        .returning();
      
      // Send notification if newly completed
      if (isNowCompleted && !progress.isCompleted) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        
        await createAchievementUnlockedNotification(
          userId,
          achievement.id,
          achievement.name,
          achievement.rewardType,
          achievement.rewardValue
        );
      }
      
      res.json(updated);
    } else {
      // Already completed
      res.json(progress);
    }
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    res.status(500).json({ error: "Failed to update achievement progress" });
  }
}

/**
 * Claim a reward for a completed achievement
 */
export async function claimAchievementReward(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const achievementId = parseInt(req.params.achievementId);
    const userId = req.user.id;
    
    // Check if achievement exists and is completed but not claimed
    const [progress] = await db.select()
      .from(userAchievementProgress)
      .where(and(
        eq(userAchievementProgress.userId, userId),
        eq(userAchievementProgress.achievementId, achievementId),
        eq(userAchievementProgress.isCompleted, true),
        eq(userAchievementProgress.rewardClaimed, false)
      ));
    
    if (!progress) {
      return res.status(404).json({ 
        error: "Achievement not found, not completed, or already claimed" 
      });
    }
    
    // Get achievement details
    const [achievement] = await db.select()
      .from(guildAchievements)
      .where(eq(guildAchievements.id, achievementId));
    
    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }
    
    // Update achievement progress to claimed
    await db.update(userAchievementProgress)
      .set({ rewardClaimed: true })
      .where(eq(userAchievementProgress.id, progress.id));
    
    // TODO: Logic to actually give the reward to the user
    // This would depend on the reward type (e.g., tokens, badge, discount)
    // For now, we'll just return the reward info
    
    // Send notification
    await createAchievementClaimedNotification(
      userId,
      achievement.id,
      achievement.name,
      achievement.rewardType,
      achievement.rewardValue
    );
    
    res.json({ 
      achievementId,
      rewardType: achievement.rewardType, 
      rewardValue: achievement.rewardValue,
      success: true
    });
  } catch (error) {
    console.error("Error claiming achievement reward:", error);
    res.status(500).json({ error: "Failed to claim achievement reward" });
  }
}

/**
 * Create a new achievement (admin only)
 */
export async function createAchievement(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const achievementData = req.body;
    
    // Insert new achievement
    const [achievement] = await db.insert(guildAchievements)
      .values(achievementData)
      .returning();
    
    res.status(201).json(achievement);
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).json({ error: "Failed to create achievement" });
  }
}

/**
 * Update an existing achievement (admin only)
 */
export async function updateAchievement(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const achievementId = parseInt(req.params.id);
    const achievementData = req.body;
    
    // Check if achievement exists
    const [existing] = await db.select()
      .from(guildAchievements)
      .where(eq(guildAchievements.id, achievementId));
    
    if (!existing) {
      return res.status(404).json({ error: "Achievement not found" });
    }
    
    // Update achievement
    const [updated] = await db.update(guildAchievements)
      .set(achievementData)
      .where(eq(guildAchievements.id, achievementId))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating achievement:", error);
    res.status(500).json({ error: "Failed to update achievement" });
  }
}

/**
 * Delete an achievement (admin only)
 */
export async function deleteAchievement(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const achievementId = parseInt(req.params.id);
    
    // Delete related progress first
    await db.delete(userAchievementProgress)
      .where(eq(userAchievementProgress.achievementId, achievementId));
    
    // Then delete the achievement
    await db.delete(guildAchievements)
      .where(eq(guildAchievements.id, achievementId));
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting achievement:", error);
    res.status(500).json({ error: "Failed to delete achievement" });
  }
}
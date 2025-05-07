import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  guild: text("guild").notNull(),
  discordUsername: text("discord_username"),
  twitchHandle: text("twitch_handle"),
  referralCode: text("referral_code").unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  role: text("role").default("User").notNull(), // Can be "User", "Mod", "Admin", "Owner"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

// Streamer model
export const streamers = pgTable("streamers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  displayName: text("display_name").notNull(),
  twitchId: text("twitch_id").notNull(),
  profileImageUrl: text("profile_image_url"),
  isLive: boolean("is_live").default(false).notNull(),
  currentGame: text("current_game"),
  streamTitle: text("stream_title"),
  viewerCount: integer("viewer_count").default(0).notNull(),
});

export const insertStreamerSchema = createInsertSchema(streamers)
  .omit({ id: true });

// Course model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  game: text("game").notNull(),
  courseType: text("course_type").notNull(),
  imageUrl: text("image_url"),
  instructorId: integer("instructor_id").notNull(),
});

export const insertCourseSchema = createInsertSchema(courses)
  .omit({ id: true });

// Rental model
export const rentals = pgTable("rentals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  itemType: text("item_type").notNull(),
  rarity: text("rarity").notNull(),
  game: text("game").notNull(),
  pricePerDay: integer("price_per_day").notNull(),
  available: boolean("available").default(true).notNull(),
  imageUrl: text("image_url"),
});

export const insertRentalSchema = createInsertSchema(rentals)
  .omit({ id: true });

// Rental Request model
export const rentalRequests = pgTable("rental_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rentalId: integer("rental_id"),
  customRequest: text("custom_request"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").default("pending").notNull(),
  totalPrice: integer("total_price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRentalRequestSchema = createInsertSchema(rentalRequests)
  .omit({ id: true, createdAt: true });

// News/Updates model
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  authorId: integer("author_id").notNull(),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
});

export const insertNewsSchema = createInsertSchema(news)
  .omit({ id: true, publishDate: true });

// Streamer Schedule model
export const streamerSchedules = pgTable("streamer_schedules", {
  id: serial("id").primaryKey(),
  streamerId: integer("streamer_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
  startTime: text("start_time").notNull(), // 24h format e.g. "18:00"
  endTime: text("end_time").notNull(), // 24h format e.g. "22:00"
  game: text("game"),
  title: text("title"),
  notes: text("notes"),
  isSpecialEvent: boolean("is_special_event").default(false).notNull(),
});

export const insertStreamerScheduleSchema = createInsertSchema(streamerSchedules)
  .omit({ id: true });

// User Profiles model
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  discordUsername: text("discord_username"),
  twitterUsername: text("twitter_username"),
  twitchUsername: text("twitch_username"),
  kickUsername: text("kick_username"),
  youtubeChannel: text("youtube_channel"),
  gameIds: text("game_ids").array(),
  preferences: jsonb("preferences").notNull().default({
    emailNotifications: true,
    showWalletAddress: false,
    darkMode: true
  }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles)
  .omit({ id: true, updatedAt: true });

// Chat Messages model
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomId: text("room_id").default("public").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages)
  .omit({ id: true, sentAt: true });

// Referrals model
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull().unique(),
  status: text("status").default("pending").notNull(),
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referrals)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Relations definitions
export const usersRelations = relations(users, ({ many, one }) => ({
  streamers: many(streamers),
  rentalRequests: many(rentalRequests),
  newsAuthored: many(news, { relationName: "author" }),
  coursesInstructed: many(courses, { relationName: "instructor" }),
  profile: one(userProfiles),
  chatMessages: many(chatMessages),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" })
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}));

export const streamersRelations = relations(streamers, ({ one, many }) => ({
  user: one(users, {
    fields: [streamers.userId],
    references: [users.id],
  }),
  schedules: many(streamerSchedules),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
}));

export const rentalRequestsRelations = relations(rentalRequests, ({ one }) => ({
  user: one(users, {
    fields: [rentalRequests.userId],
    references: [users.id],
  }),
  rental: one(rentals, {
    fields: [rentalRequests.rentalId],
    references: [rentals.id],
  }),
}));

export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
    relationName: "author",
  }),
}));

export const streamerScheduleRelations = relations(streamerSchedules, ({ one }) => ({
  streamer: one(streamers, {
    fields: [streamerSchedules.streamerId],
    references: [streamers.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStreamer = z.infer<typeof insertStreamerSchema>;
export type Streamer = typeof streamers.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentals.$inferSelect;

export type InsertRentalRequest = z.infer<typeof insertRentalRequestSchema>;
export type RentalRequest = typeof rentalRequests.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export type InsertStreamerSchedule = z.infer<typeof insertStreamerScheduleSchema>;
export type StreamerSchedule = typeof streamerSchedules.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Notifications model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., "rental_request", "message", "streamer_live", etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"), // Optional link for the notification to redirect to
  metadata: jsonb("metadata"), // Additional data related to the notification
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true });

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Guild Achievements model
export const guildAchievements = pgTable("guild_achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Path to achievement icon or icon name
  requirementType: text("requirement_type").notNull(), // e.g., "rentals_count", "members_count", "streams_watched"
  requirementValue: integer("requirement_value").notNull(), // The threshold value required to unlock
  rewardType: text("reward_type").notNull(), // e.g., "tokens", "badge", "discount"
  rewardValue: integer("reward_value").notNull(), // The amount of reward
  tier: integer("tier").default(1).notNull(), // For achievements with multiple tiers (1, 2, 3, etc.)
  isGlobal: boolean("is_global").default(true).notNull(), // Whether achievement applies guild-wide or individually
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGuildAchievementSchema = createInsertSchema(guildAchievements)
  .omit({ id: true, createdAt: true });

// User Achievement Progress model
export const userAchievementProgress = pgTable("user_achievement_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  currentValue: integer("current_value").default(0).notNull(), // Current progress towards requirement
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"), // When the achievement was completed
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserAchievementProgressSchema = createInsertSchema(userAchievementProgress)
  .omit({ id: true, updatedAt: true });

export const userAchievementProgressRelations = relations(userAchievementProgress, ({ one }) => ({
  user: one(users, {
    fields: [userAchievementProgress.userId],
    references: [users.id],
  }),
  achievement: one(guildAchievements, {
    fields: [userAchievementProgress.achievementId],
    references: [guildAchievements.id],
  }),
}));

export type InsertGuildAchievement = z.infer<typeof insertGuildAchievementSchema>;
export type GuildAchievement = typeof guildAchievements.$inferSelect;
export type InsertUserAchievementProgress = z.infer<typeof insertUserAchievementProgressSchema>;
export type UserAchievementProgress = typeof userAchievementProgress.$inferSelect;

// User Preferences model - for onboarding and personalization
export const userPreferences = pgTable("user_preferences", {
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

export const insertUserPreferencesSchema = createInsertSchema(userPreferences)
  .omit({ id: true, updatedAt: true });

// User Interests model - for games, web3 interests, and goals
export const userInterests = pgTable("user_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  interestType: text("interest_type").notNull(), // "game", "web3", "goal"
  interestId: text("interest_id").notNull(), // The ID of the game, web3 interest, or goal
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userInterestUnique: primaryKey({ columns: [table.userId, table.interestType, table.interestId] }),
  };
});

export const insertUserInterestSchema = createInsertSchema(userInterests)
  .omit({ id: true, createdAt: true });

// Relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.userId],
    references: [users.id]
  })
}));

// Add relations to users
export const usersRelationUpdate = relations(users, ({ many, one }) => ({
  streamers: many(streamers),
  rentalRequests: many(rentalRequests),
  newsAuthored: many(news, { relationName: "author" }),
  coursesInstructed: many(courses, { relationName: "instructor" }),
  profile: one(userProfiles),
  preferences: one(userPreferences),
  interests: many(userInterests),
  chatMessages: many(chatMessages),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" })
}));

// Type exports
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type InsertUserInterest = z.infer<typeof insertUserInterestSchema>;
export type UserInterest = typeof userInterests.$inferSelect;

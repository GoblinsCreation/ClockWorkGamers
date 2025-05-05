import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, jsonb } from "drizzle-orm/pg-core";
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
  isAdmin: boolean("is_admin").default(false).notNull(),
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

// Relations definitions
export const usersRelations = relations(users, ({ many, one }) => ({
  streamers: many(streamers),
  rentalRequests: many(rentalRequests),
  newsAuthored: many(news, { relationName: "author" }),
  coursesInstructed: many(courses, { relationName: "instructor" }),
  profile: one(userProfiles)
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

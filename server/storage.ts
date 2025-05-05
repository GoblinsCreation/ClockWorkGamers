import { 
  users, type User, type InsertUser,
  streamers, type Streamer, type InsertStreamer,
  courses, type Course, type InsertCourse,
  rentals, type Rental, type InsertRental,
  rentalRequests, type RentalRequest, type InsertRentalRequest,
  news as newsTable, type News, type InsertNews,
  streamerSchedules, type StreamerSchedule, type InsertStreamerSchedule,
  userProfiles, type UserProfile, type InsertUserProfile,
  chatMessages, type ChatMessage, type InsertChatMessage,
  referrals, type Referral, type InsertReferral
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc, and, asc, inArray, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { Store } from "express-session";
import type { QueryResult } from "pg";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  updateUserReferralCode(userId: number, referralCode: string): Promise<User | undefined>;
  updateUserRole(userId: number, role: string, isAdmin: boolean): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // User Profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, data: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  // Streamer operations
  getStreamer(id: number): Promise<Streamer | undefined>;
  getStreamerByUserId(userId: number): Promise<Streamer | undefined>;
  createStreamer(streamer: InsertStreamer): Promise<Streamer>;
  updateStreamer(id: number, data: Partial<Streamer>): Promise<Streamer | undefined>;
  listStreamers(): Promise<Streamer[]>;
  getLiveStreamers(): Promise<Streamer[]>;
  
  // Streamer Schedule operations
  getStreamerSchedule(id: number): Promise<StreamerSchedule | undefined>;
  createStreamerSchedule(schedule: InsertStreamerSchedule): Promise<StreamerSchedule>;
  updateStreamerSchedule(id: number, data: Partial<StreamerSchedule>): Promise<StreamerSchedule | undefined>;
  deleteStreamerSchedule(id: number): Promise<boolean>;
  listStreamerSchedulesByStreamerId(streamerId: number): Promise<StreamerSchedule[]>;
  
  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  listCourses(): Promise<Course[]>;
  listCoursesByGame(game: string): Promise<Course[]>;
  
  // Rental operations
  getRental(id: number): Promise<Rental | undefined>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(id: number, data: Partial<Rental>): Promise<Rental | undefined>;
  deleteRental(id: number): Promise<boolean>;
  listRentals(): Promise<Rental[]>;
  listRentalsByGame(game: string): Promise<Rental[]>;
  
  // Rental request operations
  getRentalRequest(id: number): Promise<RentalRequest | undefined>;
  createRentalRequest(request: InsertRentalRequest): Promise<RentalRequest>;
  updateRentalRequest(id: number, data: Partial<RentalRequest>): Promise<RentalRequest | undefined>;
  listRentalRequestsByUser(userId: number): Promise<RentalRequest[]>;
  listRentalRequests(): Promise<RentalRequest[]>;
  
  // News operations
  getNews(id: number): Promise<News | undefined>;
  createNews(newsItem: InsertNews): Promise<News>;
  updateNews(id: number, data: Partial<News>): Promise<News | undefined>;
  deleteNews(id: number): Promise<boolean>;
  listNews(limit?: number): Promise<News[]>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  deleteChatMessage(id: number): Promise<boolean>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferral(id: number): Promise<Referral | undefined>;
  updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  getUserReferredUsers(userId: number): Promise<User[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  getUserNotifications(userId: number, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllUserNotificationsAsRead(userId: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  
  // Session storage
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // User Profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [createdProfile] = await db.insert(userProfiles).values(profile).returning();
    return createdProfile;
  }
  
  async updateUserProfile(userId: number, data: Partial<UserProfile>): Promise<UserProfile | undefined> {
    // First check if profile exists
    const existingProfile = await this.getUserProfile(userId);
    
    if (!existingProfile) {
      // Create new profile if it doesn't exist
      return await this.createUserProfile({
        userId,
        ...data,
      } as InsertUserProfile);
    }
    
    // Update existing profile
    const [updatedProfile] = await db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId))
      .returning();
    
    return updatedProfile;
  }
  
  // Streamer methods
  async getStreamer(id: number): Promise<Streamer | undefined> {
    const [streamer] = await db.select().from(streamers).where(eq(streamers.id, id));
    return streamer;
  }
  
  async getStreamerByUserId(userId: number): Promise<Streamer | undefined> {
    const [streamer] = await db.select().from(streamers).where(eq(streamers.userId, userId));
    return streamer;
  }
  
  async createStreamer(insertStreamer: InsertStreamer): Promise<Streamer> {
    const [streamer] = await db.insert(streamers).values(insertStreamer).returning();
    return streamer;
  }
  
  async updateStreamer(id: number, data: Partial<Streamer>): Promise<Streamer | undefined> {
    const [streamer] = await db
      .update(streamers)
      .set(data)
      .where(eq(streamers.id, id))
      .returning();
    return streamer;
  }
  
  async listStreamers(): Promise<Streamer[]> {
    try {
      return await db
        .select({
          id: streamers.id,
          userId: streamers.userId,
          displayName: streamers.displayName,
          twitchId: streamers.twitchId,
          profileImageUrl: streamers.profileImageUrl,
          isLive: streamers.isLive,
          currentGame: streamers.currentGame,
          streamTitle: streamers.streamTitle,
          viewerCount: streamers.viewerCount
        })
        .from(streamers);
    } catch (error) {
      console.error("Error fetching streamers:", error);
      return [];
    }
  }
  
  async getLiveStreamers(): Promise<Streamer[]> {
    try {
      return await db
        .select({
          id: streamers.id,
          userId: streamers.userId,
          displayName: streamers.displayName,
          twitchId: streamers.twitchId,
          profileImageUrl: streamers.profileImageUrl,
          isLive: streamers.isLive,
          currentGame: streamers.currentGame,
          streamTitle: streamers.streamTitle,
          viewerCount: streamers.viewerCount
        })
        .from(streamers)
        .where(eq(streamers.isLive, true));
    } catch (error) {
      console.error("Error fetching live streamers:", error);
      return [];
    }
  }
  
  // Streamer Schedule methods
  async getStreamerSchedule(id: number): Promise<StreamerSchedule | undefined> {
    const [schedule] = await db.select().from(streamerSchedules).where(eq(streamerSchedules.id, id));
    return schedule;
  }
  
  async createStreamerSchedule(insertSchedule: InsertStreamerSchedule): Promise<StreamerSchedule> {
    const [schedule] = await db.insert(streamerSchedules).values(insertSchedule).returning();
    return schedule;
  }
  
  async updateStreamerSchedule(id: number, data: Partial<StreamerSchedule>): Promise<StreamerSchedule | undefined> {
    const [schedule] = await db
      .update(streamerSchedules)
      .set(data)
      .where(eq(streamerSchedules.id, id))
      .returning();
    return schedule;
  }
  
  async deleteStreamerSchedule(id: number): Promise<boolean> {
    const deleted = await db.delete(streamerSchedules).where(eq(streamerSchedules.id, id)).returning();
    return deleted.length > 0;
  }
  
  async listStreamerSchedulesByStreamerId(streamerId: number): Promise<StreamerSchedule[]> {
    return await db
      .select()
      .from(streamerSchedules)
      .where(eq(streamerSchedules.streamerId, streamerId));
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }
  
  async updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return course;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    const deleted = await db.delete(courses).where(eq(courses.id, id)).returning();
    return deleted.length > 0;
  }
  
  async listCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }
  
  async listCoursesByGame(game: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.game, game));
  }
  
  // Rental methods
  async getRental(id: number): Promise<Rental | undefined> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id));
    return rental;
  }
  
  async createRental(insertRental: InsertRental): Promise<Rental> {
    const [rental] = await db.insert(rentals).values(insertRental).returning();
    return rental;
  }
  
  async updateRental(id: number, data: Partial<Rental>): Promise<Rental | undefined> {
    const [rental] = await db
      .update(rentals)
      .set(data)
      .where(eq(rentals.id, id))
      .returning();
    return rental;
  }
  
  async deleteRental(id: number): Promise<boolean> {
    const deleted = await db.delete(rentals).where(eq(rentals.id, id)).returning();
    return deleted.length > 0;
  }
  
  async listRentals(): Promise<Rental[]> {
    return await db.select().from(rentals);
  }
  
  async listRentalsByGame(game: string): Promise<Rental[]> {
    return await db
      .select()
      .from(rentals)
      .where(eq(rentals.game, game));
  }
  
  // Rental request methods
  async getRentalRequest(id: number): Promise<RentalRequest | undefined> {
    const [request] = await db.select().from(rentalRequests).where(eq(rentalRequests.id, id));
    return request;
  }
  
  async createRentalRequest(insertRequest: InsertRentalRequest): Promise<RentalRequest> {
    const [request] = await db.insert(rentalRequests).values(insertRequest).returning();
    return request;
  }
  
  async updateRentalRequest(id: number, data: Partial<RentalRequest>): Promise<RentalRequest | undefined> {
    const [request] = await db
      .update(rentalRequests)
      .set(data)
      .where(eq(rentalRequests.id, id))
      .returning();
    return request;
  }
  
  async listRentalRequestsByUser(userId: number): Promise<RentalRequest[]> {
    return await db
      .select()
      .from(rentalRequests)
      .where(eq(rentalRequests.userId, userId));
  }
  
  async listRentalRequests(): Promise<RentalRequest[]> {
    return await db.select().from(rentalRequests);
  }
  
  // News methods
  async getNews(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(newsTable).where(eq(newsTable.id, id));
    return newsItem;
  }
  
  async createNews(insertNewsItem: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(newsTable).values(insertNewsItem).returning();
    return newsItem;
  }
  
  async updateNews(id: number, data: Partial<News>): Promise<News | undefined> {
    const [newsItem] = await db
      .update(newsTable)
      .set(data)
      .where(eq(newsTable.id, id))
      .returning();
    return newsItem;
  }
  
  async deleteNews(id: number): Promise<boolean> {
    const deleted = await db.delete(newsTable).where(eq(newsTable.id, id)).returning();
    return deleted.length > 0;
  }
  
  async listNews(limit?: number): Promise<News[]> {
    const newsItems = await db
      .select()
      .from(newsTable)
      .orderBy(desc(newsTable.publishDate))
      .limit(limit || 100);
    
    return newsItems;
  }
  
  // Chat message methods
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    return chatMessage;
  }
  
  async getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]> {
    const query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.sentAt));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async deleteChatMessage(id: number): Promise<boolean> {
    const deleted = await db.delete(chatMessages).where(eq(chatMessages.id, id)).returning();
    return deleted.length > 0;
  }
  
  // Referral methods
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user;
  }
  
  async updateUserReferralCode(userId: number, referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ referralCode })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateUserRole(userId: number, role: string, isAdmin: boolean): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ role, isAdmin })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error("Error updating user role:", error);
      return undefined;
    }
  }
  
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [createdReferral] = await db.insert(referrals).values(referral).returning();
    return createdReferral;
  }
  
  async getReferral(id: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    return referral;
  }
  
  async updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined> {
    const [referral] = await db
      .update(referrals)
      .set(data)
      .where(eq(referrals.id, id))
      .returning();
    return referral;
  }
  
  async getUserReferrals(userId: number): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
  }
  
  async getUserReferredUsers(userId: number): Promise<User[]> {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
    
    const referredUserIds = userReferrals.map((referral: { referredId: number }) => referral.referredId);
    
    if (referredUserIds.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(users)
      .where(inArray(users.id, referredUserIds));
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db.insert(notifications).values(notification).returning();
    return createdNotification;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const deleted = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return deleted.length > 0;
  }

  async getUserNotifications(userId: number, limit?: number): Promise<Notification[]> {
    const query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    return this.updateNotification(id, { isRead: true });
  }

  async markAllUserNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
      .returning();
    
    return result.length > 0;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();

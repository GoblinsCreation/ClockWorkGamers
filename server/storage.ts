import { 
  users, type User, type InsertUser,
  streamers, type Streamer, type InsertStreamer,
  courses, type Course, type InsertCourse,
  rentals, type Rental, type InsertRental,
  rentalRequests, type RentalRequest, type InsertRentalRequest,
  news as newsTable, type News, type InsertNews
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
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
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Streamer operations
  getStreamer(id: number): Promise<Streamer | undefined>;
  getStreamerByUserId(userId: number): Promise<Streamer | undefined>;
  createStreamer(streamer: InsertStreamer): Promise<Streamer>;
  updateStreamer(id: number, data: Partial<Streamer>): Promise<Streamer | undefined>;
  listStreamers(): Promise<Streamer[]>;
  getLiveStreamers(): Promise<Streamer[]>;
  
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
    return await db.select().from(streamers);
  }
  
  async getLiveStreamers(): Promise<Streamer[]> {
    return await db
      .select()
      .from(streamers)
      .where(eq(streamers.isLive, true));
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
}

export const storage = new DatabaseStorage();

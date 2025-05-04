import { 
  users, type User, type InsertUser,
  streamers, type Streamer, type InsertStreamer,
  courses, type Course, type InsertCourse,
  rentals, type Rental, type InsertRental,
  rentalRequests, type RentalRequest, type InsertRentalRequest,
  news, type News, type InsertNews
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private streamers: Map<number, Streamer>;
  private courses: Map<number, Course>;
  private rentals: Map<number, Rental>;
  private rentalRequests: Map<number, RentalRequest>;
  private newsItems: Map<number, News>;
  
  currentUserId: number;
  currentStreamerId: number;
  currentCourseId: number;
  currentRentalId: number;
  currentRentalRequestId: number;
  currentNewsId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.streamers = new Map();
    this.courses = new Map();
    this.rentals = new Map();
    this.rentalRequests = new Map();
    this.newsItems = new Map();
    
    this.currentUserId = 1;
    this.currentStreamerId = 1;
    this.currentCourseId = 1;
    this.currentRentalId = 1;
    this.currentRentalRequestId = 1;
    this.currentNewsId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with demo data
    this.seedDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Streamer methods
  async getStreamer(id: number): Promise<Streamer | undefined> {
    return this.streamers.get(id);
  }
  
  async getStreamerByUserId(userId: number): Promise<Streamer | undefined> {
    return Array.from(this.streamers.values()).find(
      (streamer) => streamer.userId === userId,
    );
  }
  
  async createStreamer(insertStreamer: InsertStreamer): Promise<Streamer> {
    const id = this.currentStreamerId++;
    const streamer: Streamer = { ...insertStreamer, id };
    this.streamers.set(id, streamer);
    return streamer;
  }
  
  async updateStreamer(id: number, data: Partial<Streamer>): Promise<Streamer | undefined> {
    const streamer = this.streamers.get(id);
    if (!streamer) return undefined;
    
    const updatedStreamer = { ...streamer, ...data };
    this.streamers.set(id, updatedStreamer);
    return updatedStreamer;
  }
  
  async listStreamers(): Promise<Streamer[]> {
    return Array.from(this.streamers.values());
  }
  
  async getLiveStreamers(): Promise<Streamer[]> {
    return Array.from(this.streamers.values()).filter(
      (streamer) => streamer.isLive,
    );
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...data };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }
  
  async listCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async listCoursesByGame(game: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.game.toLowerCase() === game.toLowerCase(),
    );
  }
  
  // Rental methods
  async getRental(id: number): Promise<Rental | undefined> {
    return this.rentals.get(id);
  }
  
  async createRental(insertRental: InsertRental): Promise<Rental> {
    const id = this.currentRentalId++;
    const rental: Rental = { ...insertRental, id };
    this.rentals.set(id, rental);
    return rental;
  }
  
  async updateRental(id: number, data: Partial<Rental>): Promise<Rental | undefined> {
    const rental = this.rentals.get(id);
    if (!rental) return undefined;
    
    const updatedRental = { ...rental, ...data };
    this.rentals.set(id, updatedRental);
    return updatedRental;
  }
  
  async deleteRental(id: number): Promise<boolean> {
    return this.rentals.delete(id);
  }
  
  async listRentals(): Promise<Rental[]> {
    return Array.from(this.rentals.values());
  }
  
  async listRentalsByGame(game: string): Promise<Rental[]> {
    return Array.from(this.rentals.values()).filter(
      (rental) => rental.game.toLowerCase() === game.toLowerCase(),
    );
  }
  
  // Rental request methods
  async getRentalRequest(id: number): Promise<RentalRequest | undefined> {
    return this.rentalRequests.get(id);
  }
  
  async createRentalRequest(insertRequest: InsertRentalRequest): Promise<RentalRequest> {
    const id = this.currentRentalRequestId++;
    const now = new Date();
    const request: RentalRequest = { ...insertRequest, id, createdAt: now };
    this.rentalRequests.set(id, request);
    return request;
  }
  
  async updateRentalRequest(id: number, data: Partial<RentalRequest>): Promise<RentalRequest | undefined> {
    const request = this.rentalRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...data };
    this.rentalRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async listRentalRequestsByUser(userId: number): Promise<RentalRequest[]> {
    return Array.from(this.rentalRequests.values()).filter(
      (request) => request.userId === userId,
    );
  }
  
  async listRentalRequests(): Promise<RentalRequest[]> {
    return Array.from(this.rentalRequests.values());
  }
  
  // News methods
  async getNews(id: number): Promise<News | undefined> {
    return this.newsItems.get(id);
  }
  
  async createNews(insertNews: InsertNews): Promise<News> {
    const id = this.currentNewsId++;
    const now = new Date();
    const newsItem: News = { ...insertNews, id, publishDate: now };
    this.newsItems.set(id, newsItem);
    return newsItem;
  }
  
  async updateNews(id: number, data: Partial<News>): Promise<News | undefined> {
    const newsItem = this.newsItems.get(id);
    if (!newsItem) return undefined;
    
    const updatedNews = { ...newsItem, ...data };
    this.newsItems.set(id, updatedNews);
    return updatedNews;
  }
  
  async deleteNews(id: number): Promise<boolean> {
    return this.newsItems.delete(id);
  }
  
  async listNews(limit?: number): Promise<News[]> {
    const allNews = Array.from(this.newsItems.values())
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
    
    return limit ? allNews.slice(0, limit) : allNews;
  }
  
  // Seed demo data
  private seedDemoData() {
    // Will be automatically populated as users are created
  }
}

export const storage = new MemStorage();

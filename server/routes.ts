import express, { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import * as crypto from "crypto";
import { createPaymentIntent, createSubscription, handleWebhook } from "./stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { 
  handleDbReport, 
  handleDbQuery, 
  handleUserActivityReport, 
  handleReferralReport, 
  handlePasswordReset,
  servePhpAdminPanel
} from "./php-integration";
import { scheduleStreamStatusUpdates, updateStreamStatus, linkTwitchAccount, getLiveStreamers } from "./twitch";
import { handleContactForm, sendTestEmail } from "./email";
import { WebSocketServer, WebSocket } from 'ws';
import { 
  createSystemNotification, 
  createAchievementUnlockedNotification,
  createAchievementClaimedNotification
} from "./notifications";
import { 
  checkOnboardingStatus, 
  completeOnboarding, 
  skipOnboarding, 
  getPersonalizedRecommendations 
} from "./onboarding";

// Extend session with our custom properties
declare module "express-session" {
  interface SessionData {
    twitchState?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes - all prefixed with /api

  // Onboarding routes
  app.get("/api/user/onboarding-status", async (req, res) => {
    try {
      await checkOnboardingStatus(req, res);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      res.status(500).json({ message: "Failed to check onboarding status" });
    }
  });

  app.post("/api/user/complete-onboarding", async (req, res) => {
    try {
      await completeOnboarding(req, res);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  app.post("/api/user/skip-onboarding", async (req, res) => {
    try {
      await skipOnboarding(req, res);
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      res.status(500).json({ message: "Failed to skip onboarding" });
    }
  });

  app.get("/api/user/personalized-recommendations", async (req, res) => {
    try {
      await getPersonalizedRecommendations(req, res);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      res.status(500).json({ message: "Failed to get personalized recommendations" });
    }
  });
  
  // Streamers routes
  app.get("/api/streamers", async (req, res) => {
    try {
      const streamers = await storage.listStreamers();
      res.json(streamers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streamers" });
    }
  });
  
  app.get("/api/streamers/live", async (req, res) => {
    try {
      // Get live streamers from twitch.ts using the getLiveStreamers function
      const liveStreamers = await getLiveStreamers();
      res.json(liveStreamers || []);
    } catch (error) {
      console.error("Error fetching live streamers:", error);
      res.status(500).json({ message: "Failed to fetch live streamers" });
    }
  });
  
  app.get("/api/streamers/:id", async (req, res) => {
    try {
      const streamerId = parseInt(req.params.id);
      const streamer = await storage.getStreamer(streamerId);
      
      if (!streamer) {
        return res.status(404).json({ message: "Streamer not found" });
      }
      
      res.json(streamer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streamer" });
    }
  });
  
  app.get("/api/streamer/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const streamer = await storage.getStreamerByUserId(userId);
      
      if (!streamer) {
        return res.status(404).json({ message: "Streamer profile not found" });
      }
      
      res.json(streamer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streamer profile" });
    }
  });
  
  // Streamer Schedule routes
  app.get("/api/streamers/:id/schedule", async (req, res) => {
    try {
      const streamerId = parseInt(req.params.id);
      const streamer = await storage.getStreamer(streamerId);
      
      if (!streamer) {
        return res.status(404).json({ message: "Streamer not found" });
      }
      
      const schedules = await storage.listStreamerSchedulesByStreamerId(streamerId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streamer schedule" });
    }
  });
  
  app.post("/api/streamers/:id/schedule", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const streamerId = parseInt(req.params.id);
      const streamer = await storage.getStreamer(streamerId);
      
      if (!streamer) {
        return res.status(404).json({ message: "Streamer not found" });
      }
      
      // Check if the authenticated user is the streamer or an admin
      if (streamer.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "You do not have permission to edit this schedule" });
      }
      
      const schedule = await storage.createStreamerSchedule({
        ...req.body,
        streamerId
      });
      
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to create streamer schedule" });
    }
  });
  
  app.patch("/api/streamers/schedule/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getStreamerSchedule(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      const streamer = await storage.getStreamer(schedule.streamerId);
      
      // Check if the authenticated user is the streamer or an admin
      if (!streamer || (streamer.userId !== req.user!.id && !req.user!.isAdmin)) {
        return res.status(403).json({ message: "You do not have permission to edit this schedule" });
      }
      
      const updatedSchedule = await storage.updateStreamerSchedule(scheduleId, req.body);
      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update streamer schedule" });
    }
  });
  
  app.delete("/api/streamers/schedule/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getStreamerSchedule(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      const streamer = await storage.getStreamer(schedule.streamerId);
      
      // Check if the authenticated user is the streamer or an admin
      if (!streamer || (streamer.userId !== req.user!.id && !req.user!.isAdmin)) {
        return res.status(403).json({ message: "You do not have permission to delete this schedule" });
      }
      
      await storage.deleteStreamerSchedule(scheduleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete streamer schedule" });
    }
  });
  
  // Courses routes
  app.get("/api/courses", async (req, res) => {
    try {
      const game = req.query.game as string;
      let courses;
      
      if (game) {
        courses = await storage.listCoursesByGame(game);
      } else {
        courses = await storage.listCourses();
      }
      
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });
  
  // Rentals routes
  app.get("/api/rentals", async (req, res) => {
    try {
      const game = req.query.game as string;
      let rentals;
      
      if (game) {
        rentals = await storage.listRentalsByGame(game);
      } else {
        rentals = await storage.listRentals();
      }
      
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  });
  
  app.get("/api/rentals/:id", async (req, res) => {
    try {
      const rentalId = parseInt(req.params.id);
      const rental = await storage.getRental(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      
      res.json(rental);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rental" });
    }
  });
  
  // Rental Requests routes (requires authentication)
  app.post("/api/rental-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const rentalRequest = await storage.createRentalRequest({
        ...req.body,
        userId,
      });
      
      res.status(201).json(rentalRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to create rental request" });
    }
  });
  
  app.get("/api/rental-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const requests = await storage.listRentalRequestsByUser(userId);
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rental requests" });
    }
  });
  
  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const newsItems = await storage.listNews(limit);
      
      res.json(newsItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });
  
  app.get("/api/news/:id", async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      const newsItem = await storage.getNews(newsId);
      
      if (!newsItem) {
        return res.status(404).json({ message: "News item not found" });
      }
      
      res.json(newsItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news item" });
    }
  });
  
  // User Profile routes
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        // If profile doesn't exist yet, return default values
        return res.json({
          userId,
          username: req.user!.username,
          email: req.user!.email || "",
          displayName: "",
          bio: "",
          avatar: "",
          discordUsername: "",
          twitterUsername: "",
          gameIds: [],
          preferences: {
            emailNotifications: true,
            showWalletAddress: false,
            darkMode: true
          }
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const profileData = {
        ...req.body,
        userId
      };
      
      const existingProfile = await storage.getUserProfile(userId);
      let updatedProfile;
      
      if (existingProfile) {
        // Update existing profile
        updatedProfile = await storage.updateUserProfile(userId, profileData);
      } else {
        // Create new profile
        updatedProfile = await storage.createUserProfile(profileData);
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Payment routes
  
  // User payment history route
  app.get("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });
  
  // Course purchase routes
  app.get("/api/user/courses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const courses = await storage.getUserActiveCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Failed to fetch purchased courses" });
    }
  });
  
  app.post("/api/courses/purchase", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user already has an active purchase for this course
      const hasActivePurchase = await storage.hasUserPurchasedCourse(userId, courseId);
      if (hasActivePurchase) {
        return res.status(409).json({ message: "You already own this course" });
      }
      
      // Create payment intent
      // We'll pass all the required metadata for Stripe to process this as a course purchase
      req.body.amount = course.price;
      req.body.currency = 'usd';
      req.body.description = `Purchase of course: ${course.title}`;
      req.body.metadata = {
        type: 'course',
        courseId: courseId.toString(),
        title: course.title
      };
      
      // Forward to createPaymentIntent function
      await createPaymentIntent(req, res);
    } catch (error) {
      console.error("Error processing course purchase:", error);
      res.status(500).json({ message: "Failed to initiate course purchase" });
    }
  });
  
  // Rental purchase routes
  app.get("/api/user/rentals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const rentals = await storage.getUserActiveRentals(userId);
      res.json(rentals);
    } catch (error) {
      console.error("Error fetching user rentals:", error);
      res.status(500).json({ message: "Failed to fetch active rentals" });
    }
  });
  
  app.post("/api/rentals/purchase", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const { rentalId, durationDays = 7 } = req.body;
      
      if (!rentalId) {
        return res.status(400).json({ message: "Rental ID is required" });
      }
      
      // Check if rental exists
      const rental = await storage.getRental(rentalId);
      if (!rental) {
        return res.status(404).json({ message: "Rental item not found" });
      }
      
      // Calculate the price based on rental price and duration
      const price = rental.pricePerDay * durationDays;
      
      // Create payment intent
      req.body.amount = price;
      req.body.currency = 'usd';
      req.body.description = `Rental of ${rental.title} for ${durationDays} days`;
      req.body.metadata = {
        type: 'rental',
        rentalId: rentalId.toString(),
        title: rental.title,
        durationDays: durationDays.toString()
      };
      
      // Forward to createPaymentIntent function
      await createPaymentIntent(req, res);
    } catch (error) {
      console.error("Error processing rental purchase:", error);
      res.status(500).json({ message: "Failed to initiate rental purchase" });
    }
  });
  
  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      await createPaymentIntent(req, res);
    } catch (error) {
      console.error("Error in create-payment-intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await createSubscription(req, res);
    } catch (error) {
      console.error("Error in create-subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });
  
  // Special route for Stripe webhooks - needs raw body, not JSON parsed
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      await handleWebhook(req, res);
    } catch (error) {
      console.error("Error in Stripe webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
  
  // PayPal payment routes
  app.get("/api/paypal/setup", async (req, res) => {
    try {
      await loadPaypalDefault(req, res);
    } catch (error) {
      console.error("Error in PayPal setup:", error);
      res.status(500).json({ error: "Failed to set up PayPal" });
    }
  });
  
  app.post("/api/paypal/order", async (req, res) => {
    try {
      await createPaypalOrder(req, res);
    } catch (error) {
      console.error("Error in create PayPal order:", error);
      res.status(500).json({ error: "Failed to create PayPal order" });
    }
  });
  
  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    try {
      await capturePaypalOrder(req, res);
    } catch (error) {
      console.error("Error in capture PayPal order:", error);
      res.status(500).json({ error: "Failed to capture PayPal order" });
    }
  });
  
  // Twitch Integration Routes
  
  // Route to check authentication status
  app.get("/api/check-auth", (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated()
    });
  });
  
  // Contact form route
  app.post("/api/contact", async (req, res) => {
    try {
      await handleContactForm(req, res);
    } catch (error) {
      console.error("Error handling contact form:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process your message. Please try again later."
      });
    }
  });
  
  // Admin-only route to test email functionality
  app.post("/api/admin/test-email", async (req, res) => {
    try {
      await sendTestEmail(req, res);
    } catch (error) {
      console.error("Error testing email:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send test email. Check server logs for details."
      });
    }
  });
  
  // Onboarding routes
  app.get("/api/user/onboarding-status", async (req, res) => {
    try {
      await checkOnboardingStatus(req, res);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      res.status(500).json({ message: "Failed to check onboarding status" });
    }
  });

  app.post("/api/user/complete-onboarding", async (req, res) => {
    try {
      await completeOnboarding(req, res);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  app.post("/api/user/skip-onboarding", async (req, res) => {
    try {
      await skipOnboarding(req, res);
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      res.status(500).json({ message: "Failed to skip onboarding" });
    }
  });

  app.get("/api/user/personalized-recommendations", async (req, res) => {
    try {
      await getPersonalizedRecommendations(req, res);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      res.status(500).json({ message: "Failed to get personalized recommendations" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const notifications = await storage.getUserNotifications(req.user.id, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const count = await storage.getUnreadNotificationCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });
  
  app.post("/api/notifications/:id/mark-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.getNotification(id);
      
      // Ensure the notification exists and belongs to the user
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this notification" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      await storage.markAllUserNotificationsAsRead(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.getNotification(id);
      
      // Ensure the notification exists and belongs to the user
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this notification" });
      }
      
      const success = await storage.deleteNotification(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete notification" });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  
  // Twitch integration routes
  app.get("/api/twitch/auth-url", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Generate a unique state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in session
    req.session.twitchState = state;
    
    // Create Twitch OAuth URL
    const scopes = 'user:read:email channel:read:subscriptions';
    const redirectUri = `${req.protocol}://${req.get('host')}/api/twitch/callback`;
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;
    
    res.json({ url: authUrl });
  });
  
  app.get("/api/twitch/callback", (req, res) => {
    const { code, state } = req.query;
    
    // Send the auth code and state to the client via postMessage
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connecting to Twitch...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #0e0e10;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .twitch-logo {
            width: 120px;
            margin-bottom: 20px;
          }
          .connecting {
            font-size: 18px;
            margin-top: 20px;
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top: 4px solid #9146FF;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 20px 0;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <img class="twitch-logo" src="https://brand.twitch.tv/assets/images/white-twitch-logo.png" alt="Twitch Logo">
        <div class="connecting">Connecting to your Twitch account...</div>
        <div class="spinner"></div>
        <script>
          // Send the code and state to the parent window
          window.opener.postMessage({
            type: 'TWITCH_AUTH',
            code: ${JSON.stringify(code)},
            state: ${JSON.stringify(state)}
          }, '*');
          
          // Close the window after a short delay
          setTimeout(() => window.close(), 2000);
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  });
  
  app.post("/api/twitch/link-account", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { code, state } = req.body;
      
      // Verify state to prevent CSRF attacks
      if (state !== req.session.twitchState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      // Clear the state from session
      delete req.session.twitchState;
      
      // Get the redirect URI (same as the one used in auth-url)
      const redirectUri = `${req.protocol}://${req.get('host')}/api/twitch/callback`;
      
      // Link the Twitch account to the user
      const success = await linkTwitchAccount(code, redirectUri, req.user!.id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to link Twitch account" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error linking Twitch account:", error);
      res.status(500).json({ message: "Failed to link Twitch account" });
    }
  });
  
  app.post("/api/twitch/unlink-account", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Get the user's streamer profile
      const streamer = await storage.getStreamerByUserId(userId);
      
      if (!streamer) {
        return res.status(404).json({ message: "No linked Twitch account found" });
      }
      
      // Update the streamer record to remove Twitch ID
      await storage.updateStreamer(streamer.id, {
        twitchId: undefined
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error unlinking Twitch account:", error);
      res.status(500).json({ message: "Failed to unlink Twitch account" });
    }
  });
  
  // Route to manually update streamer status from Twitch
  app.get("/api/streamers/update-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is admin or has sufficient permissions
    if (!req.user!.isAdmin && 
        req.user!.role !== "Mod" && 
        req.user!.role !== "Admin" && 
        req.user!.role !== "Owner") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      await updateStreamStatus();
      res.json({ success: true, message: "Streamer status updated successfully" });
    } catch (error) {
      console.error("Error updating streamer status:", error);
      res.status(500).json({ message: "Failed to update streamer status" });
    }
  });
  
  // Route to get all currently live streamers
  app.get("/api/streamers/live", async (req, res) => {
    try {
      const liveStreamers = await getLiveStreamers();
      res.json(liveStreamers);
    } catch (error) {
      console.error("Error fetching live streamers:", error);
      res.status(500).json({ message: "Failed to fetch live streamers" });
    }
  });

  // Admin routes (requires admin authentication)
  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check for any admin role (isAdmin flag or role-based permission)
    if (!req.user!.isAdmin && 
        req.user!.role !== "Mod" && 
        req.user!.role !== "Admin" && 
        req.user!.role !== "Owner") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  });
  
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Endpoint to update a user's role
  app.patch("/api/admin/users/:id/role", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      // Validate roles
      if (!["User", "Mod", "Admin", "Owner"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Only Owner can set Owner role and only Owner can modify other Owner accounts
      const userToModify = await storage.getUser(userId);
      
      if (!userToModify) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If target user is Owner, only allow Owner to modify
      if (userToModify.role === "Owner" && req.user!.role !== "Owner") {
        return res.status(403).json({ message: "Only Owners can modify Owner accounts" });
      }
      
      // If setting to Owner, only Owner can do that
      if (role === "Owner" && req.user!.role !== "Owner") {
        return res.status(403).json({ message: "Only Owners can set the Owner role" });
      }
      
      // Admins can only set Mod or User roles
      if (req.user!.role === "Admin" && role === "Admin") {
        return res.status(403).json({ message: "Admins cannot create other Admins" });
      }
      
      // Mods can only set User role
      if (req.user!.role === "Mod" && role !== "User") {
        return res.status(403).json({ message: "Moderators can only assign User role" });
      }
      
      // Update user's role and admin flag for backward compatibility
      const isAdmin = role === "Admin" || role === "Owner";
      const updatedUser = await storage.updateUserRole(userId, role, isAdmin);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user role" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  app.get("/api/admin/rental-requests", async (req, res) => {
    try {
      const requests = await storage.listRentalRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rental requests" });
    }
  });
  
  // Admin analytics endpoint
  app.get("/api/admin/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only admins can access this endpoint
    if (!req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const timeframe = req.query.timeframe as string || 'week';
      
      // Generate user growth analytics
      const userDates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const userGrowth = userDates.map((day, index) => {
        // Create some semi-random growth data that generally trends upward
        const baseValue = 80 + index * 5; // Base user count starts at 80 and increases by 5 each day
        const randomVariation = Math.floor(Math.random() * 20) - 10; // Random variation between -10 and +10
        const uniqueVisitors = baseValue + randomVariation;
        const signups = Math.floor(uniqueVisitors * (0.1 + Math.random() * 0.1)); // 10-20% conversion rate
        
        return {
          name: day,
          'Unique Visitors': uniqueVisitors,
          'New Signups': signups,
        };
      });
      
      // Generate stream viewership analytics
      const streamDates = ['10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
      const streamViewership = streamDates.map((time, index) => {
        // Create viewership pattern with peak during evening hours
        let baseViewers = 50;
        if (index > 2) baseViewers = 100; // Higher base during afternoon
        if (index > 4) baseViewers = 150; // Even higher base during evening
        
        const randomVariation = Math.floor(Math.random() * 40) - 20;
        const viewers = baseViewers + randomVariation;
        
        return {
          name: time,
          'Viewers': viewers,
        };
      });
      
      // Generate rental revenue analytics 
      const rentalDates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const rentalRevenue = rentalDates.map((day, index) => {
        const baseRevenue = 1000 + index * 200; // Base revenue starts at 1000 and increases by 200 each day
        const randomVariation = Math.floor(Math.random() * 400) - 200; // Random variation between -200 and +200
        
        return {
          name: day,
          'Revenue': baseRevenue + randomVariation,
        };
      });
      
      // Generate token distribution analytics
      const tokenDistribution = [
        { name: 'Tokens Earned', value: 10200 },
        { name: 'Tokens Spent', value: 7800 },
        { name: 'Tokens Locked', value: 4500 },
        { name: 'Referral Bonus', value: 2100 },
      ];
      
      // Generate game distribution analytics
      const gameDistribution = [
        { name: 'Boss Fighters', value: 35 },
        { name: 'KoKodi', value: 22 },
        { name: 'Nyan Heroes', value: 18 },
        { name: 'Big Time', value: 12 },
        { name: 'WorldShards', value: 8 },
        { name: 'Off The Grid', value: 3 },
        { name: 'RavenQuest', value: 2 },
      ];
      
      // Generate stream activity by day
      const streamActivity = [
        { name: 'Monday', value: 4 },
        { name: 'Tuesday', value: 6 },
        { name: 'Wednesday', value: 8 },
        { name: 'Thursday', value: 10 },
        { name: 'Friday', value: 12 },
        { name: 'Saturday', value: 14 },
        { name: 'Sunday', value: 10 },
      ];
      
      // Generate top streamers performance
      const streamersPerformance = [
        { name: 'FrostiiGoblin', viewers: 248, hours: 28, followers: 1200 },
        { name: 'NeonDragon', viewers: 186, hours: 32, followers: 980 },
        { name: 'CryptoQueen', viewers: 173, hours: 24, followers: 850 },
        { name: 'BlockchainBro', viewers: 145, hours: 20, followers: 720 },
        { name: 'NFTHunter', viewers: 129, hours: 22, followers: 635 },
      ];
      
      // Generate user engagement data
      const userEngagement = [
        { name: 'Mon', Mobile: 120, Desktop: 200, Web3: 80 },
        { name: 'Tue', Mobile: 132, Desktop: 180, Web3: 70 },
        { name: 'Wed', Mobile: 101, Desktop: 198, Web3: 90 },
        { name: 'Thu', Mobile: 134, Desktop: 210, Web3: 120 },
        { name: 'Fri', Mobile: 190, Desktop: 220, Web3: 140 },
        { name: 'Sat', Mobile: 230, Desktop: 170, Web3: 160 },
        { name: 'Sun', Mobile: 210, Desktop: 180, Web3: 130 },
      ];
      
      // Generate token economy data
      const tokenEconomy = [
        { name: 'Week 1', Minted: 5000, Burned: 1200, Staked: 3000 },
        { name: 'Week 2', Minted: 4500, Burned: 1500, Staked: 3200 },
        { name: 'Week 3', Minted: 5200, Burned: 1700, Staked: 3500 },
        { name: 'Week 4', Minted: 6000, Burned: 2000, Staked: 4000 },
      ];
      
      // Generate NFT activity data
      const nftActivity = [
        { name: 'Mon', Minted: 24, Traded: 18, Listed: 42 },
        { name: 'Tue', Minted: 18, Traded: 22, Listed: 38 },
        { name: 'Wed', Minted: 32, Traded: 28, Listed: 52 },
        { name: 'Thu', Minted: 26, Traded: 32, Listed: 44 },
        { name: 'Fri', Minted: 35, Traded: 42, Listed: 66 },
        { name: 'Sat', Minted: 42, Traded: 36, Listed: 58 },
        { name: 'Sun', Minted: 38, Traded: 30, Listed: 50 },
      ];
      
      // Generate daily active users data
      const dailyActiveUsers = [
        { name: 'Mon', Users: 320 },
        { name: 'Tue', Users: 302 },
        { name: 'Wed', Users: 341 },
        { name: 'Thu', Users: 374 },
        { name: 'Fri', Users: 390 },
        { name: 'Sat', Users: 430 },
        { name: 'Sun', Users: 380 },
      ];
      
      // Generate onboarding completion data
      const onboardingCompletion = [
        { name: 'Started', value: 100 },
        { name: 'Profile Setup', value: 85 },
        { name: 'Preferences', value: 68 },
        { name: 'Wallet Connected', value: 42 },
        { name: 'First Token', value: 38 },
      ];
      
      const analyticsData = {
        userGrowth,
        streamViewership,
        rentalRevenue,
        tokenDistribution,
        gameDistribution,
        streamActivity,
        streamersPerformance,
        userEngagement,
        tokenEconomy,
        nftActivity,
        dailyActiveUsers,
        onboardingCompletion,
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error generating analytics data:", error);
      res.status(500).json({ message: "Failed to generate analytics data" });
    }
  });
  
  app.patch("/api/admin/rental-requests/:id", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getRentalRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Rental request not found" });
      }
      
      const updatedRequest = await storage.updateRentalRequest(requestId, req.body);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rental request" });
    }
  });

  // Chat API routes
  app.get("/api/chat/:roomId", async (req, res) => {
    // No authentication required for viewing public chat messages
    try {
      const roomId = req.params.roomId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      // Only allow non-authenticated users to access public and support rooms
      if (!req.isAuthenticated() && !['public', 'support'].includes(roomId)) {
        return res.status(401).json({ message: "Authentication required for private rooms" });
      }
      
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  
  app.post("/api/chat/:roomId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const roomId = req.params.roomId;
      const { message } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const chatMessage = await storage.createChatMessage({
        userId,
        roomId,
        message: message.trim()
      });
      
      res.status(201).json(chatMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });
  
  // Referral API routes
  app.post("/api/referrals/generate-code", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Generate referral code based on username and random string
      const username = req.user!.username;
      const baseCode = username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
      const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
      const referralCode = `${baseCode}-${randomPart}`;
      
      // Update user with the new referral code
      const user = await storage.updateUserReferralCode(userId, referralCode);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ referralCode });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });
  
  app.post("/api/referrals/use-code", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return res.status(400).json({ message: "Referral code is required" });
      }
      
      // Find the user who owns this referral code
      const referrer = await storage.getUserByReferralCode(referralCode);
      
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      // Check if user is trying to use their own code
      if (referrer.id === userId) {
        return res.status(400).json({ message: "You cannot use your own referral code" });
      }
      
      // Create the referral relationship
      const referral = await storage.createReferral({
        referrerId: referrer.id,
        referredId: userId,
        status: "active",
        rewardClaimed: false
      });
      
      res.status(201).json(referral);
    } catch (error) {
      console.error("Error using referral code:", error);
      res.status(500).json({ message: "Failed to use referral code" });
    }
  });
  
  app.get("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const referrals = await storage.getUserReferrals(userId);
      
      // Enhance referrals with username information
      const enhancedReferrals = await Promise.all(referrals.map(async (referral) => {
        const referredUser = await storage.getUser(referral.referredId);
        return {
          ...referral,
          referredUsername: referredUser?.username || 'Unknown User'
        };
      }));
      
      res.json(enhancedReferrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });
  
  app.get("/api/referrals/users", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const referredUsers = await storage.getUserReferredUsers(userId);
      res.json(referredUsers);
    } catch (error) {
      console.error("Error fetching referred users:", error);
      res.status(500).json({ message: "Failed to fetch referred users" });
    }
  });

  // Leaderboard API routes
  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Extract query parameters with defaults
      const timeframe = (req.query.timeframe as string) || 'weekly';
      const category = (req.query.category as string) || 'points';
      
      // For now, return demo data
      // In a real implementation, this would query the database based on the parameters
      const users = await storage.listUsers();
      
      // Create a simulated leaderboard based on real users
      const leaderboard = users.map((user, index) => {
        // Create some simulated stats based on the user
        const rank = index + 1;
        const previousRank = Math.min(users.length, Math.max(1, 
          rank + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 
                 Math.random() > 0.3 ? 0 : -Math.floor(Math.random() * 3) - 1)));
        
        // Points calculation simulation based on user ID and timeframe
        let points = 1000 + (user.id * 100) - (index * 200);
        if (timeframe === 'monthly') points *= 2.5;
        if (timeframe === 'alltime') points *= 5;
        
        // Calculate user level based on points
        const level = Math.max(1, Math.floor(Math.sqrt(points / 100)));
        
        // Calculate achievements based on level
        const achievements = Math.floor(level * 0.7);
        
        // Determine activity level
        let activity: 'high' | 'medium' | 'low' = 'medium';
        if (rank <= 3) activity = 'high';
        if (rank > users.length - 3) activity = 'low';
        
        // Generate some simulated badges
        const badges = [];
        if (level >= 5) badges.push('Bronze');
        if (level >= 15) badges.push('Silver');
        if (level >= 30) badges.push('Gold');
        if (level >= 40) badges.push('Diamond');
        if (user.isAdmin) badges.push('Verified');
        if (user.id === 1) badges.push('Founder');
        
        return {
          id: user.id,
          username: user.username,
          displayName: user.username,
          avatar: null, // In a real app, this would come from user profiles
          rank,
          previousRank,
          points: Math.floor(points),
          level,
          achievements,
          activity,
          role: user.isAdmin ? 'Admin' : 'Member',
          badges,
          joinDate: new Date().toISOString().split('T')[0], // Simulated join date
        };
      });
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });

  // Create HTTP server
  // PHP Integration Routes
  app.get("/api/php/db-report", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await handleDbReport(req, res);
  });
  
  app.post("/api/php/db-query", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await handleDbQuery(req, res);
  });
  
  app.get("/api/php/user-activity", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await handleUserActivityReport(req, res);
  });
  
  app.get("/api/php/referral-report", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await handleReferralReport(req, res);
  });
  
  app.post("/api/php/reset-password", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await handlePasswordReset(req, res);
  });
  
  // Serve PHP Admin Panel
  app.get("/php-admin", (req, res) => {
    // Simple check for authentication
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    servePhpAdminPanel(req, res);
  });

  // Twitch API routes
  app.get("/api/streamers/update-status", async (req, res) => {
    try {
      // Only allow admin users to manually trigger update
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await updateStreamStatus();
      res.json({ message: "Stream status update triggered successfully" });
    } catch (error) {
      console.error("Error updating stream status:", error);
      res.status(500).json({ message: "Failed to update stream status" });
    }
  });
  
  app.post("/api/streamers/link-twitch", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { code, redirectUri } = req.body;
      
      if (!code || !redirectUri) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const success = await linkTwitchAccount(code, redirectUri, req.user!.id);
      
      if (success) {
        res.json({ message: "Twitch account linked successfully" });
      } else {
        res.status(500).json({ message: "Failed to link Twitch account" });
      }
    } catch (error) {
      console.error("Error linking Twitch account:", error);
      res.status(500).json({ message: "Failed to link Twitch account" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Allow connections from any origin
    verifyClient: (info: { origin: string }) => {
      console.log('WebSocket connection attempt from:', info.origin);
      return true; // Accept all connections for now
    }
  });
  
  // Store connected clients with their user info
  const clients = new Map();
  
  // Start scheduled Twitch stream status updates (every 5 minutes)
  scheduleStreamStatusUpdates(5);
  
  wss.on('connection', (ws, req) => {
    console.log('Client connected to chat WebSocket');
    
    // Generate a unique client ID
    const clientId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    clients.set(clientId, { ws, user: null });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'system',
      message: 'Welcome to ClockWork Gamers Chat',
      timestamp: new Date().toISOString()
    }));
    
    // Handle messages from clients
    ws.on('message', async (messageBuffer) => {
      try {
        const messageData = messageBuffer.toString();
        const data = JSON.parse(messageData);
        
        // Authentication message - client sends token/session ID
        if (data.type === 'auth') {
          if (data.userId && data.username) {
            // Set user info for this connection
            clients.set(clientId, { 
              ws, 
              user: { 
                id: data.userId, 
                username: data.username 
              },
              rooms: ['public', 'support'] // Default rooms all users join
            });
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: 'auth_success',
              userId: data.userId,
              timestamp: new Date().toISOString()
            }));
            
            // Broadcast user joined message
            broadcastMessage({
              type: 'user_joined',
              username: data.username,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // Chat message
        else if (data.type === 'chat') {
          const client = clients.get(clientId);
          
          // Must be authenticated to send messages
          if (!client.user) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'You must be authenticated to send messages',
              timestamp: new Date().toISOString()
            }));
            return;
          }
          
          // Validate message
          if (!data.message || typeof data.message !== 'string' || data.message.trim() === '') {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Message cannot be empty',
              timestamp: new Date().toISOString()
            }));
            return;
          }
          
          // Get room ID or default to "public"
          const roomId = data.roomId || 'public';
          
          // Store message in database
          try {
            const storedMessage = await storage.createChatMessage({
              userId: client.user.id,
              roomId,
              message: data.message
            });
            
            // Broadcast the message to all clients in the same room
            broadcastMessage({
              id: storedMessage.id,
              type: 'chat',
              roomId,
              message: data.message,
              userId: client.user.id,
              username: client.user.username,
              timestamp: storedMessage.sentAt
            });
          } catch (error) {
            console.error('Error storing chat message:', error);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to send message',
              timestamp: new Date().toISOString()
            }));
          }
        }
        
        // Translate message request
        else if (data.type === 'translate') {
          // In a real implementation, we would call a translation API here
          // For now, we'll simulate a translation with a simple prefix
          
          if (!data.messageId || !data.targetLanguage) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Missing message ID or target language',
              timestamp: new Date().toISOString()
            }));
            return;
          }
          
          // Simulate translation
          const translatedText = `[Translated to ${data.targetLanguage}] ${data.originalText}`;
          
          ws.send(JSON.stringify({
            type: 'translation',
            messageId: data.messageId,
            originalText: data.originalText,
            translatedText,
            targetLanguage: data.targetLanguage,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      const client = clients.get(clientId);
      if (client && client.user) {
        // Broadcast user left message
        broadcastMessage({
          type: 'user_left',
          username: client.user.username,
          timestamp: new Date().toISOString()
        });
      }
      clients.delete(clientId);
      console.log('Client disconnected from chat WebSocket');
    });
  });
  
  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const notifications = await storage.getUserNotifications(userId, limit);
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  app.get("/api/notifications/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 0 }); // Return 0 if not authenticated
    }
    
    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationCount(userId);
      
      res.json(count);
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });
  
  app.post("/api/notifications/:id/mark-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Check if this notification belongs to the user
      if (notification.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to modify this notification" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.post("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      await storage.markAllUserNotificationsAsRead(userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Check if this notification belongs to the user
      if (notification.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this notification" });
      }
      
      await storage.deleteNotification(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  
  // Admin route to send a system notification to all users
  app.post("/api/admin/notifications/system", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only admins, mods, and owners can send system notifications
    if (!req.user!.isAdmin && req.user!.role !== "Mod" && req.user!.role !== "Admin" && req.user!.role !== "Owner") {
      return res.status(403).json({ message: "Admin privileges required" });
    }
    
    try {
      const { message, title, specificUserId, sendEmail } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const success = await createSystemNotification(
        message,
        title || "System Notification",
        specificUserId ? parseInt(specificUserId) : undefined,
        sendEmail === true
      );
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to create system notification" });
      }
    } catch (error) {
      console.error("Error creating system notification:", error);
      res.status(500).json({ message: "Failed to create system notification" });
    }
  });

  // Helper function to broadcast message to clients in the appropriate room
  function broadcastMessage(message: any) {
    const messageStr = JSON.stringify(message);
    const roomId = message.roomId || 'public';
    
    clients.forEach((client) => {
      // Only send if the connection is open and the client is in the room
      // For private messages, only send to the sender and recipient
      const isInRoom = client.rooms && client.rooms.includes(roomId);
      const isPrivateRecipient = roomId.startsWith('private-') && 
                               client.user && 
                               roomId === `private-${client.user.id}`;
      const isPrivateSender = message.userId === client.user?.id;
      
      if (client.ws.readyState === WebSocket.OPEN && 
          (roomId === 'public' || // Public messages go to everyone
           roomId === 'support' || // Support messages go to anyone in support room
           isInRoom || 
           isPrivateRecipient || 
           isPrivateSender)) {
        client.ws.send(messageStr);
      }
    });
  }

  // Guild Achievement API routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.listGuildAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/achievements/:id", async (req, res) => {
    try {
      const achievementId = parseInt(req.params.id);
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      const achievement = await storage.getGuildAchievement(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      res.json(achievement);
    } catch (error) {
      console.error("Error fetching achievement:", error);
      res.status(500).json({ message: "Failed to fetch achievement" });
    }
  });

  // Admin-only routes for managing achievements
  app.post("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const newAchievement = await storage.createGuildAchievement(req.body);
      res.status(201).json(newAchievement);
    } catch (error) {
      console.error("Error creating achievement:", error);
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.put("/api/achievements/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const achievementId = parseInt(req.params.id);
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      const updatedAchievement = await storage.updateGuildAchievement(achievementId, req.body);
      if (!updatedAchievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      res.json(updatedAchievement);
    } catch (error) {
      console.error("Error updating achievement:", error);
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  app.delete("/api/achievements/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const achievementId = parseInt(req.params.id);
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      const success = await storage.deleteGuildAchievement(achievementId);
      if (!success) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      res.status(500).json({ message: "Failed to delete achievement" });
    }
  });

  // User Achievement Progress API routes
  app.get("/api/user/achievements", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const achievements = await storage.listUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.get("/api/user/achievements/completed", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const achievements = await storage.getRecentlyCompletedAchievements(userId, limit);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching completed achievements:", error);
      res.status(500).json({ message: "Failed to fetch completed achievements" });
    }
  });

  app.post("/api/user/achievements/:id/claim", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const achievementId = parseInt(req.params.id);
      
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      const success = await storage.claimAchievementReward(userId, achievementId);
      
      if (!success) {
        return res.status(400).json({ 
          message: "Cannot claim reward. Achievement may not be completed or reward already claimed." 
        });
      }
      
      // Create a notification for the user about the claimed reward
      const achievement = await storage.getGuildAchievement(achievementId);
      if (achievement) {
        await createAchievementClaimedNotification(
          userId,
          achievementId,
          achievement.name,
          achievement.rewardType, 
          achievement.rewardValue
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error claiming achievement reward:", error);
      res.status(500).json({ message: "Failed to claim achievement reward" });
    }
  });

  // For testing: Increment progress for a specific achievement
  app.post("/api/user/achievements/:id/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const achievementId = parseInt(req.params.id);
      const { increment } = req.body;
      
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      if (typeof increment !== 'number' || increment <= 0) {
        return res.status(400).json({ message: "Invalid increment value" });
      }
      
      const progress = await storage.incrementUserAchievementProgress(userId, achievementId, increment);
      
      if (!progress) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      // If the achievement was just completed, create a notification
      if (progress.isCompleted && progress.completedAt && 
          new Date(progress.completedAt).getTime() > Date.now() - 5000) {
        // Get the achievement details
        const achievement = await storage.getGuildAchievement(achievementId);
        
        if (achievement) {
          await createAchievementUnlockedNotification(
            userId,
            achievementId,
            achievement.name,
            achievement.rewardType,
            achievement.rewardValue
          );
        }
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating achievement progress:", error);
      res.status(500).json({ message: "Failed to update achievement progress" });
    }
  });

  return httpServer;
}

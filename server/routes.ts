import express, { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
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
import { scheduleStreamStatusUpdates, updateStreamStatus, linkTwitchAccount } from "./twitch";
import { handleContactForm, sendTestEmail } from "./email";

import { WebSocketServer, WebSocket } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes - all prefixed with /api
  
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
      // Wrap in try-catch to handle any errors in getLiveStreamers
      try {
        const liveStreamers = await storage.getLiveStreamers();
        res.json(liveStreamers || []);
      } catch (storageError) {
        console.error("Error fetching live streamers:", storageError);
        // Return empty array as fallback
        res.json([]);
      }
    } catch (error) {
      console.error("Error in /api/streamers/live route:", error);
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
      res.json(referrals);
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

  return httpServer;
}

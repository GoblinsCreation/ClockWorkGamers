import express, { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { createPaymentIntent, createSubscription, handleWebhook } from "./stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

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
  
  // Admin routes (requires admin authentication)
  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

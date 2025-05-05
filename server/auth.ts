import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Use the SESSION_SECRET environment variable, or a default if not provided
  const sessionSecret = process.env.SESSION_SECRET || "clockwork-gamers-session-secret";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration validation schema extends the base schema with validation
  const registrationSchema = insertUserSchema.extend({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters long"),
    guild: z.string(),
    dateOfBirth: z.string(),
    referralCode: z.string().optional(),
    discordUsername: z.string().optional(),
    twitchHandle: z.string().optional(),
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = registrationSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create the user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });
      
      // Handle referral code if provided
      if (validatedData.referralCode) {
        try {
          // Find the referrer user
          const referrer = await storage.getUserByReferralCode(validatedData.referralCode);
          
          if (referrer && referrer.id !== user.id) {
            // Create the referral relationship
            await storage.createReferral({
              referrerId: referrer.id,
              referredId: user.id,
              status: "active",
              rewardClaimed: false
            });
            
            // Create notification for the referrer
            if (typeof storage.createNotification === 'function') {
              // Create object and stringify for jsonb field
              const metadataObj = { referredId: user.id };
              await storage.createNotification({
                userId: referrer.id,
                type: "REFERRAL",
                title: "New Referral",
                message: `${user.username} joined using your referral code!`,
                isRead: false,
                metadata: metadataObj
              });
            }
          }
        } catch (referralError) {
          console.error("Error processing referral:", referralError);
          // Don't fail registration if referral processing fails
        }
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      req.login(user, (err: any) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  app.get('/api/check-auth', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
  });
}

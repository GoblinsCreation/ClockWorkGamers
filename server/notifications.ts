/**
 * Notification Service for ClockWork Gamers
 * Provides standardized methods for creating different types of notifications
 */
import { storage } from "./storage";
import { InsertNotification } from "@shared/schema";
import nodemailer from "nodemailer";

// Create email transporter - initially set up with Ethereal for development
// In production, this should be configured with a real email service
let transporter: nodemailer.Transporter | null = null;

// Initialize nodemailer transporter
async function initializeTransporter() {
  // If we already have a transporter, return
  if (transporter) return;

  // Check for environment variables for email configuration
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use provided email credentials
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log("[email] Configured email transport with provided credentials");
  } else {
    try {
      // Create test account for development if no credentials provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log("[email] Using Ethereal test account for email. Check logs for preview URLs.");
    } catch (error) {
      console.error("[email] Failed to create test email account:", error);
    }
  }
}

// Notification types
export const NotificationType = {
  RENTAL_REQUEST_APPROVED: "rental_request_approved",
  RENTAL_REQUEST_REJECTED: "rental_request_rejected",
  COURSE_ENROLLMENT: "course_enrollment",
  STREAMER_LIVE: "streamer_live",
  NEW_MESSAGE: "new_message",
  SYSTEM: "system",
  REFERRAL: "referral",
} as const;

/**
 * Creates a notification and optionally sends an email if email transport is configured
 */
export async function createNotification(
  notification: InsertNotification,
  sendEmail = false,
  emailSubject?: string,
  emailHtml?: string
): Promise<boolean> {
  try {
    // Create notification in database
    await storage.createNotification(notification);
    
    // Send email if requested and user has an email
    if (sendEmail && notification.userId) {
      const user = await storage.getUser(notification.userId);
      
      if (user?.email) {
        // Initialize transporter if not already done
        if (!transporter) {
          await initializeTransporter();
        }
        
        if (transporter) {
          // Send the email
          const info = await transporter.sendMail({
            from: '"ClockWork Gamers" <notifications@clockworkgamers.net>',
            to: user.email,
            subject: emailSubject || notification.title,
            text: notification.message,
            html: emailHtml || `<p>${notification.message}</p>`,
          });
          
          // Log Ethereal URL for development testing
          if (info.messageId && !process.env.EMAIL_HOST) {
            console.log("[email] Email sent:", info.messageId);
            console.log("[email] Preview URL:", nodemailer.getTestMessageUrl(info));
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Creates a notification about a rental request status change
 */
export async function createRentalRequestNotification(
  userId: number,
  rentalId: number,
  approved: boolean,
  message: string,
  sendEmail = true
): Promise<boolean> {
  const notificationType = approved
    ? NotificationType.RENTAL_REQUEST_APPROVED
    : NotificationType.RENTAL_REQUEST_REJECTED;
  
  const title = approved
    ? "Rental Request Approved"
    : "Rental Request Rejected";
  
  const link = `/rentals/${rentalId}`;
  
  const notification: InsertNotification = {
    userId,
    type: notificationType,
    title,
    message,
    link,
    metadata: { rentalId },
    isRead: false,
  };
  
  const emailHtml = `
    <h2>${title}</h2>
    <p>${message}</p>
    <p>Visit <a href="https://clockworkgamers.net${link}">your rental request</a> for more information.</p>
  `;
  
  return createNotification(notification, sendEmail, title, emailHtml);
}

/**
 * Creates a notification when a streamer goes live
 */
export async function createStreamerLiveNotification(
  streamerId: number,
  streamTitle: string,
  game: string
): Promise<boolean> {
  try {
    // Get streamer info
    const streamer = await storage.getStreamer(streamerId);
    if (!streamer) {
      return false;
    }
    
    // Get users who should be notified (for now, notify all users)
    // In the future, this should be based on user preferences/follows
    const users = await storage.listUsers();
    
    const title = `${streamer.displayName} is live!`;
    const message = `${streamer.displayName} is streaming ${game}: ${streamTitle}`;
    const link = `/streamers/${streamerId}`;
    
    // Create notifications for each user (in a real-world scenario, you'd want to queue these)
    const notificationPromises = users.map(user => {
      const notification: InsertNotification = {
        userId: user.id,
        type: NotificationType.STREAMER_LIVE,
        title,
        message,
        link,
        metadata: {
          streamerId,
          streamTitle,
          game
        },
        isRead: false,
      };
      
      return createNotification(notification, false); // Don't send emails for streamer notifications
    });
    
    await Promise.all(notificationPromises);
    return true;
  } catch (error) {
    console.error("Error creating streamer live notifications:", error);
    return false;
  }
}

/**
 * Creates a notification for a new message
 */
export async function createMessageNotification(
  userId: number,
  senderName: string,
  messagePreview: string,
  chatRoomId: string
): Promise<boolean> {
  const title = `New message from ${senderName}`;
  const message = messagePreview.length > 50
    ? `${messagePreview.substring(0, 50)}...`
    : messagePreview;
  
  const link = `/chat/${chatRoomId}`;
  
  const notification: InsertNotification = {
    userId,
    type: NotificationType.NEW_MESSAGE,
    title,
    message,
    link,
    metadata: {
      chatRoomId,
      senderName
    },
    isRead: false,
  };
  
  return createNotification(notification, false); // Don't send emails for chat notifications
}

/**
 * Creates a system notification for all users or a specific user
 */
export async function createSystemNotification(
  message: string,
  title = "System Notification",
  specificUserId?: number,
  sendEmail = false
): Promise<boolean> {
  try {
    if (specificUserId) {
      // Create notification for a specific user
      const notification: InsertNotification = {
        userId: specificUserId,
        type: NotificationType.SYSTEM,
        title,
        message,
        isRead: false,
      };
      
      return createNotification(notification, sendEmail);
    } else {
      // Create notification for all users
      const users = await storage.listUsers();
      
      const notificationPromises = users.map(user => {
        const notification: InsertNotification = {
          userId: user.id,
          type: NotificationType.SYSTEM,
          title,
          message,
          isRead: false,
        };
        
        return createNotification(notification, sendEmail);
      });
      
      await Promise.all(notificationPromises);
      return true;
    }
  } catch (error) {
    console.error("Error creating system notification:", error);
    return false;
  }
}

/**
 * Creates a notification for a successful referral
 */
export async function createReferralNotification(
  referrerId: number,
  referredUsername: string
): Promise<boolean> {
  const title = "New Referral";
  const message = `${referredUsername} joined using your referral code!`;
  
  const notification: InsertNotification = {
    userId: referrerId,
    type: NotificationType.REFERRAL,
    title,
    message,
    link: "/profile/referrals",
    metadata: {
      referredUsername
    },
    isRead: false,
  };
  
  return createNotification(notification, true, "You've earned a referral on ClockWork Gamers!");
}
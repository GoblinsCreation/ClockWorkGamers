import nodemailer from "nodemailer";
import { Request, Response } from "express";

// Check if we have SMTP credentials in the environment
const hasSmtpConfig = 
  process.env.SMTP_HOST && 
  process.env.SMTP_PORT && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASS;

// Create a transporter object with SMTP config (if available)
let transporter: nodemailer.Transporter | null = null;

if (hasSmtpConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Validates the contact form data and handles sending the email
 */
export async function handleContactForm(req: Request, res: Response) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }
    
    // Check if email service is configured
    if (!transporter) {
      console.warn("Contact form submission received, but email transport not configured");
      return res.status(503).json({ 
        success: false, 
        message: "Email service is not configured. Please contact us directly at contact@clockworkgamers.net" 
      });
    }
    
    // Send email
    const mailOptions = {
      from: `"ClockWork Gamers Contact" <${process.env.SMTP_USER}>`,
      to: "contact@clockworkgamers.net", // Main contact address
      replyTo: email,
      subject: `CWG Contact: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e67e22;">New Contact Form Submission</h2>
  <p><strong>From:</strong> ${name} (${email})</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #e67e22;">
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  </div>
  <p style="margin-top: 20px; font-size: 12px; color: #6c757d;">
    This message was sent from the contact form on clockworkgamers.net
  </p>
</div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: "Your message has been sent! We'll get back to you soon." 
    });
    
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send your message. Please try again later." 
    });
  }
}

/**
 * Sends a test email to verify the SMTP configuration
 */
export async function sendTestEmail(req: Request, res: Response) {
  try {
    // Admin-only route, check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    // Check if email service is configured
    if (!transporter) {
      return res.status(503).json({ 
        success: false, 
        message: "Email service is not configured. Check SMTP environment variables." 
      });
    }
    
    // Get test recipient from request or use user's email
    const { recipient } = req.body;
    const testEmail = recipient || req.user!.email;
    
    if (!testEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "No recipient email provided and user has no email." 
      });
    }
    
    // Send test email
    const mailOptions = {
      from: `"ClockWork Gamers" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: "CWG Email Test",
      text: "This is a test email from ClockWork Gamers website. If you're seeing this, email delivery is working!",
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e67e22;">Email Test Successful!</h2>
  <p>This is a test email from ClockWork Gamers website.</p>
  <p>If you're seeing this, email delivery is working correctly!</p>
  <p style="margin-top: 20px; font-size: 12px; color: #6c757d;">
    This test was initiated by admin from clockworkgamers.net
  </p>
</div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: `Test email sent successfully to ${testEmail}` 
    });
    
  } catch (error: any) {
    console.error("Error sending test email:", error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to send test email: ${error?.message || 'Unknown error'}` 
    });
  }
}
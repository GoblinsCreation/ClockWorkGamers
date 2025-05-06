import Stripe from "stripe";
import { Request, Response } from "express";
import { storage } from "./storage";
import { InsertPayment, InsertCoursePurchase, InsertRentalPurchase } from "@shared/schema";

// Initialize Stripe client
const { STRIPE_SECRET_KEY } = process.env;

// Create a Stripe instance only if the secret key is available
let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16' as any,
  });
} else {
  console.warn("Missing STRIPE_SECRET_KEY - Stripe payments will be unavailable");
}

/**
 * Creates a payment intent with Stripe
 */
export async function createPaymentIntent(req: Request, res: Response) {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe service unavailable" });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { amount, currency = "usd", description, metadata = {} } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ 
        error: "Invalid amount. Amount must be a positive number." 
      });
    }

    const userId = req.user!.id;

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)), 
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId.toString(),
        ...metadata
      },
      description: description || "ClockWork Gamers payment"
    });

    // Save payment record in database
    const payment = await storage.createPayment({
      userId,
      amount: Math.round(Number(amount)),
      currency: currency.toLowerCase(),
      status: 'pending',
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
      description: description || "ClockWork Gamers payment",
      metadata: metadata as any
    });

    // Return the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ 
      error: "Failed to create payment intent",
      message: error.message 
    });
  }
}

/**
 * Creates a Stripe session for subscription payments
 */
export async function createSubscription(req: Request, res: Response) {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe service unavailable" });
    }

    const { priceId, customerId, successUrl, cancelUrl } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: "Price ID is required" });
    }
    
    // Create checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/payment/cancel`,
    };
    
    // If we have a customer ID, include it in the session
    if (customerId) {
      sessionParams.customer = customerId;
    }
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    // Return the session to the client
    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ 
      error: "Failed to create subscription",
      message: error.message 
    });
  }
}

/**
 * Handles webhook events from Stripe
 */
export async function handleWebhook(req: Request, res: Response) {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe service unavailable" });
    }

    const sig = req.headers['stripe-signature'];
    
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: "Webhook signature missing" });
    }
    
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        
        // Find the payment in our database
        const payment = await storage.getPaymentByIntentId(paymentIntent.id);
        if (payment) {
          // Update payment status
          await storage.updatePayment(payment.id, { status: 'completed' });
          
          // Check metadata to see what this payment was for
          const metadata = payment.metadata as Record<string, any> || {};
          
          if (metadata && typeof metadata === 'object' && metadata.type === 'course' && metadata.courseId) {
            const courseId = Number(metadata.courseId);
            // Create course purchase record
            await storage.createCoursePurchase({
              userId: payment.userId,
              courseId: courseId,
              paymentId: payment.id,
              status: 'active',
              // Set access expiration if applicable
              accessExpires: metadata.accessExpires ? new Date(metadata.accessExpires) : null
            });
            
            console.log(`Course purchase created for course ${courseId}, user ${payment.userId}`);
          }
          
          if (metadata && typeof metadata === 'object' && metadata.type === 'rental' && metadata.rentalId) {
            const rentalId = Number(metadata.rentalId);
            const startDate = new Date();
            
            // Calculate end date based on rental duration (in days)
            const durationDays = metadata.durationDays ? Number(metadata.durationDays) : 7;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durationDays);
            
            // Create rental purchase record
            await storage.createRentalPurchase({
              userId: payment.userId,
              rentalId: rentalId,
              paymentId: payment.id,
              startDate: startDate,
              endDate: endDate,
              status: 'active'
            });
            
            console.log(`Rental purchase created for rental ${rentalId}, user ${payment.userId}`);
          }
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPayment.last_payment_error?.message}`);
        
        // Update payment status in our database
        const failedDbPayment = await storage.getPaymentByIntentId(failedPayment.id);
        if (failedDbPayment) {
          const existingMetadata = failedDbPayment.metadata as Record<string, any> || {};
          await storage.updatePayment(failedDbPayment.id, { 
            status: 'failed',
            metadata: {
              ...(typeof existingMetadata === 'object' ? existingMetadata : {}),
              failureReason: failedPayment.last_payment_error?.message || 'Unknown error'
            } as any
          });
        }
        break;
        
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ${subscription.id}`);
        // Handle new subscription
        break;
        
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${updatedSubscription.id}`);
        // Handle subscription update
        break;
        
      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription canceled: ${canceledSubscription.id}`);
        // Handle subscription cancellation
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
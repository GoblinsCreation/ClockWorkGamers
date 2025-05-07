import Stripe from "stripe";
import { Request, Response } from "express";

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

    const { amount, currency = "usd" } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ 
        error: "Invalid amount. Amount must be a positive number." 
      });
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)), 
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
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
        // Handle successful payment (e.g., update order status)
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPayment.last_payment_error?.message}`);
        // Handle failed payment
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
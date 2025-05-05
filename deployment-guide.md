# ClockWork Gamers Deployment Guide

This guide will help you deploy the ClockWork Gamers esports guild website to a live server and connect it to your custom domain (clockworkgamers.net).

## Prerequisites

Before starting the deployment process, make sure you have:

1. Purchased the domain "clockworkgamers.net" from a domain registrar (Namecheap, GoDaddy, etc.)
2. Access to your domain's DNS settings
3. A GitHub account (for version control and deployment integrations)

## Recommended Deployment Options

### Option 1: Vercel (Recommended for React apps)

#### Step 1: Push your code to GitHub
1. Create a GitHub repository
2. Push your code to the repository

#### Step 2: Connect Vercel to GitHub
1. Sign up for a Vercel account at [vercel.com](https://vercel.com)
2. Click "New Project" and select your GitHub repository
3. Configure the build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
#### Step 3: Set up environment variables
1. In Vercel project settings, add these environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key
   - `PAYPAL_CLIENT_ID`: Your PayPal client ID
   - `PAYPAL_CLIENT_SECRET`: Your PayPal client secret
   - Any other secrets or API keys needed

#### Step 4: Connect your custom domain
1. In Vercel, go to "Domains" in your project settings
2. Add "clockworkgamers.net" as your domain
3. Follow Vercel's instructions to update your DNS settings at your domain registrar

### Option 2: Netlify

Similar to Vercel but with some differences in the build configuration.

#### Step 1: Push your code to GitHub (same as above)

#### Step 2: Connect Netlify to GitHub
1. Sign up for a Netlify account at [netlify.com](https://netlify.com)
2. Click "New site from Git" and select your GitHub repository
3. Configure the build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

#### Step 3: Set up environment variables (same as Vercel)

#### Step 4: Connect your custom domain
1. In Netlify, go to "Domain settings"
2. Add "clockworkgamers.net" as your custom domain
3. Follow Netlify's instructions to update your DNS settings

### Option 3: DigitalOcean App Platform

Good if you want more control over your hosting environment.

1. Create a DigitalOcean account
2. Go to App Platform and create a new app
3. Connect to your GitHub repository
4. Configure as a Web Service with Node.js
5. Set up environment variables
6. Add your domain in the Settings section

## Database Setup for Production

For a production PostgreSQL database, you have several options:

### Option 1: Neon Database (Recommended)
1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string
4. Add it as the `DATABASE_URL` environment variable in your hosting platform

### Option 2: Supabase
1. Create an account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your PostgreSQL connection string
4. Add it as the `DATABASE_URL` environment variable

### Option 3: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Get your connection string
4. Add it as the `DATABASE_URL` environment variable

## SSL/HTTPS Setup

Most modern hosting platforms (Vercel, Netlify, DigitalOcean) automatically provision SSL certificates for your custom domain using Let's Encrypt. You don't need to set this up manually.

## Post-Deployment Checklist

After deploying your site, make sure to:

1. Test all functionality in the production environment
2. Check mobile responsiveness on real devices
3. Verify all API integrations (Web3, Stripe, PayPal) work correctly
4. Set up monitoring and analytics (Google Analytics, Sentry, etc.)
5. Configure backups for your database

## Maintenance Recommendations

1. Set up CI/CD pipelines for automated testing and deployment
2. Regularly update dependencies to patch security vulnerabilities
3. Monitor server performance and database health
4. Take regular database backups
5. Set up uptime monitoring to be alerted if your site goes down

## Support Resources

If you need additional help with deployment:
- Vercel Documentation: [https://vercel.com/docs](https://vercel.com/docs)
- Netlify Documentation: [https://docs.netlify.com](https://docs.netlify.com)
- DigitalOcean App Platform Documentation: [https://docs.digitalocean.com/products/app-platform/](https://docs.digitalocean.com/products/app-platform/)
- Neon Database Documentation: [https://neon.tech/docs/](https://neon.tech/docs/)
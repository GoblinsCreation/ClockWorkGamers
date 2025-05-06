# Architecture Overview

## 1. Introduction

ClockWork Gamers is a Web3 gaming guild platform that combines traditional gaming community features with blockchain technology. The platform allows users to participate in play-to-earn games, manage NFT assets, engage with other guild members, and access various Web3 features.

## 2. System Architecture

The application follows a modern full-stack JavaScript architecture with clear separation of concerns:

```
ClockWork Gamers
├── client/                # Frontend React application
├── server/                # Backend Express.js server
├── shared/                # Shared code (schemas, types)
├── migrations/            # Database migrations
├── php_scripts/           # PHP utilities for admin functions
```

### 2.1 High-Level Architecture

The system uses a layered architecture:

- **Frontend Layer**: React-based SPA with client-side routing
- **API Layer**: RESTful API built with Express.js
- **Data Layer**: PostgreSQL database with Drizzle ORM
- **Integration Layer**: Connects with external services (Stripe, PayPal, Twitch, Web3 providers)

## 3. Frontend Architecture

### 3.1 Core Technologies

- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with custom theme variables
- **UI Components**: Custom components based on shadcn/ui system
- **State Management**: React Query for server state and React Context for global app state
- **Routing**: Wouter library for client-side routing

### 3.2 Frontend Structure

```
client/
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components mapped to routes
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
└── index.html             # HTML template
```

### 3.3 Key Frontend Components

- **Authentication System**: Custom auth system with session management
- **Web3 Integration**: Wallet connection and blockchain interaction
- **Streaming Platform**: Integration with Twitch API for streamer management
- **Payment Processing**: Multi-provider payment flow (Stripe, PayPal, crypto)
- **Real-time Features**: Chat system with WebSocket communication

## 4. Backend Architecture

### 4.1 Core Technologies

- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for PostgreSQL
- **API Pattern**: RESTful API with JSON responses
- **Authentication**: Session-based auth with Passport.js
- **Real-time Communication**: WebSockets via ws library

### 4.2 Backend Structure

```
server/
├── auth.ts                # Authentication configuration
├── db.ts                  # Database connection and setup
├── email.ts               # Email service for notifications
├── index.ts               # Server entry point
├── notifications.ts       # User notification system
├── onboarding.ts          # User onboarding flow
├── paypal.ts              # PayPal payment integration
├── php-integration.ts     # PHP script execution bridge
├── routes.ts              # API routes definition
├── storage.ts             # Data access layer
├── stripe.ts              # Stripe payment integration
├── twitch.ts              # Twitch API integration
└── vite.ts                # Development server configuration
```

### 4.3 Key Backend Services

- **Authentication Service**: User registration, login, and session management
- **Storage Service**: Data access layer for all database operations
- **Payment Services**: Multiple payment provider integrations (Stripe, PayPal, crypto)
- **Notification Service**: System for user notifications and alerts
- **Twitch Integration**: Streamer data synchronization and management
- **PHP Bridge**: Integration with PHP scripts for admin functionality

## 5. Database Architecture

### 5.1 Core Technologies

- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migration**: Drizzle Kit for schema migrations

### 5.2 Data Models

The database schema includes the following key models:

- **Users**: Core user information and authentication data
- **Streamers**: Twitch streamer profiles linked to users
- **Courses**: Educational content offered by the platform
- **Rentals**: NFT and in-game item rental system
- **News**: Platform news and announcements
- **Chat Messages**: User communication data
- **Referrals**: User referral tracking system
- **Notifications**: User notification storage
- **Guild Achievements**: Achievement system for gamification
- **User Preferences**: Onboarding and personalization settings

### 5.3 Schema Management

- Schema is defined in TypeScript in the `shared/schema.ts` file
- Migrations are generated and managed with Drizzle Kit
- Both manual SQL and programmatic migrations are supported

## 6. Authentication and Authorization

### 6.1 Authentication System

- Session-based authentication using express-session
- Password hashing with scrypt and secure comparison
- Session storage in PostgreSQL via connect-pg-simple

### 6.2 Authorization

- Role-based access control with multiple user levels (User, Mod, Admin, Owner)
- Protected routes on both frontend and backend
- Web3 wallet authentication for blockchain operations

## 7. External Integrations

### 7.1 Payment Providers

- **Stripe**: Credit card processing with webhooks
- **PayPal**: PayPal payment processing
- **Crypto Payments**: Web3 wallet-based cryptocurrency payments

### 7.2 Blockchain Integrations

- **Ethereum**: Via ethers.js for ERC-20 and ERC-721 interactions
- **Solana**: Integration for Solana-based games and NFTs
- **Web3 Wallets**: Support for multiple wallet connections

### 7.3 Third-Party Services

- **Twitch API**: Streamer data integration and live status
- **SendGrid**: Email service for notifications
- **Database**: Neon serverless PostgreSQL 

## 8. Deployment Strategy

### 8.1 Build Process

- Frontend: Vite for development and production builds
- Backend: ESBuild for Node.js compilation
- Combined output to a unified dist directory

### 8.2 Deployment Options

- **Primary Deployment**: Vercel (recommended in documentation)
  - Framework preset: Vite
  - Build command: `npm run build`
  - Output directory: `dist`

- **Alternative Deployment**: Netlify (documented as secondary option)

### 8.3 Environment Configuration

- Environment variables for API keys and service configurations
- Database URL configuration for PostgreSQL connection
- Support for multiple deployment environments (development, production)

## 9. Development Workflow

### 9.1 Local Development

- Combined dev server with Vite and Express
- Hot module replacement for frontend
- Auto-restart for backend changes

### 9.2 Database Management

- Local database migrations with Drizzle Kit
- Database schema synchronization with `db:push` command

## 10. Special Features

### 10.1 PHP Integration

- Hybrid application that supports PHP scripts for admin functionality
- PHP execution bridge from Node.js to PHP for legacy compatibility
- Admin panel with PHP-based database reporting tools

### 10.2 User Onboarding Flow

- Structured onboarding process for new users
- Preference and interest tracking
- Personalized recommendations based on user profile

### 10.3 Achievement System

- Gamification through guild achievements
- Rewards for platform engagement and activity
- Progress tracking and notification system

## 11. Security Considerations

- CORS configuration for API security
- Secure password hashing with scrypt
- Session security with HTTP-only cookies
- Input validation with Zod schemas
- Secure WebSocket connections

## 12. Conclusion

ClockWork Gamers is built on a modern full-stack JavaScript architecture that combines traditional web application patterns with Web3 capabilities. The system's modular design allows for flexibility and expansion while maintaining a clear separation of concerns between frontend, backend, and data layers.

The architecture prioritizes user experience through responsive design, real-time features, and seamless integration with blockchain technologies, creating a unified platform for the Web3 gaming guild.
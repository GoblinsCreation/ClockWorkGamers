import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TestPage from "@/pages/test-page";
import StreamersPage from "@/pages/streamers-page";
import StreamerProfilePage from "@/pages/streamer-profile-page";
import RentalsPage from "@/pages/rentals-page";
import CoursesPage from "@/pages/courses-page";
import CalculatorsPage from "@/pages/calculators-page";
import ContactPage from "@/pages/contact-page";
import AdminPage from "@/pages/admin-page-new";
import NFTMarketplacePage from "@/pages/nft-marketplace-page";
import TokenDashboardPage from "@/pages/token-dashboard-page";
import PlayToEarnPage from "@/pages/play-to-earn-page";
import PayToEarnPage from "@/pages/pay-to-earn-page";
import PaymentPage from "@/pages/payment-page";
import PaymentOptionsPage from "@/pages/payment-options";
import GamesPage from "@/pages/games-page";
import InvestmentsPage from "@/pages/investments-page";
import ProfilePage from "@/pages/profile-page";
import ChatPage from "@/pages/chat-page";
import ReferralsPage from "@/pages/referrals-page";
import NewsPage from "@/pages/news-page";
import AchievementsPage from "@/pages/achievements-page";
import DemoPage from "@/pages/demo-page";
import ShowcasePage from "@/pages/showcase-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import TermsOfServicePage from "@/pages/terms-of-service-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "./hooks/use-auth";
import { Web3Provider } from "./hooks/use-web3";
import SimpleChatWidget from "@/components/chat/SimpleChatWidget";
import AchievementUnlockNotification from "@/components/achievements/AchievementUnlockNotification";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

// Fallback component to show if there are critical errors
function ErrorBoundaryFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="container max-w-md text-center p-6 rounded-lg border border-orange-500 bg-gray-900">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">ClockWork Gamers</h2>
        <p className="mb-4">There was a problem loading the application. Please try again.</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-orange-500 text-orange-500 hover:bg-orange-950"
        >
          Reload Application
        </Button>
      </div>
    </div>
  );
}

// Simple error boundary class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error("Application error caught by boundary:", error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback />;
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/cookie-policy" component={CookiePolicyPage} />
      <Route path="/test" component={TestPage} />
      
      {/* Protected Routes - Require Authentication */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/streamers" component={StreamersPage} />
      <ProtectedRoute path="/streamers/:id" component={StreamerProfilePage} />
      <ProtectedRoute path="/rentals" component={RentalsPage} />
      <ProtectedRoute path="/courses" component={CoursesPage} />
      <ProtectedRoute path="/games" component={GamesPage} />
      <ProtectedRoute path="/investments" component={InvestmentsPage} />
      <ProtectedRoute path="/play-to-earn" component={PlayToEarnPage} />
      <ProtectedRoute path="/pay-to-earn" component={PayToEarnPage} />
      <ProtectedRoute path="/payment" component={PaymentPage} />
      <ProtectedRoute path="/payment-options" component={PaymentOptionsPage} />
      <ProtectedRoute path="/nft-marketplace" component={NFTMarketplacePage} />
      <ProtectedRoute path="/token-dashboard" component={TokenDashboardPage} />
      <ProtectedRoute path="/calculators" component={CalculatorsPage} />
      <ProtectedRoute path="/contact" component={ContactPage} />
      <ProtectedRoute path="/news" component={NewsPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/referrals" component={ReferralsPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/demo" component={DemoPage} />
      <ProtectedRoute path="/showcase" component={ShowcasePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check if app is in an unrecoverable state
  const [isCriticalError, setIsCriticalError] = useState(false);

  useEffect(() => {
    // Setup global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check for critical 403 errors
      if (args.some(arg => 
        (typeof arg === 'string' && arg.includes('403 Forbidden')) ||
        (typeof arg === 'object' && arg?.message?.includes('403 Forbidden'))
      )) {
        setIsCriticalError(true);
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Show fallback UI if in critical error state
  if (isCriticalError) {
    return <ErrorBoundaryFallback />;
  }

  const [enableFeatures, setEnableFeatures] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('initializing');
  
  // Attempt to verify WebSocket connectivity
  useEffect(() => {
    let wsCheckTimer: ReturnType<typeof setTimeout>;
    let wsCheckAttempts = 0;
    const MAX_ATTEMPTS = 3;
    
    const checkWebSocketConnectivity = () => {
      try {
        // Try to establish a WebSocket connection
        const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          console.log('WebSocket connection successful');
          setConnectionStatus('connected');
          setEnableFeatures(true);
          ws.close();
        };
        
        ws.onerror = (error) => {
          console.warn('WebSocket connection check failed:', error);
          wsCheckAttempts++;
          
          if (wsCheckAttempts >= MAX_ATTEMPTS) {
            console.log('Maximum WebSocket connection attempts reached, continuing with limited features');
            setConnectionStatus('failed');
            setEnableFeatures(false);
          } else {
            // Retry after delay
            wsCheckTimer = setTimeout(checkWebSocketConnectivity, 2000);
          }
        };
        
        // Set a timeout to close the connection if it doesn't establish quickly
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
          }
        }, 5000);
      } catch (error) {
        console.error('WebSocket initialization error:', error);
        setConnectionStatus('failed');
        setEnableFeatures(false);
      }
    };
    
    checkWebSocketConnectivity();
    
    return () => {
      if (wsCheckTimer) clearTimeout(wsCheckTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Web3Provider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                  {/* Enable features conditionally based on WebSocket connectivity */}
                  {enableFeatures && (
                    <>
                      <SimpleChatWidget />
                      <AchievementUnlockNotification />
                      <OnboardingFlow />
                    </>
                  )}
                  {connectionStatus === 'failed' && (
                    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 border border-orange-500 text-white p-3 rounded shadow-lg text-sm">
                      <p className="font-semibold">Limited Functionality Mode</p>
                      <p className="text-xs text-gray-300">Some features are disabled</p>
                    </div>
                  )}
                </TooltipProvider>
              </ThemeProvider>
          </Web3Provider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

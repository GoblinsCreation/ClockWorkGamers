import React, { useState, useEffect, Component, ReactNode } from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "./hooks/use-auth";
import TestPage from './pages/test-page';
import AuthPage from '@/pages/auth-page';
import NotFound from '@/pages/not-found';
import { Button } from '@/components/ui/button';

// Simple error boundary component
class ErrorBoundary extends Component<{ children: ReactNode, onError: () => void }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Application crashed:", error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
          <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-orange-500">
            <h1 className="text-3xl font-bold text-orange-500 mb-4">Error</h1>
            <p className="mb-6">There was a problem loading the application.</p>
            <Button onClick={() => window.location.reload()}>Reload Application</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// A simplified app that only includes auth and basic routing
export default function MinimalApp() {
  const [hasError, setHasError] = useState(false);

  // Log when application initializes
  useEffect(() => {
    console.log("MinimalApp initialized");
  }, []);

  // Simple error handler
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-orange-500">
          <h1 className="text-3xl font-bold text-orange-500 mb-4">Error</h1>
          <p className="mb-6">There was a problem loading the application.</p>
          <Button onClick={() => window.location.reload()}>Reload Application</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Toaster />
            
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <Route path="/test" component={TestPage} />
              <Route path="/" component={TestPage} />
              <Route component={NotFound} />
            </Switch>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
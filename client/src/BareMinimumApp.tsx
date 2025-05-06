import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Create a simple welcome page with no authentication or WebSocket dependencies
function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-orange-500">
        <h1 className="text-3xl font-bold text-orange-500 mb-4">ClockWork Gamers</h1>
        <p className="mb-6">This page is loading correctly. We can now restore more application functionality.</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Status</h2>
            <p>The basic application framework is working.</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-green-400 mb-2">Next Steps</h2>
            <p>We are ready to add more complex functionality incrementally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Super simple 404 page
function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="rounded-lg border border-orange-500 bg-gray-900 p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-orange-500">Page Not Found</h1>
        <p className="mb-4">The page you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="inline-block rounded bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// A super minimal app with no authentication, WebSockets, or other complex dependencies
function BareMinimumApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/" component={WelcomePage} />
          <Route component={NotFoundPage} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default BareMinimumApp;
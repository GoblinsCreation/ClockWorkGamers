import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Simple page components
const HomePage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">ClockWork Gamers</h1>
    <p className="mb-6">Website is working correctly. This is a simplified version to restore functionality.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gray-900 border border-orange-500 rounded-lg p-4">
        <h2 className="text-xl font-bold text-orange-500 mb-2">Admin Dashboard</h2>
        <p>Manage guild members, streamers, and analytics</p>
        <a href="/admin" className="text-blue-400 hover:underline block mt-2">Access Admin</a>
      </div>
      <div className="bg-gray-900 border border-orange-500 rounded-lg p-4">
        <h2 className="text-xl font-bold text-orange-500 mb-2">Authentication</h2>
        <p>Login or register for an account</p>
        <a href="/auth" className="text-blue-400 hover:underline block mt-2">Login/Register</a>
      </div>
      <div className="bg-gray-900 border border-orange-500 rounded-lg p-4">
        <h2 className="text-xl font-bold text-orange-500 mb-2">Other Pages</h2>
        <p>Verify other pages are accessible</p>
        <div className="mt-2 space-y-1">
          <a href="/streamers" className="text-blue-400 hover:underline block">Streamers</a>
          <a href="/rentals" className="text-blue-400 hover:underline block">Rentals</a>
          <a href="/courses" className="text-blue-400 hover:underline block">Courses</a>
        </div>
      </div>
    </div>
  </div>
);

const AdminPage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Admin Dashboard</h1>
    <p className="mb-6">This is a simplified admin page for verification purposes.</p>
    <a href="/" className="text-blue-400 hover:underline">&larr; Back to Home</a>
  </div>
);

const AuthPage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Authentication</h1>
    <p className="mb-6">This is a simplified login/registration page for verification purposes.</p>
    <a href="/" className="text-blue-400 hover:underline">&larr; Back to Home</a>
  </div>
);

const StreamersPage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Streamers</h1>
    <p className="mb-6">This is a simplified streamers page for verification purposes.</p>
    <a href="/" className="text-blue-400 hover:underline">&larr; Back to Home</a>
  </div>
);

const RentalsPage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Rentals</h1>
    <p className="mb-6">This is a simplified rentals page for verification purposes.</p>
    <a href="/" className="text-blue-400 hover:underline">&larr; Back to Home</a>
  </div>
);

const CoursesPage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Courses</h1>
    <p className="mb-6">This is a simplified courses page for verification purposes.</p>
    <a href="/" className="text-blue-400 hover:underline">&larr; Back to Home</a>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen bg-black text-white p-8">
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Page Not Found</h1>
    <p className="mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-blue-400 hover:underline">&larr; Back to Home</a>
  </div>
);

// Simple router without protected routes
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/streamers" component={StreamersPage} />
      <Route path="/rentals" component={RentalsPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

// Core app with minimal dependencies
function CoreApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default CoreApp;
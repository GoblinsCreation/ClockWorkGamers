import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import React from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  const { user, isLoading, error } = useAuth();

  // Create actual route renderers to ensure they return React.ReactElement
  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const renderRedirectToAuth = () => <Redirect to="/auth" />;
  
  const renderRedirectToHome = () => <Redirect to="/" />;

  // Handle loading state
  if (isLoading) {
    return <Route path={path}>{renderLoading}</Route>;
  }

  // If there's an error or no user, redirect to auth page
  if (!user) {
    console.log("No authenticated user, redirecting to auth page");
    return <Route path={path}>{renderRedirectToAuth}</Route>;
  }

  // Additional check for admin-only routes
  if (path === "/admin" && 
      !user.isAdmin && 
      user.role !== "Mod" && 
      user.role !== "Admin" && 
      user.role !== "Owner") {
    console.log("User doesn't have admin privileges, redirecting to home");
    return <Route path={path}>{renderRedirectToHome}</Route>;
  }

  // Use the pattern that ensures Component always returns a non-null Element
  return <Route path={path} component={Component} />;
}

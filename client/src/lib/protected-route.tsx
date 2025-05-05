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
  const { user, isLoading } = useAuth();

  // Create actual route renderers to ensure they return React.ReactElement
  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-border" />
    </div>
  );

  const renderRedirectToAuth = () => <Redirect to="/auth" />;
  
  const renderRedirectToHome = () => <Redirect to="/" />;

  if (isLoading) {
    return <Route path={path}>{renderLoading}</Route>;
  }

  if (!user) {
    return <Route path={path}>{renderRedirectToAuth}</Route>;
  }

  // Additional check for admin-only routes
  if (path === "/admin" && 
      !user.isAdmin && 
      user.role !== "Mod" && 
      user.role !== "Admin" && 
      user.role !== "Owner") {
    return <Route path={path}>{renderRedirectToHome}</Route>;
  }

  // Use the pattern that ensures Component always returns a non-null Element
  return <Route path={path} component={Component} />;
}

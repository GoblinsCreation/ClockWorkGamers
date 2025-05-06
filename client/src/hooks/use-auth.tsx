import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Simplified login and register types for minimal functionality
type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string; 
  password: string;
  role?: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  isAuthError: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  checkConnectivity: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isAuthError, setIsAuthError] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Check if server is reachable
  const checkConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const res = await fetch('/api/healthcheck', { 
          signal: controller.signal,
          method: 'GET',
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        return res.ok;
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("Server connectivity check failed:", err);
        return false;
      }
    } catch (error) {
      console.error("Connectivity check error:", error);
      return false;
    }
  };

  // User data query with enhanced error handling
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        // Create an AbortController with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        try {
          console.log("Fetching user data...");
          const res = await fetch(queryKey[0] as string, { 
            credentials: 'include',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (res.status === 401 || res.status === 403) {
            console.log(`Authentication error: ${res.status}`);
            return null;
          }
          
          if (!res.ok) {
            const text = await res.text();
            console.error(`User fetch error: ${res.status} - ${text || res.statusText}`);
            
            if (res.status >= 500) {
              setIsAuthError(true);
            }
            
            return null;
          }
          
          const userData = await res.json();
          setIsAuthError(false);
          return userData;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error("User fetch timed out");
            setIsAuthError(true);
            return null;
          }
          
          if (!navigator.onLine) {
            console.error("Network offline during user fetch");
            return null;
          }
          
          console.error("Error fetching user:", fetchError);
          setIsAuthError(true);
          return null;
        }
      } catch (error) {
        console.error("User query exception:", error);
        setIsAuthError(true);
        return null;
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  // Attempt reconnection if there are auth errors
  useEffect(() => {
    if (isAuthError && connectionAttempts < 2) {
      const reconnectTimer = setTimeout(() => {
        console.log(`Auth reconnection attempt ${connectionAttempts + 1}`);
        setConnectionAttempts(prev => prev + 1);
        refetch();
      }, 3000);
      
      return () => clearTimeout(reconnectTimer);
    }
  }, [isAuthError, connectionAttempts, refetch]);

  // Enhanced login mutation with better error handling
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login...");
        const res = await apiRequest("POST", "/api/login", credentials);
        return await res.json();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      setIsAuthError(false);
      toast({
        title: "Login successful",
        description: `Welcome back${user.username ? `, ${user.username}` : ''}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Unable to log in. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        console.log("Attempting registration...");
        const res = await apiRequest("POST", "/api/register", userData);
        return await res.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      setIsAuthError(false);
      toast({
        title: "Registration successful",
        description: `Welcome to ClockWork Gamers${user.username ? `, ${user.username}` : ''}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting logout...");
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout mutation error:", error);
      // If logout fails, still clear user data from client
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout issue",
        description: "Session ended, but there was a server communication error.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthError,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        checkConnectivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

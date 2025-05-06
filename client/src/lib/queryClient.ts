import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Enhanced error handling that logs detailed information about failed responses
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = (await res.text()) || res.statusText;
      console.error(`API request failed with status ${res.status}: ${text}`);
      throw new Error(`${res.status}: ${text}`);
    } catch (error) {
      console.error("Error processing API response:", error);
      throw new Error(`${res.status}: Failed to process response`);
    }
  }
}

/**
 * Makes an API request with timeout and improved error handling
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  timeout: number = 10000
): Promise<Response> {
  try {
    console.log(`Making ${method} request to ${url}`);
    
    // Create an AbortController with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Log important errors with more context
      if (res.status === 403) {
        console.error(`403 Forbidden response from ${url} - This might be an authentication issue`);
      }
      
      if (res.status === 500) {
        console.error(`500 Server Error from ${url} - The server encountered an internal error`);
      }

      await throwIfResNotOk(res);
      return res;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout and network errors specifically
      if (fetchError.name === 'AbortError') {
        console.error(`Request to ${url} timed out after ${timeout}ms`);
        throw new Error(`Request timed out: ${url}`);
      }
      
      if (!navigator.onLine) {
        console.error(`Network offline during request to ${url}`);
        throw new Error(`Network offline. Please check your connection.`);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Query function factory with enhanced error handling and timeout support
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  timeout?: number;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, timeout = 10000 }) =>
  async ({ queryKey }) => {
    try {
      console.log(`Making query request to ${queryKey[0]}`);
      
      // Create an AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (res.status === 401) {
          console.log(`401 Unauthorized response from ${queryKey[0]}`);
          if (unauthorizedBehavior === "returnNull") {
            return null;
          }
          throw new Error("Unauthorized");
        }
        
        if (res.status === 403) {
          console.error(`403 Forbidden response from ${queryKey[0]} - Check authentication`);
        }
        
        if (res.status === 500) {
          console.error(`500 Server Error from ${queryKey[0]} - Server encountered an error`);
        }

        await throwIfResNotOk(res);
        return await res.json();
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout and network errors specifically
        if (fetchError.name === 'AbortError') {
          console.error(`Request to ${queryKey[0]} timed out after ${timeout}ms`);
          throw new Error(`Request timed out: ${queryKey[0]}`);
        }
        
        if (!navigator.onLine) {
          console.error(`Network offline during request to ${queryKey[0]}`);
          throw new Error(`Network offline. Please check your connection.`);
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error(`Query to ${queryKey[0]} failed:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Allow one retry for transient errors
      retryDelay: 1000, // Wait 1 second before retry
    },
    mutations: {
      retry: 1, // Allow one retry for mutations too
      retryDelay: 1000,
    },
  },
});

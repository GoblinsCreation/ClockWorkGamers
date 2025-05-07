import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface QueryFnOptions {
  on401?: "returnNull" | "throw";
}

/**
 * Create a query function with a standardized approach to fetch data from the API
 */
export function getQueryFn(options: QueryFnOptions = {}) {
  const { on401 = "throw" } = options;

  return async function queryFn({ queryKey }: { queryKey: string[] }) {
    // Use the first item in the query key array as the endpoint
    const endpoint = queryKey[0];

    // Fetch the data
    const response = await fetch(endpoint);

    // If the response is 401 Unauthorized and we're configured to return null, do so
    if (response.status === 401 && on401 === "returnNull") {
      return null;
    }

    // For all other non-OK responses, throw an error
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${await response.text()}`);
    }

    // Parse and return the response body as JSON
    return await response.json();
  };
}

/**
 * Make an API request with standardized error handling
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API Error: ${response.status}`);
  }

  return response;
}
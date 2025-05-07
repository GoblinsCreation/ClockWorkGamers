/**
 * Crypto Price Service for ClockWork Gamers
 * Retrieves real-time price data from MEXC Exchange
 */

interface PriceResponse {
  data: {
    p: string; // price
    v: string; // volume
    c: string; // change
    h: string; // high
    l: string; // low
    t: number; // timestamp
  }[];
}

/**
 * Fetches the current price of BFToken from MEXC exchange
 * @returns The current price in USD
 */
export async function getBFTokenPrice(): Promise<number> {
  try {
    // MEXC API for BFToken/USDT price
    const response = await fetch('https://www.mexc.com/open/api/v2/market/ticker?symbol=BFTOKEN_USDT');
    
    if (!response.ok) {
      console.error('Failed to fetch BFToken price', response.statusText);
      return 0.03517; // Use default price if API fails
    }
    
    const data = await response.json() as PriceResponse;
    
    if (data && data.data && data.data.length > 0) {
      // Return the current price as a number
      return parseFloat(data.data[0].p);
    }
    
    return 0.03517; // Default price if API returns unexpected format
  } catch (error) {
    console.error('Error fetching BFToken price:', error);
    return 0.03517; // Default price if fetch fails
  }
}

/**
 * Cache for price data to reduce API calls
 */
const priceCache = {
  bfToken: 0.03517,
  lastFetched: 0,
  cacheDuration: 5 * 60 * 1000 // 5 minutes
};

/**
 * Gets the current BFToken price, using cached value if available
 * @returns The current price in USD
 */
export async function getCachedBFTokenPrice(): Promise<number> {
  const now = Date.now();
  
  // If cache is still valid, return cached price
  if (priceCache.lastFetched > 0 && 
      now - priceCache.lastFetched < priceCache.cacheDuration) {
    return priceCache.bfToken;
  }
  
  try {
    // Fetch fresh price
    const price = await getBFTokenPrice();
    
    // Update cache
    priceCache.bfToken = price;
    priceCache.lastFetched = now;
    
    return price;
  } catch (error) {
    console.error('Error getting cached BFToken price:', error);
    
    // If cache exists but is expired, still return it rather than default
    if (priceCache.lastFetched > 0) {
      return priceCache.bfToken;
    }
    
    return 0.03517; // Default fallback price
  }
}
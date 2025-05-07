/**
 * CryptoPrice Service for ClockWork Gamers (CWG)
 * Provides real-time and cached cryptocurrency price data from exchanges
 */

// Cache for storing price data
interface PriceCache {
  price: number;
  timestamp: number;
  expiry: number;
}

// Cache storage with 30-second TTL default
const priceCache: Record<string, PriceCache> = {};
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Fetches BFToken price from MEXC exchange
 * Returns the current price or null if fetch fails
 */
export async function fetchBFTokenPrice(): Promise<number | null> {
  try {
    // Production code should use the actual MEXC API
    // This endpoint should be the actual MEXC API that provides BFToken price
    const response = await fetch('https://www.mexc.com/open/api/v2/market/ticker?symbol=BFT_USDT');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse the price from the response
    // Note: This parsing logic depends on the actual MEXC API response structure
    // You may need to adjust this based on their actual API format
    if (data && data.data && data.data[0] && data.data[0].last) {
      const price = parseFloat(data.data[0].last);
      
      if (!isNaN(price) && price > 0) {
        // Cache the price
        priceCache['BFToken'] = {
          price,
          timestamp: Date.now(),
          expiry: Date.now() + CACHE_TTL
        };
        
        return price;
      }
    }
    
    // If we can't parse the price from the response, return null
    return null;
  } catch (error) {
    console.error('Error fetching BFToken price:', error);
    
    // If there's a cached price, return it even if it's expired
    // This ensures we always have some data to show, even if the API is down
    if (priceCache['BFToken']) {
      return priceCache['BFToken'].price;
    }
    
    return null;
  }
}

/**
 * Gets the BFToken price, preferring cached value if not expired
 * Will fetch fresh price if cache is expired or missing
 */
export async function getCachedBFTokenPrice(): Promise<number> {
  // Check if we have a cached price and it's not expired
  const cached = priceCache['BFToken'];
  if (cached && cached.expiry > Date.now()) {
    return cached.price;
  }
  
  // No valid cache, fetch fresh price
  const price = await fetchBFTokenPrice();
  
  // Return the price or fallback to default if fetch failed
  return price || 0.03517; // Default price if API fails
}

/**
 * Calculate price change percentage between two prices
 */
export function calculatePriceChange(currentPrice: number, previousPrice: number): number {
  if (!previousPrice || previousPrice <= 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Gets current BFToken price formatted with $ prefix
 */
export function getFormattedPrice(price: number): string {
  return `$${price.toFixed(5)}`;
}

/**
 * Helper to format large currency numbers
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
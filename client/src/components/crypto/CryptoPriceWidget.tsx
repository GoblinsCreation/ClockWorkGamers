import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CryptoPriceWidgetProps {
  symbol: string;
  price: number;
  previousPrice?: number;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export default function CryptoPriceWidget({
  symbol,
  price,
  previousPrice,
  onRefresh,
  isRefreshing,
  lastUpdated
}: CryptoPriceWidgetProps) {
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [autoUpdateCount, setAutoUpdateCount] = useState<number>(30); // Start with 30 seconds
  
  // Calculate price change percentage
  useEffect(() => {
    if (previousPrice && previousPrice > 0) {
      const changePct = ((price - previousPrice) / previousPrice) * 100;
      setPriceChange(changePct);
      
      // Flash effect for price changes
      if (price !== previousPrice) {
        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [price, previousPrice]);
  
  // Update counter for next auto-refresh
  useEffect(() => {
    if (isRefreshing) {
      return; // Don't start counting if we're already refreshing
    }
    
    const interval = setInterval(() => {
      setAutoUpdateCount(prev => {
        if (prev <= 0) {
          // Reset and trigger refresh when counter reaches 0
          clearInterval(interval);
          return 30; // Reset to 30 seconds
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRefreshing, lastUpdated]);
  
  // When counter reaches 0, trigger refresh
  useEffect(() => {
    if (autoUpdateCount === 0) {
      onRefresh();
      setAutoUpdateCount(30); // Reset to 30 seconds
    }
  }, [autoUpdateCount, onRefresh]);
  
  const isPriceUp = priceChange > 0;
  const isPriceDown = priceChange < 0;
  
  return (
    <div className="p-5 bg-gradient-to-b from-[hsl(var(--cwg-dark-blue))]/60 to-[hsl(var(--cwg-dark))]/80 rounded-lg border border-[hsl(var(--cwg-dark-blue))] shadow-lg overflow-hidden transition-all duration-300 relative">
      {/* Neon glow effect on the border when price changes */}
      <div className={`absolute inset-0 rounded-lg ${
        isFlashing 
          ? isPriceUp 
              ? 'shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
              : 'shadow-[0_0_15px_rgba(248,113,113,0.5)]' 
              : ''
      }`} />
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Token symbol and logo */}
        <div className="flex items-center md:col-span-2">
          <div className="flex items-center justify-center bg-[hsl(var(--cwg-dark-blue))] h-12 w-12 rounded-full mr-4 shadow-[0_0_10px_rgba(255,153,0,0.3)]">
            <DollarSign className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="text-lg font-orbitron text-[hsl(var(--cwg-orange))]">{symbol}</h2>
              <span className="ml-2 py-1 px-2 text-xs rounded-md bg-[hsl(var(--cwg-dark-blue))]/50 text-[hsl(var(--cwg-muted))]">USDT</span>
            </div>
            <a 
              href="https://coinmarketcap.com/currencies/boss-fighters/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--cwg-blue))] hover:text-[hsl(var(--cwg-orange))] transition-colors flex items-center"
            >
              Boss Fighters Token
              <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.6396 7.02527H12.0181V5.02527H19.0181V12.0253H17.0181V8.47527L12.1042 13.3892L10.6899 11.975L15.6396 7.02527Z" fill="currentColor"/>
                <path d="M5 5H10V7H7V17H17V14H19V19H5V5Z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Price display */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <div className="flex items-baseline">
            <span className={`font-orbitron text-2xl md:text-3xl tracking-tight transition-colors ${
              isFlashing 
                ? isPriceUp 
                    ? 'text-green-400' 
                    : isPriceDown 
                        ? 'text-red-400' 
                        : 'text-[hsl(var(--cwg-orange))]'
                : 'text-[hsl(var(--cwg-orange))]'
            }`}>
              ${price.toFixed(5)}
            </span>
            
            {priceChange !== 0 && (
              <span className={`ml-3 text-sm flex items-center rounded px-2 py-0.5 ${
                isPriceUp 
                  ? 'text-green-400 bg-green-500/10' 
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {isPriceUp ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(priceChange).toFixed(2)}%
              </span>
            )}
          </div>
          
          <div className="text-xs text-[hsl(var(--cwg-muted))] mt-1">
            {lastUpdated ? (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            ) : (
              <span>Waiting for data...</span>
            )}
          </div>
        </div>
        
        {/* Refresh button and countdown */}
        <div className="flex flex-col justify-center items-end">
          <Button 
            size="sm" 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className={`
              relative overflow-hidden transition-all 
              ${isRefreshing 
                ? 'bg-[hsl(var(--cwg-blue))]/20 text-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))]/30' 
                : 'bg-[hsl(var(--cwg-blue))] text-white hover:bg-[hsl(var(--cwg-blue))]/90'
              }
            `}
          >
            {isRefreshing ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" /> 
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" /> 
                Refresh Now
              </>
            )}
          </Button>
          
          {!isRefreshing && (
            <div className="mt-2 text-xs flex items-center text-[hsl(var(--cwg-muted))]">
              <div className="w-full bg-[hsl(var(--cwg-dark-blue))]/50 rounded-full h-1 mr-2">
                <div 
                  className="bg-[hsl(var(--cwg-blue))] h-1 rounded-full transition-all duration-1000" 
                  style={{ width: `${(autoUpdateCount / 30) * 100}%` }}
                />
              </div>
              Auto-update in {autoUpdateCount}s
            </div>
          )}
        </div>
      </div>
      
      {/* Background pulse effect for price changes */}
      {isFlashing && (
        <div 
          className={`absolute inset-0 rounded-lg animate-pulse ${
            isPriceUp 
              ? 'bg-green-400/5' 
              : isPriceDown 
                  ? 'bg-red-400/5' 
                  : 'bg-transparent'
          }`} 
        />
      )}
    </div>
  );
}
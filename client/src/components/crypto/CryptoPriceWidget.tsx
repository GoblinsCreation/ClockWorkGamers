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
  
  const isPriceUp = priceChange > 0;
  const isPriceDown = priceChange < 0;
  
  return (
    <div className="p-4 bg-[hsl(var(--cwg-dark-blue))]/40 rounded-lg border border-[hsl(var(--cwg-dark-blue))] shadow-lg mb-4 transition-all duration-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-[hsl(var(--cwg-dark-blue))] h-10 w-10 rounded-full mr-3">
            <DollarSign className="h-5 w-5 text-[hsl(var(--cwg-orange))]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--cwg-muted))]">{symbol}/USDT</h3>
            <div className="flex items-center">
              <span className={`font-orbitron text-xl transition-colors ${
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
                <span className={`ml-2 text-xs flex items-center ${
                  isPriceUp ? 'text-green-400' : isPriceDown ? 'text-red-400' : 'text-[hsl(var(--cwg-muted))]'
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
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="text-xs border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))]/10 mb-1"
          >
            {isRefreshing ? (
              <>
                <RotateCw className="h-3 w-3 mr-1 animate-spin" /> 
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" /> 
                Refresh
              </>
            )}
          </Button>
          
          <div className="text-xs text-[hsl(var(--cwg-muted))]">
            {lastUpdated ? (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            ) : (
              <span>No data yet</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Background pulse effect for price changes */}
      {isFlashing && (
        <div 
          className={`absolute inset-0 rounded-lg animate-pulse ${
            isPriceUp 
              ? 'bg-green-400/10' 
              : isPriceDown 
                  ? 'bg-red-400/10' 
                  : 'bg-transparent'
          }`} 
        />
      )}
    </div>
  );
}
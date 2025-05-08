import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  Coins, 
  BadgePercent, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  DollarSign, 
  HelpCircle,
  Diamond,
  RotateCw
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { getCachedBFTokenPrice } from "@/lib/cryptoPrice";
import CryptoPriceWidget from "@/components/crypto/CryptoPriceWidget";
import ProfitProjectionSlider from "@/components/calculators/ProfitProjectionSlider";

// Rarity types
type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Exalted";

// Constants for badge calculations based on actual market values
const BADGE_RECHARGE_COSTS = {
  "Common": { flex: 0, sponsor: 0, rechargeDuration: 2 }, // No data provided yet
  "Uncommon": { flex: 124, sponsor: 6, rechargeDuration: 3 },
  "Rare": { flex: 255, sponsor: 12, rechargeDuration: 4 },
  "Epic": { flex: 768, sponsor: 36, rechargeDuration: 5 },
  "Legendary": { flex: 2316, sponsor: 108, rechargeDuration: 6 },
  "Mythic": { flex: 0, sponsor: 0, rechargeDuration: 8 }, // No data provided yet
  "Exalted": { flex: 0, sponsor: 0, rechargeDuration: 10 } // No data for this tier
};

const BADGE_CRAFT_COSTS = {
  "Common": { flex: 1347, sponsor: 0, requiredBadges: [], craftTime: 36 },
  "Uncommon": { flex: 475, sponsor: 113, requiredBadges: ["Common", "Common"], craftTime: 60 },
  "Rare": { flex: 1403, sponsor: 226, requiredBadges: ["Uncommon", "Uncommon"], craftTime: 84 },
  "Epic": { flex: 5809, sponsor: 665, requiredBadges: ["Rare", "Rare", "Rare"], craftTime: 108 },
  "Legendary": { flex: 23025, sponsor: 1900, requiredBadges: ["Epic", "Epic", "Epic"], craftTime: 132 },
  "Mythic": { flex: 88538, sponsor: 5511, requiredBadges: ["Legendary", "Legendary", "Legendary"], craftTime: 156 },
  "Exalted": { flex: 0, sponsor: 0, requiredBadges: ["Mythic", "Mythic", "Mythic"], craftTime: 180 } // No data for this tier
};

export default function BossFightersCalculator() {
  // Market prices state (can be updated in real-time)
  const [marketPrices, setMarketPrices] = useState({
    bfToken: 0.02619, // Default value from CoinMarketCap (May 8th, 2023)
    sponsorMark: 0.067, // $6.70 per 100 sponsor marks (based on OpenLoot marketplace)
    flex: 0.00740 // $0.00740 per 1 Flex
  });
  
  // Store previous price for comparison
  const [previousBFTokenPrice, setPreviousBFTokenPrice] = useState<number | undefined>(undefined);
  
  // Price update state
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  
  // Earnings Calculator State
  const [bfTokensEarned, setBfTokensEarned] = useState<number>(154.05);
  const [minutesPlayed, setMinutesPlayed] = useState<number>(10);
  const [badgeRarities, setBadgeRarities] = useState<Rarity[]>(["Rare", "Rare", "Rare", "Rare", "Rare"]);
  const [badgeCount, setBadgeCount] = useState<number>(5);
  const [earningsResults, setEarningsResults] = useState<any | null>(null);
  
  // Crafting Calculator State
  const [targetRarity, setTargetRarity] = useState<Rarity>("Legendary");
  const [startRarity, setStartRarity] = useState<Rarity | "None">("None");
  const [showRunnerContracts, setShowRunnerContracts] = useState<number>(1);
  const [craftingResults, setCraftingResults] = useState<any | null>(null);
  
  // Fetch price from MEXC exchange
  const updateBFTokenPrice = async () => {
    setIsUpdatingPrice(true);
    try {
      // Get current price before updating
      const currentPrice = marketPrices.bfToken;
      
      // Fetch new price
      const newPrice = await getCachedBFTokenPrice();
      
      // Only update previous price if we have a real new price
      if (newPrice && newPrice !== currentPrice) {
        setPreviousBFTokenPrice(currentPrice);
      }
      
      // Update market prices with new BFToken price
      setMarketPrices(prev => ({
        ...prev,
        bfToken: newPrice || prev.bfToken // Fall back to previous price if fetch fails
      }));
      
      // Record update time
      setLastPriceUpdate(new Date());
      
      // Recalculate with new price
      calculateEarnings();
      calculateCrafting();
      
      console.log(`BFToken price updated: ${currentPrice} → ${newPrice}`);
    } catch (error) {
      console.error("Failed to update BFToken price:", error);
    } finally {
      setIsUpdatingPrice(false);
    }
  };
  
  // Calculate earnings
  const calculateEarnings = () => {
    // Calculate tokens per minute and per hour exactly as in the example
    // 154.05 BFToken for 10 mins → 924.3 BFTokens per hour
    const tokensPerMinute = bfTokensEarned / minutesPlayed;
    const tokensPerHour = tokensPerMinute * 60;
    
    // Calculate USD value using token price
    // 924.3 * $0.02619 = $24.21 (updated with current CoinMarketCap price)
    const usdPerHour = tokensPerHour * marketPrices.bfToken;
    
    // Calculate recharge costs for the badge(s)
    let missingData = false;
    
    // Use only the number of badges specified by badgeCount
    const activeBadges = badgeRarities.slice(0, badgeCount);
    
    // Get counts by badge type
    const badgeCounts = activeBadges.reduce((counts, rarity) => {
      counts[rarity] = (counts[rarity] || 0) + 1;
      return counts;
    }, {} as Record<Rarity, number>);
    
    // Calculate total recharge costs
    let totalFlex = 0;
    let totalSponsor = 0;
    
    // Calculate costs for each badge type
    Object.entries(badgeCounts).forEach(([rarity, count]) => {
      const typedRarity = rarity as Rarity;
      const rechargeInfo = BADGE_RECHARGE_COSTS[typedRarity];
      
      // Check if we have recharge data for this rarity
      if (rechargeInfo.flex === 0 && rechargeInfo.sponsor === 0) {
        missingData = true;
      }
      
      // Multiply by count to get total resources needed
      totalFlex += rechargeInfo.flex * count;
      totalSponsor += rechargeInfo.sponsor * count;
    });
    
    // Force fixed hours for recharge calculations
    const fixedDuration = 1; // 1 hour for all calculations as per example
    
    // Create recharge cost object
    const rechargeCost = {
      flex: totalFlex,
      sponsor: totalSponsor,
      duration: fixedDuration
    };
    
    // Calculate recharge cost in USD exactly as in your example
    // Flex: 255 * 5 * $0.0074 = $9.435
    // Sponsor Marks: 12 * 5 * $0.067 = $4.02
    // Total: $9.435 + $4.02 = $13.455
    const flexCostUsd = rechargeCost.flex * marketPrices.flex;
    const sponsorCostUsd = rechargeCost.sponsor * marketPrices.sponsorMark;
    const rechargeCostUsd = flexCostUsd + sponsorCostUsd;
    
    // Calculate hourly profit directly (income - costs)
    // $24.21 - $13.455 = $10.76 (updated with current CoinMarketCap price)
    const hourlyProfit = usdPerHour - rechargeCostUsd;
    
    // Calculate weekly profit (3 hours of play per day * 7 days)
    // $10.76 * 3 * 7 = $226.00 (updated with current CoinMarketCap price)
    const weeklyProfit = hourlyProfit * 3 * 7;
    
    // Calculate monthly profit (3 hours per day * 30 days)
    // $10.76 * 3 * 30 = $968.55 (updated with current CoinMarketCap price)
    const monthlyProfit = hourlyProfit * 3 * 30;
    
    // Calculate return on investment (ROI)
    const roi = rechargeCostUsd > 0 ? ((hourlyProfit * rechargeCost.duration) / rechargeCostUsd) * 100 : 0;
    
    setEarningsResults({
      tokensPerMinute,
      tokensPerHour,
      usdPerHour,
      rechargeCost,
      rechargeCostUsd,
      hourlyProfit,
      weeklyProfit,
      monthlyProfit,
      roi,
      missingData
    });
  };
  
  // Calculate crafting costs
  const calculateCrafting = () => {
    if (targetRarity === startRarity) {
      return setCraftingResults({
        error: "Start and target rarities are the same"
      });
    }
    
    const rarityLevels: Rarity[] = [
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
      "Mythic",
      "Exalted"
    ];
    
    const startIndex = startRarity === "None" ? -1 : rarityLevels.indexOf(startRarity as Rarity);
    const targetIndex = rarityLevels.indexOf(targetRarity);
    
    if (startIndex >= targetIndex) {
      return setCraftingResults({
        error: "Target rarity must be higher than start rarity"
      });
    }
    
    // Check if target rarity has data
    if (targetRarity === "Exalted" && BADGE_CRAFT_COSTS[targetRarity].flex === 0) {
      return setCraftingResults({
        error: "Data for Exalted badges is not available yet"
      });
    }
    
    // Initialize counters
    let totalFlex = 0;
    let totalSponsor = 0;
    let totalCraftTime = 0;
    let missingData = false;
    let requiredBadges: Record<Rarity, number> = {
      "Common": 0,
      "Uncommon": 0,
      "Rare": 0,
      "Epic": 0,
      "Legendary": 0,
      "Mythic": 0,
      "Exalted": 0
    };
    
    // Calculate required badges of each rarity
    const calculateRequiredBadges = (rarity: Rarity, count: number) => {
      requiredBadges[rarity] += count;
      
      // If this isn't the starting rarity, we need to craft these badges
      if (rarityLevels.indexOf(rarity) > startIndex) {
        const craftInfo = BADGE_CRAFT_COSTS[rarity];
        
        // Check if data is missing
        if (craftInfo.flex === 0 && craftInfo.sponsor === 0) {
          missingData = true;
        }
        
        // Add direct costs for this badge
        totalFlex += craftInfo.flex * count;
        totalSponsor += craftInfo.sponsor * count;
        totalCraftTime += craftInfo.craftTime * count;
        
        // Calculate required lower tier badges
        craftInfo.requiredBadges.forEach(lowerRarity => {
          calculateRequiredBadges(lowerRarity as Rarity, count);
        });
      }
    };
    
    // Start calculation with 1 target badge
    calculateRequiredBadges(targetRarity, 1);
    
    // Calculate total USD cost
    const totalFlexCost = totalFlex * marketPrices.flex;
    const totalSponsorCost = totalSponsor * marketPrices.sponsorMark;
    const totalUsdCost = totalFlexCost + totalSponsorCost;
    
    // Calculate time with showrunner contracts
    const adjustedCraftTime = totalCraftTime / showRunnerContracts;
    
    // Format days, hours
    const craftTimeDays = Math.floor(adjustedCraftTime / 24);
    const craftTimeHours = adjustedCraftTime % 24;
    
    setCraftingResults({
      requiredBadges,
      totalFlex,
      totalSponsor,
      totalFlexCost,
      totalSponsorCost,
      totalUsdCost,
      missingData,
      craftTime: {
        total: totalCraftTime,
        adjusted: adjustedCraftTime,
        days: craftTimeDays,
        hours: craftTimeHours
      }
    });
  };
  
  // Load the live price data and run initial calculations
  useEffect(() => {
    // Fetch the live BFToken price on component mount
    updateBFTokenPrice();
    
    // Set up an interval to update the price every 30 seconds
    const intervalId = setInterval(() => {
      updateBFTokenPrice();
    }, 30 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Update calculations when relevant parameters change
  useEffect(() => {
    calculateEarnings();
    calculateCrafting();
  }, [bfTokensEarned, minutesPlayed, badgeRarities, badgeCount, marketPrices]);
  
  return (
    <div className="space-y-8">
      {/* Live Price Widget - CoinMarketCap */}
      <div className="relative">
        <div className="absolute top-2 right-2 text-xs opacity-70 bg-[hsl(var(--cwg-dark-blue))]/50 px-2 py-1 rounded flex items-center">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#17181B"/>
            <path d="M11.0908 9.0513L8.1841 7.0185C8.0382 6.9226 7.8416 7.0264 7.8416 7.2001V11.2719C7.8416 11.4468 8.0406 11.5502 8.1865 11.4519L11.0932 9.3904C11.2123 9.311 11.2111 9.1319 11.0908 9.0513Z" fill="#16C784"/>
            <path d="M15.8159 7.0185L12.9092 9.0513C12.7889 9.1319 12.7877 9.311 12.9068 9.3904L15.8135 11.4519C15.9594 11.5502 16.1584 11.4468 16.1584 11.2719V7.2001C16.1584 7.0264 15.9618 6.9226 15.8159 7.0185Z" fill="#16C784"/>
            <path d="M15.8159 12.5481L12.9092 14.5809C12.7889 14.6615 12.7877 14.8406 12.9068 14.92L15.8135 16.9815C15.9594 17.0798 16.1584 16.9764 16.1584 16.8015V12.7297C16.1584 12.556 15.9618 12.4522 15.8159 12.5481Z" fill="#16C784"/>
            <path d="M11.0908 14.5809L8.1841 12.5481C8.0382 12.4522 7.8416 12.556 7.8416 12.7297V16.8015C7.8416 16.9764 8.0406 17.0798 8.1865 16.9815L11.0932 14.92C11.2123 14.8406 11.2111 14.6615 11.0908 14.5809Z" fill="#16C784"/>
          </svg>
          CoinMarketCap
        </div>
        <CryptoPriceWidget 
          symbol="BFToken"
          price={marketPrices.bfToken}
          previousPrice={previousBFTokenPrice}
          onRefresh={updateBFTokenPrice}
          isRefreshing={isUpdatingPrice}
          lastUpdated={lastPriceUpdate}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Calculator */}
        <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/30">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-[hsl(var(--cwg-orange))] flex items-center">
              <Calculator className="mr-3 h-6 w-6" /> Earnings Calculator
            </CardTitle>
            <CardDescription>
              Calculate your potential earnings based on gameplay data
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-[hsl(var(--cwg-muted))]">BFTokens Earned</Label>
                  <span className="text-[hsl(var(--cwg-orange))]">{bfTokensEarned} BFT</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Coins className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                  <Slider
                    value={[bfTokensEarned]}
                    onValueChange={(value) => setBfTokensEarned(value[0])}
                    min={100}
                    max={10000}
                    step={100}
                  />
                  <Input
                    type="number"
                    value={bfTokensEarned}
                    onChange={(e) => setBfTokensEarned(Number(e.target.value))}
                    className="w-20 bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-[hsl(var(--cwg-muted))]">Minutes Played</Label>
                  <span className="text-[hsl(var(--cwg-text))]">{minutesPlayed} min</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                  <Slider
                    value={[minutesPlayed]}
                    onValueChange={(value) => setMinutesPlayed(value[0])}
                    min={10}
                    max={240}
                    step={5}
                  />
                  <Input
                    type="number"
                    value={minutesPlayed}
                    onChange={(e) => setMinutesPlayed(Number(e.target.value))}
                    className="w-20 bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]"
                  />
                </div>
              </div>
              
              {/* Badge Rarities - one selector per possible badge */}
              <div className="space-y-4">
                <Label className="text-[hsl(var(--cwg-muted))] font-semibold">Badge Rarities</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className={`space-y-1 ${index >= badgeCount ? 'opacity-50' : ''}`}>
                      <Label className="text-xs text-[hsl(var(--cwg-muted))]">Badge {index + 1}</Label>
                      <Select 
                        value={badgeRarities[index]} 
                        onValueChange={(value) => {
                          const newRarities = [...badgeRarities];
                          newRarities[index] = value as Rarity;
                          setBadgeRarities(newRarities);
                        }}
                        disabled={index >= badgeCount}
                      >
                        <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] h-8 text-sm">
                          <SelectValue placeholder="Select rarity" />
                        </SelectTrigger>
                        <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                          <SelectItem value="Common">Common</SelectItem>
                          <SelectItem value="Uncommon">Uncommon</SelectItem>
                          <SelectItem value="Rare">Rare</SelectItem>
                          <SelectItem value="Epic">Epic</SelectItem>
                          <SelectItem value="Legendary">Legendary</SelectItem>
                          <SelectItem value="Mythic">Mythic</SelectItem>
                          <SelectItem value="Exalted">Exalted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-[hsl(var(--cwg-muted))]">Number of Badges</Label>
                  <span className="text-[hsl(var(--cwg-text))]">{badgeCount}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <BadgePercent className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                  <Slider
                    value={[badgeCount]}
                    onValueChange={(value) => setBadgeCount(value[0])}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <Input
                    type="number"
                    value={badgeCount}
                    onChange={(e) => setBadgeCount(Number(e.target.value))}
                    className="w-20 bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]"
                  />
                </div>
              </div>
              
              <Button 
                onClick={calculateEarnings}
                className="w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Calculate Earnings
              </Button>
            </div>
            
            {earningsResults && (
              <div className="mt-6 p-4 bg-[hsl(var(--cwg-dark))] rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <h3 className="text-[hsl(var(--cwg-blue))] font-orbitron mb-4">Earnings Summary</h3>
                
                {earningsResults.missingData && (
                  <div className="mb-4 p-3 bg-[hsl(var(--cwg-dark-blue))]/30 rounded border border-amber-500/30 flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[hsl(var(--cwg-muted))]">
                      Some selected badge rarities do not have complete recharge data yet. 
                      Results may not be accurate for Common, Mythic or Exalted badges.
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--cwg-muted))]">Tokens per hour:</span>
                    <span className="text-[hsl(var(--cwg-text))]">{earningsResults.tokensPerHour.toFixed(2)} BFT</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--cwg-muted))]">USD per hour (before costs):</span>
                    <span className="text-[hsl(var(--cwg-text))]">${earningsResults.usdPerHour.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--cwg-muted))]">Recharge cost:</span>
                    <span className="text-[hsl(var(--cwg-text))]">${earningsResults.rechargeCostUsd.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-[hsl(var(--cwg-dark-blue))] pt-2 mt-2">
                    <span className="text-[hsl(var(--cwg-muted))]">Net profit per hour:</span>
                    <span className={earningsResults.hourlyProfit >= 0 ? "text-green-400" : "text-red-400"}>
                      ${earningsResults.hourlyProfit.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--cwg-muted))]">Weekly profit (3h/day):</span>
                    <span className={earningsResults.weeklyProfit >= 0 ? "text-green-400" : "text-red-400"}>
                      ${earningsResults.weeklyProfit.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--cwg-muted))]">Monthly profit (3h/day):</span>
                    <span className={earningsResults.monthlyProfit >= 0 ? "text-green-400" : "text-red-400"}>
                      ${earningsResults.monthlyProfit.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--cwg-muted))]">ROI:</span>
                    <span className={earningsResults.roi >= 0 ? "text-green-400" : "text-red-400"}>
                      {earningsResults.roi.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-[hsl(var(--cwg-dark-blue))] text-xs text-[hsl(var(--cwg-muted))]">
                    <div className="flex items-start mb-2">
                      <DollarSign className="h-4 w-4 text-[hsl(var(--cwg-blue))] mr-2 mt-0.5" />
                      <span>
                        Current market prices:<br/>
                        BFToken: ${marketPrices.bfToken.toFixed(5)}<br/>
                        Sponsor Marks: ${marketPrices.sponsorMark.toFixed(5)}<br/>
                        Flex: ${marketPrices.flex.toFixed(5)}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-[hsl(var(--cwg-muted))]">
                        {lastPriceUpdate ? (
                          <span>Last updated: {lastPriceUpdate.toLocaleTimeString()}</span>
                        ) : (
                          <span>Using default prices</span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={updateBFTokenPrice} 
                        disabled={isUpdatingPrice}
                        className="text-xs border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))]/10"
                      >
                        {isUpdatingPrice ? (
                          <>
                            <RotateCw className="h-3 w-3 mr-1 animate-spin" /> 
                            Updating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" /> 
                            Update Price
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Add profit projection slider */}
                {earningsResults && earningsResults.hourlyProfit > 0 && (
                  <div className="mt-4">
                    <ProfitProjectionSlider 
                      hourlyProfit={earningsResults.hourlyProfit} 
                      maxHours={16}
                      defaultHours={3}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Badge Crafting Calculator */}
        <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/30">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-[hsl(var(--cwg-orange))] flex items-center">
              <Diamond className="mr-3 h-6 w-6" /> Badge Crafting Calculator
            </CardTitle>
            <CardDescription>
              Calculate resources needed to craft higher tier badges
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--cwg-muted))]">Target Badge Rarity</Label>
                <Select 
                  value={targetRarity} 
                  onValueChange={(value) => setTargetRarity(value as Rarity)}
                >
                  <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                    <SelectValue placeholder="Select target rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Uncommon">Uncommon</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Legendary">Legendary</SelectItem>
                    <SelectItem value="Mythic">Mythic</SelectItem>
                    <SelectItem value="Exalted">Exalted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[hsl(var(--cwg-muted))]">Starting Badge Rarity</Label>
                <Select 
                  value={startRarity} 
                  onValueChange={(value) => setStartRarity(value as Rarity | "None")}
                >
                  <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                    <SelectValue placeholder="Select starting rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                    <SelectItem value="None">None (Craft from scratch)</SelectItem>
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Uncommon">Uncommon</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Legendary">Legendary</SelectItem>
                    <SelectItem value="Mythic">Mythic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-[hsl(var(--cwg-muted))]">Showrunner Contracts</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                        <p>Showrunner contracts reduce crafting time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                  <Slider
                    value={[showRunnerContracts]}
                    onValueChange={(value) => setShowRunnerContracts(value[0])}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <Input
                    type="number"
                    value={showRunnerContracts}
                    onChange={(e) => setShowRunnerContracts(Number(e.target.value))}
                    className="w-20 bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]"
                  />
                </div>
              </div>
              
              <Button 
                onClick={calculateCrafting}
                className="w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Calculate Resources
              </Button>
            </div>
            
            {craftingResults && (
              <div className="mt-6 p-4 bg-[hsl(var(--cwg-dark))] rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                {craftingResults.error ? (
                  <div className="flex items-center text-red-400">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>{craftingResults.error}</span>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[hsl(var(--cwg-blue))] font-orbitron mb-4">Crafting Summary</h3>
                    
                    {craftingResults.missingData && (
                      <div className="mb-4 p-3 bg-[hsl(var(--cwg-dark-blue))]/30 rounded border border-amber-500/30 flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-[hsl(var(--cwg-muted))]">
                          Some badge rarities in this calculation may have incomplete data.
                          Results may not accurately reflect the full resource requirements.
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--cwg-muted))]">Total Flex needed:</span>
                          <span className="text-[hsl(var(--cwg-text))]">{craftingResults.totalFlex.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--cwg-muted))]">Total Sponsor Marks needed:</span>
                          <span className="text-[hsl(var(--cwg-text))]">{craftingResults.totalSponsor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-[hsl(var(--cwg-dark-blue))] pt-2 mt-2">
                          <span className="text-[hsl(var(--cwg-muted))]">Estimated total cost:</span>
                          <span className="text-[hsl(var(--cwg-orange))]">${craftingResults.totalUsdCost.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between mb-2">
                          <span className="text-[hsl(var(--cwg-muted))]">Crafting time:</span>
                          <span className="text-[hsl(var(--cwg-text))]">
                            {craftingResults.craftTime.days} days, {craftingResults.craftTime.hours.toFixed(1)} hours
                          </span>
                        </div>
                        <Progress value={(showRunnerContracts / 5) * 100} className="h-2 bg-[hsl(var(--cwg-dark-blue))]" />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-[hsl(var(--cwg-muted))]">1 contract</span>
                          <span className="text-xs text-[hsl(var(--cwg-muted))]">5 contracts</span>
                        </div>
                      </div>
                      
                      <div className="pt-3">
                        <h4 className="text-[hsl(var(--cwg-text))] font-orbitron text-sm mb-2">Required Badges by Rarity</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {craftingResults && craftingResults.requiredBadges && Object.entries(craftingResults.requiredBadges)
                            .filter(([_, count]) => (count as number) > 0)
                            .map(([rarity, count]) => (
                              <div key={rarity} className="flex justify-between">
                                <span className="text-[hsl(var(--cwg-muted))]">{rarity}:</span>
                                <span className="text-[hsl(var(--cwg-text))]">{String(count)}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Game Information */}
      <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/30">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-blue))] flex items-center">
            <HelpCircle className="mr-3 h-5 w-5" /> Game Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-[hsl(var(--cwg-muted))]">
              Boss Fighters is a skill-based action RPG where players earn tokens by defeating boss monsters 
              and completing in-game challenges. Use these calculators to optimize your gameplay strategy.
            </p>
            
            <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
              <h4 className="text-sm font-orbitron text-[hsl(var(--cwg-text))] mb-2">Badge Mechanics</h4>
              <p className="text-xs text-[hsl(var(--cwg-muted))]">
                Badges provide passive bonuses to damage, rewards, and other stats. Higher rarity badges 
                provide stronger bonuses but require more resources to recharge. Balance recharge costs 
                against earnings for optimal results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <h4 className="text-sm font-orbitron text-[hsl(var(--cwg-orange))] mb-2">Recharge Strategy</h4>
                <p className="text-xs text-[hsl(var(--cwg-muted))]">
                  Focus on badges that provide the best ROI based on your playstyle. 
                  For casual players, lower rarity badges may offer better value.
                </p>
              </div>
              
              <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <h4 className="text-sm font-orbitron text-[hsl(var(--cwg-blue))] mb-2">Crafting Tips</h4>
                <p className="text-xs text-[hsl(var(--cwg-muted))]">
                  Use Show Runner contracts to accelerate badge crafting. Consider the time and resource 
                  investment when upgrading to higher rarity badges.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

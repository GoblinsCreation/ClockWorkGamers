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
  Diamond
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Rarity types
type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Exalted";

// Constants for badge calculations
const BADGE_RECHARGE_COSTS = {
  "Common": { flex: 350, sponsor: 20, rechargeDuration: 2 },
  "Uncommon": { flex: 500, sponsor: 30, rechargeDuration: 3 },
  "Rare": { flex: 950, sponsor: 55, rechargeDuration: 4 },
  "Epic": { flex: 2400, sponsor: 150, rechargeDuration: 5 },
  "Legendary": { flex: 6000, sponsor: 380, rechargeDuration: 6 },
  "Mythic": { flex: 18000, sponsor: 1100, rechargeDuration: 8 },
  "Exalted": { flex: 60000, sponsor: 3200, rechargeDuration: 10 }
};

const BADGE_CRAFT_COSTS = {
  "Common": { flex: 1000, sponsor: 0, requiredBadges: [], craftTime: 36 },
  "Uncommon": { flex: 250, sponsor: 350, requiredBadges: ["Common", "Common"], craftTime: 60 },
  "Rare": { flex: 1000, sponsor: 700, requiredBadges: ["Uncommon", "Uncommon"], craftTime: 84 },
  "Epic": { flex: 4800, sponsor: 2000, requiredBadges: ["Rare", "Rare", "Rare"], craftTime: 108 },
  "Legendary": { flex: 19000, sponsor: 6000, requiredBadges: ["Epic", "Epic", "Epic"], craftTime: 132 },
  "Mythic": { flex: 75000, sponsor: 18000, requiredBadges: ["Legendary", "Legendary", "Legendary"], craftTime: 156 },
  "Exalted": { flex: 290000, sponsor: 55000, requiredBadges: ["Mythic", "Mythic", "Mythic"], craftTime: 180 }
};

// Current market prices
const MARKET_PRICES = {
  bfToken: 0.0159, // $15.90 per 1000 tokens
  sponsorMark: 0.0364, // $3.64 per 100 sponsor marks
  flex: 0.0074261102034754 // $500 per 67330 flex
};

export default function BossFightersCalculator() {
  // Earnings Calculator State
  const [bfTokensEarned, setBfTokensEarned] = useState<number>(1000);
  const [minutesPlayed, setMinutesPlayed] = useState<number>(60);
  const [badgeRarities, setBadgeRarities] = useState<Rarity[]>(["Epic", "Epic", "Epic", "Epic", "Epic"]);
  const [badgeCount, setBadgeCount] = useState<number>(1);
  const [earningsResults, setEarningsResults] = useState<any | null>(null);
  
  // Crafting Calculator State
  const [targetRarity, setTargetRarity] = useState<Rarity>("Legendary");
  const [startRarity, setStartRarity] = useState<Rarity | "None">("None");
  const [showRunnerContracts, setShowRunnerContracts] = useState<number>(1);
  const [craftingResults, setCraftingResults] = useState<any | null>(null);
  
  // Calculate earnings
  const calculateEarnings = () => {
    // Calculate tokens per minute
    const tokensPerMinute = bfTokensEarned / minutesPlayed;
    
    // Calculate tokens per hour
    const tokensPerHour = tokensPerMinute * 60;
    
    // Calculate USD value
    const usdPerHour = tokensPerHour * MARKET_PRICES.bfToken;
    
    // Calculate recharge costs for the badge(s) using the active badges based on badgeCount
    let totalFlex = 0;
    let totalSponsor = 0;
    let avgDuration = 0;
    
    // Use only the number of badges specified by badgeCount
    const activeBadges = badgeRarities.slice(0, badgeCount);
    
    // Calculate costs for each active badge
    for (let i = 0; i < activeBadges.length; i++) {
      const rarity = activeBadges[i];
      totalFlex += BADGE_RECHARGE_COSTS[rarity].flex;
      totalSponsor += BADGE_RECHARGE_COSTS[rarity].sponsor;
      avgDuration += BADGE_RECHARGE_COSTS[rarity].rechargeDuration;
    }
    
    // Get average duration for multiple badges
    avgDuration = avgDuration / activeBadges.length;
    
    const rechargeCost = {
      flex: totalFlex,
      sponsor: totalSponsor,
      duration: avgDuration
    };
    
    // Calculate recharge cost in USD
    const rechargeCostUsd = 
      (rechargeCost.flex * MARKET_PRICES.flex) + 
      (rechargeCost.sponsor * MARKET_PRICES.sponsorMark);
    
    // Calculate profit per recharge duration
    const profitPerRecharge = (usdPerHour * rechargeCost.duration) - rechargeCostUsd;
    
    // Calculate hourly profit
    const hourlyProfit = profitPerRecharge / rechargeCost.duration;
    
    // Calculate weekly profit (assuming 3 hours of play per day)
    const weeklyProfit = hourlyProfit * 3 * 7;
    
    // Calculate monthly profit (assuming 3 hours per day, 30 days)
    const monthlyProfit = hourlyProfit * 3 * 30;
    
    // Calculate return on investment (ROI)
    const roi = (profitPerRecharge / rechargeCostUsd) * 100;
    
    setEarningsResults({
      tokensPerMinute,
      tokensPerHour,
      usdPerHour,
      rechargeCost,
      rechargeCostUsd,
      profitPerRecharge,
      hourlyProfit,
      weeklyProfit,
      monthlyProfit,
      roi
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
    
    // Initialize counters
    let totalFlex = 0;
    let totalSponsor = 0;
    let totalCraftTime = 0;
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
    const totalFlexCost = totalFlex * MARKET_PRICES.flex;
    const totalSponsorCost = totalSponsor * MARKET_PRICES.sponsorMark;
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
      craftTime: {
        total: totalCraftTime,
        adjusted: adjustedCraftTime,
        days: craftTimeDays,
        hours: craftTimeHours
      }
    });
  };
  
  useEffect(() => {
    // Run initial calculations
    calculateEarnings();
    calculateCrafting();
  }, []);
  
  return (
    <div className="space-y-8">
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
                </div>
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

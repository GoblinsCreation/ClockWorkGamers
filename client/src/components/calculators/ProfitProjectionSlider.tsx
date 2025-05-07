import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, DollarSign, TrendingUp } from "lucide-react";

interface ProfitProjectionSliderProps {
  hourlyProfit: number;
  maxHours?: number;
  defaultHours?: number;
}

export default function ProfitProjectionSlider({
  hourlyProfit,
  maxHours = 24,
  defaultHours = 3,
}: ProfitProjectionSliderProps) {
  const [hoursPerDay, setHoursPerDay] = useState<number>(defaultHours);
  const [profit, setProfit] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });
  
  useEffect(() => {
    const dailyProfit = hourlyProfit * hoursPerDay;
    const weeklyProfit = dailyProfit * 7;
    const monthlyProfit = dailyProfit * 30;
    const yearlyProfit = dailyProfit * 365;
    
    setProfit({
      daily: dailyProfit,
      weekly: weeklyProfit,
      monthly: monthlyProfit,
      yearly: yearlyProfit,
    });
  }, [hourlyProfit, hoursPerDay]);
  
  // Generate a color based on the profit amount (green for high, amber for medium, red for negative)
  const getProfitColor = (amount: number) => {
    if (amount <= 0) return "text-red-400";
    if (amount > 500) return "text-green-400";
    return "text-amber-400";
  };
  
  return (
    <div className="space-y-4 p-4 bg-[hsl(var(--cwg-dark-blue))]/30 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
      <h3 className="text-[hsl(var(--cwg-blue))] font-orbitron mb-2 flex items-center">
        <TrendingUp className="mr-2 h-5 w-5" />
        Profit Projections
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-[hsl(var(--cwg-muted))]">
            Hours played per day
          </Label>
          <span className="text-[hsl(var(--cwg-orange))] font-medium">
            {hoursPerDay} {hoursPerDay === 1 ? "hour" : "hours"}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Clock className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
          <Slider
            value={[hoursPerDay]}
            onValueChange={(value) => setHoursPerDay(value[0])}
            min={1}
            max={maxHours}
            step={1}
            className="flex-1"
          />
        </div>
        
        <div className="pt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-[hsl(var(--cwg-dark-blue))]/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-[hsl(var(--cwg-blue))] mr-2" />
              <span className="text-[hsl(var(--cwg-muted))] text-sm">Daily</span>
            </div>
            <span className={`font-semibold ${getProfitColor(profit.daily)}`}>
              ${profit.daily.toFixed(2)}
            </span>
          </div>
          
          <div className="p-3 bg-[hsl(var(--cwg-dark-blue))]/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-[hsl(var(--cwg-blue))] mr-2" />
              <span className="text-[hsl(var(--cwg-muted))] text-sm">Weekly</span>
            </div>
            <span className={`font-semibold ${getProfitColor(profit.weekly)}`}>
              ${profit.weekly.toFixed(2)}
            </span>
          </div>
          
          <div className="p-3 bg-[hsl(var(--cwg-dark-blue))]/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-[hsl(var(--cwg-blue))] mr-2" />
              <span className="text-[hsl(var(--cwg-muted))] text-sm">Monthly</span>
            </div>
            <span className={`font-semibold ${getProfitColor(profit.monthly)}`}>
              ${profit.monthly.toFixed(2)}
            </span>
          </div>
          
          <div className="p-3 bg-[hsl(var(--cwg-dark-blue))]/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-[hsl(var(--cwg-blue))] mr-2" />
              <span className="text-[hsl(var(--cwg-muted))] text-sm">Yearly</span>
            </div>
            <span className={`font-semibold ${getProfitColor(profit.yearly)}`}>
              ${profit.yearly.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
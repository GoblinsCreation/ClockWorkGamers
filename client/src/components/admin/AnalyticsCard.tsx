import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  iconBgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export function AnalyticsCard({
  title,
  value,
  icon,
  change = 0,
  changeLabel = 'from last period',
  iconBgColor = 'bg-blue-500/20',
  iconColor = 'text-blue-500',
  isLoading = false
}: AnalyticsCardProps) {
  const getTrendIcon = () => {
    if (isLoading) return <div className="h-4 w-4 animate-pulse bg-muted rounded" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (isLoading) return <div className="h-4 w-10 animate-pulse bg-muted rounded" />;
    if (change === 0) return <span className="text-muted-foreground text-sm">No change</span>;
    return (
      <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change > 0 ? '+' : ''}{change}%
      </span>
    );
  };

  return (
    <Card className="card-gradient border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[hsl(var(--cwg-muted))] text-sm">{title}</p>
            <CardTitle className="text-2xl font-semibold mt-1">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse bg-muted rounded" />
              ) : (
                value
              )}
            </CardTitle>
          </div>
          <div className={`p-3 rounded-full ${iconBgColor}`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {getTrendText()}
          <span className="text-[hsl(var(--cwg-muted))] text-xs ml-1">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
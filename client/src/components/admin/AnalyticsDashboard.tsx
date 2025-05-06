import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsCard } from './AnalyticsCard';
import { AnalyticsChart } from './AnalyticsChart';
import {
  Users,
  Activity,
  DollarSign,
  Calendar,
  BarChart2,
  TrendingUp,
  Globe,
  Clock,
  Wallet,
  Star,
  List,
  Zap,
  Ticket,
  Gift,
  Package,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, subDays, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  userGrowth: any[];
  streamViewership: any[];
  rentalRevenue: any[];
  tokenDistribution: any[];
  gameDistribution: any[];
  streamActivity: any[];
  streamersPerformance: any[];
  guildAchievements: any[];
  referralsSummary: any[];
  userEngagement: any[];
  tokenEconomy: any[];
  nftActivity: any[];
  dailyActiveUsers: any[];
  onboardingCompletion: any[];
}

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter'>('week');

  // Fetch analytics data from API
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    }
  });

  // Fetch users for total count
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Fetch rentals for total count
  const { data: rentalRequests = [] } = useQuery({
    queryKey: ['/api/admin/rental-requests'],
  });

  // Fetch streamers for streamer count
  const { data: streamers = [] } = useQuery({
    queryKey: ['/api/streamers'],
  });

  // Get current date
  const currentDate = new Date();
  
  // Format date range for display based on timeframe
  const getDateRangeLabel = () => {
    switch(timeframe) {
      case 'day':
        return `Today (${format(currentDate, 'MMM d, yyyy')})`;
      case 'week':
        return `Last 7 days (${format(subDays(currentDate, 7), 'MMM d')} - ${format(currentDate, 'MMM d')})`;
      case 'month':
        return `Last 30 days (${format(subDays(currentDate, 30), 'MMM d')} - ${format(currentDate, 'MMM d')})`;
      case 'quarter':
        return `Last 90 days (${format(subDays(currentDate, 90), 'MMM d')} - ${format(currentDate, 'MMM d')})`;
      default:
        return 'Custom Range';
    }
  };

  // Calculate total revenue from rental requests
  const calculateTotalRevenue = () => {
    const approvedRentals = rentalRequests.filter((r: any) => r.status === 'approved');
    const total = approvedRentals.reduce((sum: number, rental: any) => sum + (rental.price || 0), 0);
    return `$${total.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">
            Enhanced Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">{getDateRangeLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[hsl(var(--cwg-muted))]">Timeframe:</p>
          <Select 
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as 'day' | 'week' | 'month' | 'quarter')}
          >
            <SelectTrigger className="w-36 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="hidden md:flex" onClick={() => setTimeframe('week')}>
            Reset
          </Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Users"
          value={users.length}
          icon={<Users className="h-6 w-6" />}
          change={12}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-[hsl(var(--cwg-blue))]/20"
          iconColor="text-[hsl(var(--cwg-blue))]"
          isLoading={isLoading}
        />
        
        <AnalyticsCard
          title="Active Streamers"
          value={`${streamers.filter(s => s.isLive).length}/${streamers.length}`}
          icon={<Activity className="h-6 w-6" />}
          change={8}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-[hsl(var(--cwg-orange))]/20"
          iconColor="text-[hsl(var(--cwg-orange))]"
          isLoading={isLoading}
        />
        
        <AnalyticsCard
          title="Revenue (USD)"
          value={calculateTotalRevenue()}
          icon={<DollarSign className="h-6 w-6" />}
          change={21}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-[hsl(var(--cwg-green))]/20"
          iconColor="text-[hsl(var(--cwg-green))]"
          isLoading={isLoading}
        />
        
        <AnalyticsCard
          title="Active Rentals"
          value={rentalRequests.filter(r => r.status === 'approved').length}
          icon={<Calendar className="h-6 w-6" />}
          change={15}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-purple-500/20"
          iconColor="text-purple-500"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="User Growth"
          subtitle="New and returning users over time"
          data={analyticsData?.userGrowth || []}
          type="area"
          dataKeys={['Unique Visitors', 'New Signups']}
          formattedLabels={{
            'Unique Visitors': 'Unique Visitors',
            'New Signups': 'New Signups',
          }}
          isLoading={isLoading}
        />
        
        <AnalyticsChart
          title="Revenue Trends"
          subtitle="Revenue breakdown by source"
          data={analyticsData?.rentalRevenue || []}
          type="line"
          dataKeys={['Revenue']}
          valueFormat={(value) => `$${value}`}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChart
          title="Token Distribution"
          subtitle="Allocation of CWG tokens"
          data={analyticsData?.tokenDistribution || []}
          type="pie"
          dataKeys={['value']}
          valueFormat={(value) => `${value} CWG`}
          isLoading={isLoading}
        />
        
        <AnalyticsChart
          title="Games Played"
          subtitle="Most popular games on the platform"
          data={analyticsData?.gameDistribution || []}
          type="pie"
          dataKeys={['value']}
          valueFormat={(value) => `${value}%`}
          isLoading={isLoading}
        />
        
        <AnalyticsChart
          title="Stream Activity"
          subtitle="Streaming schedules by day"
          data={analyticsData?.streamActivity || []}
          type="bar"
          dataKeys={['value']}
          formattedLabels={{ 'value': 'Streams' }}
          isLoading={isLoading}
        />
      </div>

      {/* Top Performing Streamers */}
      <Card className="card-gradient border-[hsl(var(--cwg-dark-blue))]">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))]">
            Top Performing Streamers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--cwg-dark-blue))]">
                  <th className="text-left py-3 px-4 font-semibold text-[hsl(var(--cwg-muted))]">Streamer</th>
                  <th className="text-center py-3 px-4 font-semibold text-[hsl(var(--cwg-muted))]">Avg. Viewers</th>
                  <th className="text-center py-3 px-4 font-semibold text-[hsl(var(--cwg-muted))]">Hours Streamed</th>
                  <th className="text-center py-3 px-4 font-semibold text-[hsl(var(--cwg-muted))]">New Followers</th>
                  <th className="text-center py-3 px-4 font-semibold text-[hsl(var(--cwg-muted))]">Growth</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[hsl(var(--cwg-dark-blue))]">
                      <td className="py-3 px-4">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  (analyticsData?.streamersPerformance || []).map((streamer, index) => (
                    <tr key={index} className="border-b border-[hsl(var(--cwg-dark-blue))]">
                      <td className="py-3 px-4 font-medium">{streamer.name}</td>
                      <td className="py-3 px-4 text-center">{streamer.viewers}</td>
                      <td className="py-3 px-4 text-center">{streamer.hours}</td>
                      <td className="py-3 px-4 text-center">{streamer.followers}</td>
                      <td className="py-3 px-4 text-center text-green-500">+{Math.floor(Math.random() * 10) + 5}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics Section */}
      <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mt-8 mb-4">
        Extended Web3 Analytics
      </h3>

      {/* NFT & Web3 Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsCard
          title="NFT Transactions"
          value="253"
          icon={<Ticket className="h-6 w-6" />}
          change={32}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-pink-500/20"
          iconColor="text-pink-500"
          isLoading={isLoading}
        />
        
        <AnalyticsCard
          title="Token Transactions"
          value="1,482"
          icon={<Wallet className="h-6 w-6" />}
          change={18}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-cyan-500/20"
          iconColor="text-cyan-500"
          isLoading={isLoading}
        />
        
        <AnalyticsCard
          title="Guild Achievements"
          value="78"
          icon={<Star className="h-6 w-6" />}
          change={5}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-amber-500/20"
          iconColor="text-amber-500"
          isLoading={isLoading}
        />
        
        <AnalyticsCard
          title="Total Rewards"
          value="12,645 CWG"
          icon={<Gift className="h-6 w-6" />}
          change={24}
          changeLabel={`from last ${timeframe}`}
          iconBgColor="bg-emerald-500/20"
          iconColor="text-emerald-500"
          isLoading={isLoading}
        />
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AnalyticsChart
          title="User Engagement"
          subtitle="Active users by time and platform"
          data={analyticsData?.userEngagement || [
            { name: 'Mon', Mobile: 120, Desktop: 200, Web3: 80 },
            { name: 'Tue', Mobile: 132, Desktop: 180, Web3: 70 },
            { name: 'Wed', Mobile: 101, Desktop: 198, Web3: 90 },
            { name: 'Thu', Mobile: 134, Desktop: 210, Web3: 120 },
            { name: 'Fri', Mobile: 190, Desktop: 220, Web3: 140 },
            { name: 'Sat', Mobile: 230, Desktop: 170, Web3: 160 },
            { name: 'Sun', Mobile: 210, Desktop: 180, Web3: 130 },
          ]}
          type="line"
          dataKeys={['Mobile', 'Desktop', 'Web3']}
          isLoading={isLoading}
        />
        
        <AnalyticsChart
          title="Token Economy"
          subtitle="Token flow and distribution over time"
          data={analyticsData?.tokenEconomy || [
            { name: 'Week 1', Minted: 5000, Burned: 1200, Staked: 3000 },
            { name: 'Week 2', Minted: 4500, Burned: 1500, Staked: 3200 },
            { name: 'Week 3', Minted: 5200, Burned: 1700, Staked: 3500 },
            { name: 'Week 4', Minted: 6000, Burned: 2000, Staked: 4000 },
          ]}
          type="bar"
          dataKeys={['Minted', 'Burned', 'Staked']}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
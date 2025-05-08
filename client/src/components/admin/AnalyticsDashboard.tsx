import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsCard } from './AnalyticsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  ArrowUpRight, 
  CreditCard, 
  Wallet, 
  Coins, 
  Award, 
  Globe, 
  BookText, 
  MessageSquare, 
  Hash,
  Gamepad2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface AnalyticsDashboardProps {
  view?: 'overview' | 'financial' | 'users' | 'web3' | 'gaming';
}

export function AnalyticsDashboard({ view = 'overview' }: AnalyticsDashboardProps) {
  const [activeView, setActiveView] = useState(view);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const { toast } = useToast();

  // Fetch analytics data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/analytics', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      setLastUpdated(new Date());
      toast({
        title: 'Data refreshed',
        description: 'Analytics data has been updated',
      });
    } catch (error) {
      toast({
        title: 'Error refreshing data',
        description: 'Failed to update analytics data',
        variant: 'destructive',
      });
    }
  };

  // Format the user metrics
  const userMetrics = [
    {
      title: 'Total Users',
      value: isLoading ? '...' : data?.dailyActiveUsers?.totalUsers || '0',
      icon: <Users className="h-5 w-5" />,
      change: 12,
      iconBgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      isLoading,
    },
    {
      title: 'Active Users',
      value: isLoading ? '...' : data?.dailyActiveUsers?.activeUsers || '0',
      icon: <Users className="h-5 w-5" />,
      change: 8,
      changeLabel: 'from yesterday',
      iconBgColor: 'bg-green-500/20',
      iconColor: 'text-green-500',
      isLoading,
    },
    {
      title: 'New Signups',
      value: isLoading ? '...' : data?.dailyActiveUsers?.newSignups || '0',
      icon: <ArrowUpRight className="h-5 w-5" />,
      change: 18,
      changeLabel: 'from yesterday',
      iconBgColor: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
      isLoading,
    },
    {
      title: 'Onboarding Completion',
      value: isLoading ? '...' : `${data?.onboardingCompletion?.completionRate || '0'}%`,
      icon: <Award className="h-5 w-5" />,
      change: 5,
      changeLabel: 'from last week',
      iconBgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
      isLoading,
    },
  ];

  // Format the financials metrics
  const financialMetrics = [
    {
      title: 'Total Revenue',
      value: isLoading ? '...' : `$${data?.rentalRevenue?.totalRevenue || '0'}`,
      icon: <CreditCard className="h-5 w-5" />,
      change: 15,
      iconBgColor: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
      isLoading,
    },
    {
      title: 'NFT Sales',
      value: isLoading ? '...' : `$${data?.nftActivity?.totalSales || '0'}`,
      icon: <Wallet className="h-5 w-5" />,
      change: 9,
      iconBgColor: 'bg-cyan-500/20',
      iconColor: 'text-cyan-500',
      isLoading,
    },
    {
      title: 'Subscription Revenue',
      value: isLoading ? '...' : `$${data?.rentalRevenue?.subscriptionRevenue || '0'}`,
      icon: <CreditCard className="h-5 w-5" />,
      change: 3,
      iconBgColor: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      isLoading,
    },
    {
      title: 'Rental Revenue',
      value: isLoading ? '...' : `$${data?.rentalRevenue?.rentalFees || '0'}`,
      icon: <CreditCard className="h-5 w-5" />,
      change: 23,
      iconBgColor: 'bg-pink-500/20',
      iconColor: 'text-pink-500',
      isLoading,
    },
  ];

  // Format the Web3 metrics
  const web3Metrics = [
    {
      title: 'Token Transactions',
      value: isLoading ? '...' : data?.tokenEconomy?.totalTransactions || '0',
      icon: <Coins className="h-5 w-5" />,
      change: 12,
      iconBgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      isLoading,
    },
    {
      title: 'Wallet Connections',
      value: isLoading ? '...' : data?.tokenEconomy?.walletConnections || '0',
      icon: <Wallet className="h-5 w-5" />,
      change: 8,
      iconBgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
      isLoading,
    },
    {
      title: 'NFT Transactions',
      value: isLoading ? '...' : data?.nftActivity?.transactions || '0',
      icon: <Award className="h-5 w-5" />,
      change: 15,
      iconBgColor: 'bg-green-500/20',
      iconColor: 'text-green-500',
      isLoading,
    },
    {
      title: 'Guild Token Price',
      value: isLoading ? '...' : `$${data?.tokenEconomy?.tokenPrice || '0.02619'}`,
      icon: <Hash className="h-5 w-5" />,
      change: -3.1,
      iconBgColor: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
      isLoading,
    },
  ];

  // Format the gaming metrics
  const gamingMetrics = [
    {
      title: 'Active Games',
      value: isLoading ? '...' : data?.gameDistribution?.activeGames || '0',
      icon: <Gamepad2 className="h-5 w-5" />,
      change: 5,
      iconBgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
      isLoading,
    },
    {
      title: 'Total Play Time',
      value: isLoading ? '...' : `${data?.gameDistribution?.totalPlayHours || '0'} hrs`,
      icon: <TrendingUp className="h-5 w-5" />,
      change: 18,
      iconBgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      isLoading,
    },
    {
      title: 'Live Streams',
      value: isLoading ? '...' : data?.streamActivity?.liveStreams || '0',
      icon: <Globe className="h-5 w-5" />,
      change: 22,
      iconBgColor: 'bg-red-500/20',
      iconColor: 'text-red-500',
      isLoading,
    },
    {
      title: 'Tournaments',
      value: isLoading ? '...' : data?.gameDistribution?.tournaments || '0',
      icon: <Award className="h-5 w-5" />,
      change: 0,
      iconBgColor: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      isLoading,
    },
  ];

  // Format dashboard charts data
  const userGrowthData = data?.userGrowth || [];
  const rentalRevenueData = data?.rentalRevenue?.revenueByDay || [];
  const tokenDistributionData = data?.tokenDistribution || [];
  const gameDistributionData = data?.gameDistribution?.popularGames || [];
  const streamActivityData = data?.streamActivity?.activityByHour || [];
  const nftActivityData = data?.nftActivity?.transactionsByDay || [];
  const tokenEconomyData = data?.tokenEconomy?.priceHistory || [];
  const userEngagementData = data?.userEngagement || [];

  const renderContent = () => {
    switch (activeView) {
      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {financialMetrics.map((metric, index) => (
                <AnalyticsCard key={index} {...metric} />
              ))}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="Revenue by Day"
                subtitle="Daily revenue breakdown"
                data={rentalRevenueData}
                type="bar"
                dataKeys={['Subscriptions', 'NFT Sales', 'Rentals']}
                formattedLabels={{
                  'Subscriptions': 'Subscription Revenue',
                  'NFT Sales': 'NFT Sales Revenue',
                  'Rentals': 'Rental Fees'
                }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Revenue Sources"
                subtitle="Distribution of revenue streams"
                data={data?.rentalRevenue?.revenueSources || []}
                type="pie"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Revenue' }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="Token Economy"
                subtitle="Token price history"
                data={tokenEconomyData}
                type="area"
                dataKeys={['price']}
                formattedLabels={{ 'price': 'Token Price' }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="NFT Transaction Volume"
                subtitle="Daily NFT transaction activity"
                data={nftActivityData}
                type="line"
                dataKeys={['volume', 'value']}
                formattedLabels={{ 
                  'volume': 'Transaction Count',
                  'value': 'Transaction Value'
                }}
                valueFormat={(value) => typeof value === 'number' && value > 100 ? `$${value}` : value}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {userMetrics.map((metric, index) => (
                <AnalyticsCard key={index} {...metric} />
              ))}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="User Growth"
                subtitle="New users and active users"
                data={userGrowthData}
                type="line"
                dataKeys={['Unique Visitors', 'New Signups']}
                formattedLabels={{
                  'Unique Visitors': 'Unique Visitors',
                  'New Signups': 'New Registrations'
                }}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Onboarding Completion"
                subtitle="User onboarding funnel"
                data={data?.onboardingCompletion?.steps || []}
                type="bar"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Completion Rate' }}
                valueFormat={(value) => `${value}%`}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="User Engagement"
                subtitle="Daily active users by feature"
                data={userEngagementData}
                type="area"
                dataKeys={['Chat', 'Rentals', 'Courses', 'Streams', 'NFT Marketplace']}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="User Retention"
                subtitle="Weekly retention rate"
                data={data?.dailyActiveUsers?.retentionData || []}
                type="line"
                dataKeys={['rate']}
                formattedLabels={{ 'rate': 'Retention Rate' }}
                valueFormat={(value) => `${value}%`}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
        
      case 'web3':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {web3Metrics.map((metric, index) => (
                <AnalyticsCard key={index} {...metric} />
              ))}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="Token Distribution"
                subtitle="Token allocation by user group"
                data={tokenDistributionData}
                type="pie"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Token Amount' }}
                valueFormat={(value) => `${value.toLocaleString()} CWG`}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Token Price History"
                subtitle="CWG token price over time"
                data={tokenEconomyData}
                type="line"
                dataKeys={['price']}
                formattedLabels={{ 'price': 'Token Price' }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="NFT Transactions"
                subtitle="Daily NFT transaction volume"
                data={nftActivityData}
                type="bar"
                dataKeys={['volume']}
                formattedLabels={{ 'volume': 'Transaction Count' }}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Wallet Connections"
                subtitle="Connected wallets by type"
                data={data?.tokenEconomy?.walletTypes || []}
                type="pie"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Connections' }}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
        
      case 'gaming':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {gamingMetrics.map((metric, index) => (
                <AnalyticsCard key={index} {...metric} />
              ))}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="Popular Games"
                subtitle="Most played games on the platform"
                data={gameDistributionData}
                type="pie"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Players' }}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Streaming Activity"
                subtitle="Stream viewership by hour"
                data={streamActivityData}
                type="line"
                dataKeys={['viewers']}
                formattedLabels={{ 'viewers': 'Viewers' }}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="Top Streamers"
                subtitle="Streamers by viewer count"
                data={data?.streamersPerformance || []}
                type="bar"
                dataKeys={['viewers']}
                formattedLabels={{ 'viewers': 'Average Viewers' }}
                isLoading={isLoading}
                xAxisDataKey="streamer"
              />
              
              <AnalyticsChart
                title="Game Revenue"
                subtitle="Revenue by game category"
                data={data?.gameDistribution?.revenueByGame || []}
                type="bar"
                dataKeys={['revenue']}
                formattedLabels={{ 'revenue': 'Revenue' }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
        
      default:
        // Overview - show a mix of all metrics
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-orbitron font-semibold neon-text-orange animation-pulse-subtle">
                Guild Dashboard
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-[hsl(var(--cwg-muted))]">Last updated: {lastUpdated.toLocaleTimeString()}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 h-8 text-xs neon-border-blue hover:neon-glow-blue transition-all duration-300"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AnalyticsCard
                title="Total Users"
                value={isLoading ? '...' : data?.dailyActiveUsers?.totalUsers || '0'}
                icon={<Users className="h-5 w-5" />}
                change={12}
                iconBgColor="bg-blue-500/20"
                iconColor="text-blue-500"
                isLoading={isLoading}
              />
              
              <AnalyticsCard
                title="Total Revenue"
                value={isLoading ? '...' : `$${data?.rentalRevenue?.totalRevenue || '0'}`}
                icon={<CreditCard className="h-5 w-5" />}
                change={15}
                iconBgColor="bg-orange-500/20"
                iconColor="text-orange-500"
                isLoading={isLoading}
              />
              
              <AnalyticsCard
                title="Token Price"
                value={isLoading ? '...' : `$${data?.tokenEconomy?.tokenPrice || '0.02619'}`}
                icon={<Coins className="h-5 w-5" />}
                change={-3.1}
                iconBgColor="bg-purple-500/20"
                iconColor="text-purple-500"
                isLoading={isLoading}
              />
              
              <AnalyticsCard
                title="Active Rentals"
                value={isLoading ? '...' : data?.rentalRevenue?.activeRentals || '0'}
                icon={<Award className="h-5 w-5" />}
                change={8}
                iconBgColor="bg-green-500/20"
                iconColor="text-green-500"
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="User Growth"
                subtitle="User signups and engagement"
                data={userGrowthData}
                type="line"
                dataKeys={['Unique Visitors', 'New Signups']}
                formattedLabels={{
                  'Unique Visitors': 'Unique Visitors',
                  'New Signups': 'New Registrations'
                }}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Revenue Sources"
                subtitle="Distribution of revenue streams"
                data={data?.rentalRevenue?.revenueSources || []}
                type="pie"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Revenue' }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsChart
                title="Popular Games"
                subtitle="Most played games on the platform"
                data={gameDistributionData}
                type="pie"
                dataKeys={['value']}
                formattedLabels={{ 'value': 'Players' }}
                isLoading={isLoading}
              />
              
              <AnalyticsChart
                title="Token Price History"
                subtitle="CWG token price over time"
                data={tokenEconomyData}
                type="area"
                dataKeys={['price']}
                formattedLabels={{ 'price': 'Token Price' }}
                valueFormat={(value) => `$${value}`}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-[hsl(var(--cwg-dark-blue))] p-1 neon-border-blue shadow-md backdrop-blur-sm">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-[hsl(var(--cwg-blue))/20] data-[state=active]:neon-text-blue data-[state=active]:shadow-[0_0_8px_hsl(var(--cwg-blue))] transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="financial"
                className="data-[state=active]:bg-[hsl(var(--cwg-orange))/20] data-[state=active]:neon-text-orange data-[state=active]:shadow-[0_0_8px_hsl(var(--cwg-orange))] transition-all duration-300"
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Financial
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-[hsl(var(--cwg-green))/20] data-[state=active]:neon-text-green data-[state=active]:shadow-[0_0_8px_hsl(var(--cwg-green))] transition-all duration-300"
              >
                <Users className="w-4 h-4 mr-1" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="web3"
                className="data-[state=active]:bg-[hsl(var(--cwg-purple))/20] data-[state=active]:neon-text-purple data-[state=active]:shadow-[0_0_8px_hsl(var(--cwg-purple))] transition-all duration-300"
              >
                <Coins className="w-4 h-4 mr-1" />
                Web3
              </TabsTrigger>
              <TabsTrigger 
                value="gaming"
                className="data-[state=active]:bg-[hsl(var(--cwg-yellow))/20] data-[state=active]:text-[hsl(var(--cwg-yellow))] data-[state=active]:shadow-[0_0_8px_hsl(var(--cwg-yellow))] transition-all duration-300"
              >
                <Gamepad2 className="w-4 h-4 mr-1" />
                Gaming
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                <TabsList className="bg-[hsl(var(--cwg-dark-blue))] neon-border-blue shadow-md backdrop-blur-sm p-1">
                  <TabsTrigger 
                    value="day" 
                    className="data-[state=active]:bg-[hsl(var(--cwg-blue))/20] data-[state=active]:neon-text-blue transition-all duration-300 text-xs"
                  >
                    Day
                  </TabsTrigger>
                  <TabsTrigger 
                    value="week" 
                    className="data-[state=active]:bg-[hsl(var(--cwg-blue))/20] data-[state=active]:neon-text-blue transition-all duration-300 text-xs"
                  >
                    Week
                  </TabsTrigger>
                  <TabsTrigger 
                    value="month" 
                    className="data-[state=active]:bg-[hsl(var(--cwg-blue))/20] data-[state=active]:neon-text-blue transition-all duration-300 text-xs"
                  >
                    Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </Tabs>
      </div>
      
      {renderContent()}
    </div>
  );
}
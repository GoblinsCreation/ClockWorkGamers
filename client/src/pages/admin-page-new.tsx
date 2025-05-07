import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search,
  Filter,
  MoreHorizontal,
  Users, 
  BarChart2, 
  Wallet, 
  Award, 
  DollarSign, 
  Book, 
  Globe, 
  Settings,
  Users as UsersIcon,
  FileText,
  MessageSquare,
  Bell,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpenCheck
} from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Define neon colors for the admin dashboard
const NEON_COLORS = {
  blue: "#00c2ff",
  purple: "#8855ff",
  pink: "#ff00cc",
  green: "#00ff9d",
  yellow: "#ffcc00",
  orange: "#ff5500",
  red: "#ff3333",
  glow: (color: string) => `0 0 15px ${color}, 0 0 30px ${color}40`,
  glowText: (color: string) => `0 0 8px ${color}60, 0 0 12px ${color}40`,
};

// Rental status badges
const RentalStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-[#ffcc00] text-black">Pending</Badge>;
    case 'approved':
      return <Badge className="bg-[#00ff9d] text-black">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-[#ff3333] text-white">Rejected</Badge>;
    case 'active':
      return <Badge className="bg-[#00c2ff] text-black">Active</Badge>;
    case 'completed':
      return <Badge className="bg-[#8855ff] text-white">Completed</Badge>;
    default:
      return <Badge className="bg-gray-500">{status}</Badge>;
  }
};

export default function AdminPageNew() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Mock data for dashboard
  const analyticsData = {
    userStats: {
      totalUsers: 2468,
      newUsers: 187,
      activeUsers: 1546,
      premiumUsers: 583,
    },
    financialStats: {
      totalRevenue: 24853,
      subscriptions: 15420,
      nftSales: 6328,
      rentalFees: 3105,
    },
    userGrowth: [
      { name: 'Jan', users: 1250 },
      { name: 'Feb', users: 1380 },
      { name: 'Mar', users: 1450 },
      { name: 'Apr', users: 1620 },
      { name: 'May', users: 1850 },
      { name: 'Jun', users: 2100 },
      { name: 'Jul', users: 2340 },
      { name: 'Aug', users: 2468 },
    ],
    revenueBreakdown: [
      { name: 'Subscriptions', value: 62 },
      { name: 'NFT Sales', value: 25 },
      { name: 'Rental Fees', value: 13 },
    ],
    gamingActivity: [
      { name: 'Axie Infinity', value: 34 },
      { name: 'Gods Unchained', value: 23 },
      { name: 'Illuvium', value: 18 },
      { name: 'The Sandbox', value: 15 },
      { name: 'Others', value: 10 },
    ],
    streamingStats: [
      { name: 'Mon', streams: 24 },
      { name: 'Tue', streams: 32 },
      { name: 'Wed', streams: 28 },
      { name: 'Thu', streams: 35 },
      { name: 'Fri', streams: 42 },
      { name: 'Sat', streams: 48 },
      { name: 'Sun', streams: 38 },
    ],
    recentUsers: [
      { id: 1, username: 'FrostiiGoblin', email: 'frostii@example.com', joinDate: '2023-08-15', status: 'active' },
      { id: 2, username: 'CryptoKing', email: 'crypto@example.com', joinDate: '2023-08-14', status: 'active' },
      { id: 3, username: 'NFTCollector', email: 'nft@example.com', joinDate: '2023-08-12', status: 'inactive' },
      { id: 4, username: 'GamerGirl123', email: 'gamer@example.com', joinDate: '2023-08-10', status: 'active' },
      { id: 5, username: 'Web3Developer', email: 'dev@example.com', joinDate: '2023-08-08', status: 'active' },
    ],
  };

  // Fetch rentals data
  const { data: rentalsData, isLoading: isLoadingRentals, refetch: refetchRentals } = useQuery({
    queryKey: ['/api/rentals/all'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/rentals/all');
        return response.json();
      } catch (error) {
        console.error('Failed to fetch rentals:', error);
        // If API fails, return mock data
        return mockRentalsData;
      }
    },
  });

  // Mock rental data for testing
  const mockRentalsData = [
    {
      id: 1,
      userId: 2,
      username: 'CryptoKing',
      itemName: 'Legendary Axie #12345',
      itemType: 'NFT',
      price: 45,
      duration: 7,
      status: 'pending',
      createdAt: '2023-08-14',
    },
    {
      id: 2,
      userId: 3,
      username: 'NFTCollector',
      itemName: 'Gods Unchained Card Pack',
      itemType: 'Game Item',
      price: 12,
      duration: 3,
      status: 'pending',
      createdAt: '2023-08-13',
    },
    {
      id: 3,
      userId: 4,
      username: 'GamerGirl123',
      itemName: 'Decentraland Land Parcel',
      itemType: 'NFT',
      price: 120,
      duration: 14,
      status: 'approved',
      createdAt: '2023-08-11',
    },
    {
      id: 4,
      userId: 1,
      username: 'FrostiiGoblin',
      itemName: 'The Sandbox Avatar',
      itemType: 'NFT',
      price: 75,
      duration: 10,
      status: 'active',
      createdAt: '2023-08-10',
    },
    {
      id: 5,
      userId: 5,
      username: 'Web3Developer',
      itemName: 'Illuvium Rare Creature',
      itemType: 'Game Item',
      price: 60,
      duration: 5,
      status: 'completed',
      createdAt: '2023-08-08',
    },
    {
      id: 6,
      userId: 2,
      username: 'CryptoKing',
      itemName: 'Rare Splinterlands Card',
      itemType: 'Game Item',
      price: 25,
      duration: 4,
      status: 'rejected',
      createdAt: '2023-08-07',
    },
  ];

  // Approve rental mutation
  const approveRentalMutation = useMutation({
    mutationFn: async (rentalId: number) => {
      const response = await apiRequest('PATCH', `/api/rentals/${rentalId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rental Approved",
        description: "The rental request has been approved successfully.",
      });
      refetchRentals();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve rental",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject rental mutation
  const rejectRentalMutation = useMutation({
    mutationFn: async (rentalId: number) => {
      const response = await apiRequest('PATCH', `/api/rentals/${rentalId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rental Rejected",
        description: "The rental request has been rejected.",
      });
      refetchRentals();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject rental",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Chart colors - using neon colors
  const COLORS = [NEON_COLORS.blue, NEON_COLORS.green, NEON_COLORS.yellow, NEON_COLORS.orange, NEON_COLORS.purple];

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))] neon-text-orange">
              Admin Dashboard
            </h1>
            <p className="text-[hsl(var(--cwg-muted))] mt-1">
              Manage your guild and view analytics
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:neon-text-blue hover:border-[hsl(var(--cwg-blue))]"
            >
              <Settings size={16} />
              Settings
            </Button>
            <Button 
              className="bg-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))/90] hover:neon-glow-blue"
            >
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[hsl(var(--cwg-dark-blue))] p-0 h-auto flex-wrap">
            <TabsTrigger
              value="overview"
              className={`px-4 py-3 rounded-none data-[state=active]:neon-text-orange data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:text-[hsl(var(--cwg-orange))] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))]`}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className={`px-4 py-3 rounded-none data-[state=active]:neon-text-orange data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:text-[hsl(var(--cwg-orange))] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))]`}
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className={`px-4 py-3 rounded-none data-[state=active]:neon-text-orange data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:text-[hsl(var(--cwg-orange))] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))]`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger
              value="rentals"
              className={`px-4 py-3 rounded-none data-[state=active]:neon-text-orange data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:text-[hsl(var(--cwg-orange))] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))]`}
            >
              <BookOpenCheck className="h-4 w-4 mr-2" />
              Rentals
            </TabsTrigger>
            <TabsTrigger
              value="messaging"
              className={`px-4 py-3 rounded-none data-[state=active]:neon-text-orange data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:text-[hsl(var(--cwg-orange))] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))]`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`px-4 py-3 rounded-none data-[state=active]:neon-text-orange data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:text-[hsl(var(--cwg-orange))] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))]`}
            >
              <Bell className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-blue">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center space-y-0">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Users</p>
                      <p className="text-2xl font-orbitron font-bold text-[hsl(var(--cwg-blue))] neon-text-blue">
                        {analyticsData.userStats.totalUsers.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-blue))/20] flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className="font-medium text-green-500">+12%</span>
                    <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-orange">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center space-y-0">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Revenue</p>
                      <p className="text-2xl font-orbitron font-bold text-[hsl(var(--cwg-orange))] neon-text-orange">
                        ${analyticsData.financialStats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-orange))/20] flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className="font-medium text-green-500">+8%</span>
                    <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-green">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center space-y-0">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Active Users</p>
                      <p className="text-2xl font-orbitron font-bold text-[hsl(var(--cwg-green))] neon-text-green">
                        {analyticsData.userStats.activeUsers.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-green))/20] flex items-center justify-center">
                      <Users className="h-6 w-6 text-[hsl(var(--cwg-green))]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className="font-medium text-green-500">+15%</span>
                    <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-purple">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center space-y-0">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">NFT Sales</p>
                      <p className="text-2xl font-orbitron font-bold text-[hsl(var(--cwg-purple))] neon-text-purple">
                        ${analyticsData.financialStats.nftSales.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-purple))/20] flex items-center justify-center">
                      <Award className="h-6 w-6 text-[hsl(var(--cwg-purple))]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className="font-medium text-green-500">+22%</span>
                    <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* User Growth Chart */}
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-blue">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] neon-text-blue">
                    User Growth
                  </CardTitle>
                  <CardDescription>
                    Monthly user growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--cwg-dark))',
                            borderColor: 'hsl(var(--cwg-dark-blue))'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke={NEON_COLORS.blue}
                          strokeWidth={3}
                          dot={{ fill: NEON_COLORS.blue, r: 4 }}
                          activeDot={{ r: 6, fill: NEON_COLORS.blue }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown Chart */}
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-orange">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-orange))] neon-text-orange">
                    Revenue Breakdown
                  </CardTitle>
                  <CardDescription>
                    Distribution of revenue sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.revenueBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={(entry) => entry.name}
                          labelLine={false}
                        >
                          {analyticsData.revenueBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--cwg-dark))',
                            borderColor: 'hsl(var(--cwg-dark-blue))'
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* More Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Gaming Activity Chart */}
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-green">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-green))] neon-text-green">
                    Games Played
                  </CardTitle>
                  <CardDescription>
                    Most popular games on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.gamingActivity}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={(entry) => entry.name}
                          labelLine={false}
                        >
                          {analyticsData.gamingActivity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--cwg-dark))',
                            borderColor: 'hsl(var(--cwg-dark-blue))'
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Streaming Activity Chart */}
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-purple">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-purple))] neon-text-purple">
                    Streaming Activity
                  </CardTitle>
                  <CardDescription>
                    Number of active streams by day
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.streamingStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--cwg-dark))',
                            borderColor: 'hsl(var(--cwg-dark-blue))'
                          }}
                        />
                        <Bar dataKey="streams" fill={NEON_COLORS.purple} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-blue">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] neon-text-blue">
                  Recent Users
                </CardTitle>
                <CardDescription>
                  New users who joined the guild recently
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Username</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Email</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Join Date</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.recentUsers.map((user) => (
                      <TableRow key={user.id} className="border-[hsl(var(--cwg-dark-blue))]">
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-[hsl(var(--cwg-green))/20] text-[hsl(var(--cwg-green))]' 
                              : 'bg-[hsl(var(--cwg-muted))/20] text-[hsl(var(--cwg-muted))]'
                          }`}>
                            {user.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-blue">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] neon-text-blue">
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage guild members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))] focus:neon-border-blue"
                    />
                  </div>
                  <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:neon-text-blue">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Username</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Email</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Role</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Status</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Join Date</TableHead>
                      <TableHead className="text-[hsl(var(--cwg-muted))]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.recentUsers.map((user) => (
                      <TableRow key={user.id} className="border-[hsl(var(--cwg-dark-blue))]">
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.username === 'FrostiiGoblin' ? (
                            <Badge variant="outline" className="border-[hsl(var(--cwg-gold))] text-[hsl(var(--cwg-gold))]">
                              Owner
                            </Badge>
                          ) : user.id === 2 ? (
                            <Badge variant="outline" className="border-[hsl(var(--cwg-purple))] text-[hsl(var(--cwg-purple))]">
                              Admin
                            </Badge>
                          ) : user.id === 3 ? (
                            <Badge variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                              Moderator
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-[hsl(var(--cwg-muted))] text-[hsl(var(--cwg-muted))]">
                              Member
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-[hsl(var(--cwg-green))/20] text-[hsl(var(--cwg-green))]' 
                              : 'bg-[hsl(var(--cwg-muted))/20] text-[hsl(var(--cwg-muted))]'
                          }`}>
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:neon-text-blue">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals" className="space-y-6">
            <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-orange">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-orange))] neon-text-orange">
                      Rental Management
                    </CardTitle>
                    <CardDescription>
                      Approve or reject NFT and game item rental requests
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="self-start border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:neon-text-blue"
                    onClick={() => refetchRentals()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                    <Input
                      placeholder="Search rentals..."
                      className="pl-10 bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))] focus:neon-border-orange"
                    />
                  </div>
                  <Button variant="outline" className="border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] hover:neon-text-orange">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                
                <div className="rounded-md border border-[hsl(var(--cwg-dark-blue))] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                        <TableHead className="text-[hsl(var(--cwg-muted))]">ID</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">User</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Item</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Type</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Price</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Duration</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Status</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Date</TableHead>
                        <TableHead className="text-[hsl(var(--cwg-muted))]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(rentalsData || mockRentalsData).map((rental) => (
                        <TableRow key={rental.id} className="border-[hsl(var(--cwg-dark-blue))]">
                          <TableCell className="font-mono">#{rental.id}</TableCell>
                          <TableCell className="font-medium">{rental.username}</TableCell>
                          <TableCell>{rental.itemName}</TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(var(--cwg-dark-blue))] hover:bg-[hsl(var(--cwg-dark-blue))/70]">
                              {rental.itemType}
                            </Badge>
                          </TableCell>
                          <TableCell>${rental.price}</TableCell>
                          <TableCell>{rental.duration} days</TableCell>
                          <TableCell>
                            <RentalStatusBadge status={rental.status} />
                          </TableCell>
                          <TableCell>{rental.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {rental.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 hover:neon-text-green"
                                    onClick={() => approveRentalMutation.mutate(rental.id)}
                                    disabled={approveRentalMutation.isPending}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-[#ff3333] text-[#ff3333] hover:bg-[#ff3333]/10"
                                    onClick={() => rejectRentalMutation.mutate(rental.id)}
                                    disabled={rejectRentalMutation.isPending}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 p-0 hover:neon-text-blue">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-[#ffcc00] text-black">Pending: 2</Badge>
                  <Badge className="bg-[#00ff9d] text-black">Approved: 1</Badge>
                  <Badge className="bg-[#00c2ff] text-black">Active: 1</Badge>
                  <Badge className="bg-[#8855ff] text-white">Completed: 1</Badge>
                  <Badge className="bg-[#ff3333] text-white">Rejected: 1</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled className="text-[hsl(var(--cwg-muted))]">
                    Previous
                  </Button>
                  <Button variant="outline" className="text-[hsl(var(--cwg-orange))]">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {/* Rental Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-blue">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] neon-text-blue">
                    Rental Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Total Rentals</span>
                      <span className="text-xl font-bold">32</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Active Rentals</span>
                      <span className="text-xl font-bold">14</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Average Duration</span>
                      <span className="text-xl font-bold">7.2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Average Price</span>
                      <span className="text-xl font-bold">$45.60</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-green">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-green))] neon-text-green">
                    Popular Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-md bg-[hsl(var(--cwg-dark-blue))/30]">
                      <span>Axie Infinity NFTs</span>
                      <Badge className="bg-[hsl(var(--cwg-green))]">32%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-[hsl(var(--cwg-dark-blue))/30]">
                      <span>Gods Unchained Cards</span>
                      <Badge className="bg-[hsl(var(--cwg-green))]">24%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-[hsl(var(--cwg-dark-blue))/30]">
                      <span>Decentraland Wearables</span>
                      <Badge className="bg-[hsl(var(--cwg-green))]">18%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-[hsl(var(--cwg-dark-blue))/30]">
                      <span>The Sandbox Assets</span>
                      <Badge className="bg-[hsl(var(--cwg-green))]">14%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-orange">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-orange))] neon-text-orange">
                    Revenue Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Total Revenue</span>
                      <span className="text-xl font-bold text-[hsl(var(--cwg-orange))]">$3,105</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Platform Fee</span>
                      <span className="text-xl font-bold">$621</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Owner Earnings</span>
                      <span className="text-xl font-bold">$2,484</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--cwg-muted))]">Conversion Rate</span>
                      <span className="text-xl font-bold text-[hsl(var(--cwg-green))]">76%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-purple">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-purple))] neon-text-purple">
                  Content Management
                </CardTitle>
                <CardDescription>
                  Manage website content and educational materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[hsl(var(--cwg-blue))]">News Articles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">24</div>
                        <p className="text-[hsl(var(--cwg-muted))] text-sm">Total articles</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:neon-text-blue">Manage</Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[hsl(var(--cwg-green))]">Courses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-[hsl(var(--cwg-muted))] text-sm">Active courses</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:neon-text-green">Manage</Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[hsl(var(--cwg-orange))]">Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">8</div>
                        <p className="text-[hsl(var(--cwg-muted))] text-sm">Upcoming events</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:neon-text-orange">Manage</Button>
                      </CardFooter>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Content Updates</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                          <TableHead className="text-[hsl(var(--cwg-muted))]">Title</TableHead>
                          <TableHead className="text-[hsl(var(--cwg-muted))]">Type</TableHead>
                          <TableHead className="text-[hsl(var(--cwg-muted))]">Author</TableHead>
                          <TableHead className="text-[hsl(var(--cwg-muted))]">Updated</TableHead>
                          <TableHead className="text-[hsl(var(--cwg-muted))]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                          <TableCell className="font-medium">Getting Started with Web3 Gaming</TableCell>
                          <TableCell>Course</TableCell>
                          <TableCell>FrostiiGoblin</TableCell>
                          <TableCell>2h ago</TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(var(--cwg-green))]">Published</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                          <TableCell className="font-medium">Monthly NFT Market Update</TableCell>
                          <TableCell>Article</TableCell>
                          <TableCell>CryptoKing</TableCell>
                          <TableCell>5h ago</TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(var(--cwg-orange))]">Draft</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                          <TableCell className="font-medium">Axie Infinity Tournament Rules</TableCell>
                          <TableCell>Event</TableCell>
                          <TableCell>GamerGirl123</TableCell>
                          <TableCell>1d ago</TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(var(--cwg-green))]">Published</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-[hsl(var(--cwg-dark-blue))]">
                          <TableCell className="font-medium">Advanced NFT Trading Strategies</TableCell>
                          <TableCell>Course</TableCell>
                          <TableCell>NFTCollector</TableCell>
                          <TableCell>2d ago</TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(var(--cwg-blue))]">Review</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-green">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-green))] neon-text-green">
                  Messaging Center
                </CardTitle>
                <CardDescription>
                  Send announcements and manage communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[hsl(var(--cwg-blue))]">Announcements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-[hsl(var(--cwg-muted))] text-sm">Sent this month</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:neon-text-blue">New Announcement</Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[hsl(var(--cwg-green))]">Support Tickets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">7</div>
                        <p className="text-[hsl(var(--cwg-muted))] text-sm">Open tickets</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:neon-text-green">View Tickets</Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[hsl(var(--cwg-orange))]">Chat Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">438</div>
                        <p className="text-[hsl(var(--cwg-muted))] text-sm">Messages today</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:neon-text-orange">View Chat</Button>
                      </CardFooter>
                    </Card>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Send New Message</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="recipient">Recipient</Label>
                        <Select>
                          <SelectTrigger className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]">
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Members</SelectItem>
                            <SelectItem value="premium">Premium Members</SelectItem>
                            <SelectItem value="moderators">Moderators</SelectItem>
                            <SelectItem value="inactive">Inactive Users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          placeholder="Enter message subject"
                          className="bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Enter your message here..." 
                          className="min-h-[150px] bg-[hsl(var(--cwg-dark-blue))/50] border-[hsl(var(--cwg-dark-blue))]"
                        />
                      </div>
                      <Button className="hover:neon-glow-green">Send Message</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark))] hover:neon-card-blue">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] neon-text-blue">
                  Analytics & Reports
                </CardTitle>
                <CardDescription>
                  View detailed reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-auto py-4 px-6 flex flex-col items-center text-left hover:neon-glow-blue">
                    <div className="flex w-full justify-between items-center">
                      <span className="font-medium text-lg">User Activity Report</span>
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground w-full mt-1">
                      Detailed analysis of user engagement and activity
                    </p>
                  </Button>
                  
                  <Button className="h-auto py-4 px-6 flex flex-col items-center text-left hover:neon-glow-orange">
                    <div className="flex w-full justify-between items-center">
                      <span className="font-medium text-lg">Financial Summary</span>
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground w-full mt-1">
                      Revenue, transactions, and financial metrics
                    </p>
                  </Button>
                  
                  <Button className="h-auto py-4 px-6 flex flex-col items-center text-left hover:neon-glow-green">
                    <div className="flex w-full justify-between items-center">
                      <span className="font-medium text-lg">NFT & Rental Analytics</span>
                      <BookOpenCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground w-full mt-1">
                      NFT performance and rental statistics
                    </p>
                  </Button>
                  
                  <Button className="h-auto py-4 px-6 flex flex-col items-center text-left hover:neon-glow-purple">
                    <div className="flex w-full justify-between items-center">
                      <span className="font-medium text-lg">Guild Growth Report</span>
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground w-full mt-1">
                      Member acquisition and retention metrics
                    </p>
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Report Settings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Automated Reports</h4>
                        <p className="text-sm text-[hsl(var(--cwg-muted))]">Receive weekly analytics via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Real-time Alerts</h4>
                        <p className="text-sm text-[hsl(var(--cwg-muted))]">Get notifications for important events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Export Options</h4>
                        <p className="text-sm text-[hsl(var(--cwg-muted))]">Enable CSV and PDF exports</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
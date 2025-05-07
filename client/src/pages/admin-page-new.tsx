import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
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
  Bell
} from 'lucide-react';

// Define neon colors for the admin dashboard
const NEON_COLORS = {
  blue: "#00c2ff",
  purple: "#8855ff",
  pink: "#ff00cc",
  green: "#00ff9d",
  yellow: "#ffcc00",
  orange: "#ff5500",
  glow: (color: string) => `0 0 15px ${color}, 0 0 30px ${color}40`,
  glowText: (color: string) => `0 0 8px ${color}60, 0 0 12px ${color}40`,
};

export default function AdminPageNew() {
  const [activeTab, setActiveTab] = useState('overview');

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

  // Chart colors - using neon colors
  const COLORS = [NEON_COLORS.blue, NEON_COLORS.green, NEON_COLORS.yellow, NEON_COLORS.orange, NEON_COLORS.purple];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-bold neon-text-orange">
            Admin Dashboard
          </h1>
          <p className="text-[hsl(var(--cwg-muted))] mt-1">
            Manage your guild and view analytics
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="neon-border-blue neon-text-blue flex items-center gap-2 hover:neon-glow-blue">
            <Settings size={16} />
            Settings
          </Button>
          <Button className="bg-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))/90] hover:neon-glow-blue">
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[hsl(var(--cwg-dark-blue))] p-0 h-auto flex-wrap neon-border-blue">
          <TabsTrigger
            value="overview"
            className={`px-4 py-3 rounded-none data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:neon-text-orange data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))] hover:neon-text-blue`}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className={`px-4 py-3 rounded-none data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:neon-text-orange data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))] hover:neon-text-blue`}
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className={`px-4 py-3 rounded-none data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:neon-text-orange data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))] hover:neon-text-blue`}
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="messaging"
            className={`px-4 py-3 rounded-none data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:neon-text-orange data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))] hover:neon-text-blue`}
          >
            Messaging
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className={`px-4 py-3 rounded-none data-[state=active]:bg-[hsl(var(--cwg-dark))] data-[state=active]:neon-text-orange data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--cwg-orange))] hover:neon-text-blue`}
          >
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="neon-card-blue bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm hover:neon-glow-blue transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-center space-y-0">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Users</p>
                    <p className="text-2xl font-orbitron font-bold neon-text-blue">
                      {analyticsData.userStats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-blue))/20] flex items-center justify-center neon-glow-blue">
                    <UsersIcon className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="font-medium text-green-500">+12%</span>
                  <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="neon-card-orange bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm hover:neon-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-center space-y-0">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Revenue</p>
                    <p className="text-2xl font-orbitron font-bold neon-text-orange">
                      ${analyticsData.financialStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-orange))/20] flex items-center justify-center neon-glow">
                    <DollarSign className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="font-medium text-green-500">+8%</span>
                  <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="neon-card-green bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm hover:neon-glow-green transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-center space-y-0">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Active Users</p>
                    <p className="text-2xl font-orbitron font-bold neon-text-green">
                      {analyticsData.userStats.activeUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-green))/20] flex items-center justify-center neon-glow-green">
                    <Users className="h-6 w-6 text-[hsl(var(--cwg-green))]" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="font-medium text-green-500">+15%</span>
                  <span className="ml-1 text-[hsl(var(--cwg-muted))]">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="neon-card-purple bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm hover:neon-glow-purple transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-center space-y-0">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">NFT Sales</p>
                    <p className="text-2xl font-orbitron font-bold neon-text-purple">
                      ${analyticsData.financialStats.nftSales.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--cwg-purple))/20] flex items-center justify-center neon-glow-purple">
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
            <Card className="neon-card-blue bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300 hover:neon-glow-blue">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-orbitron neon-text-blue">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(68, 68, 68, 0.5)" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--cwg-dark))',
                          borderColor: 'hsl(var(--cwg-blue))',
                          boxShadow: '0 0 10px hsl(var(--cwg-blue))'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--cwg-blue))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--cwg-blue))', r: 4, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 6, fill: 'hsl(var(--cwg-blue))', stroke: 'white', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown Chart */}
            <Card className="neon-card-orange bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300 hover:neon-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-orbitron neon-text-orange">
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="rgba(255, 255, 255, 0.3)" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--cwg-dark))',
                          borderColor: 'hsl(var(--cwg-orange))',
                          boxShadow: '0 0 10px hsl(var(--cwg-orange))'
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
            <Card className="neon-card-green bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300 hover:neon-glow-green">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-orbitron neon-text-green">
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="rgba(255, 255, 255, 0.3)" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--cwg-dark))',
                          borderColor: 'hsl(var(--cwg-green))',
                          boxShadow: '0 0 10px hsl(var(--cwg-green))'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Streaming Activity Chart */}
            <Card className="neon-card-purple bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300 hover:neon-glow-purple">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-orbitron neon-text-purple">
                  Streaming Activity
                </CardTitle>
                <CardDescription>
                  Daily streaming activity
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.streamingStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(68, 68, 68, 0.5)" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--cwg-dark))',
                          borderColor: 'hsl(var(--cwg-purple))',
                          boxShadow: '0 0 10px hsl(var(--cwg-purple))'
                        }} 
                      />
                      <Bar 
                        dataKey="streams" 
                        fill="hsl(var(--cwg-purple))" 
                        radius={[4, 4, 0, 0]}
                        strokeWidth={1}
                        stroke="rgba(255, 255, 255, 0.3)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Users Table */}
          <Card className="neon-card-blue bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-orbitron neon-text-blue">
                Recent Users
              </CardTitle>
              <CardDescription>
                Recently joined users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--cwg-blue))/30]">
                    <TableHead className="neon-text-blue font-medium">Username</TableHead>
                    <TableHead className="neon-text-blue font-medium">Email</TableHead>
                    <TableHead className="neon-text-blue font-medium">Join Date</TableHead>
                    <TableHead className="neon-text-blue font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.recentUsers.map((user) => (
                    <TableRow key={user.id} className="border-[hsl(var(--cwg-dark-blue))] hover:bg-[hsl(var(--cwg-blue))/10] transition-colors duration-200">
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 neon-text-green' 
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" className="neon-border-blue neon-text-blue hover:neon-glow-blue" size="sm">
                  View All Users
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs - Simple placeholders for now */}
        <TabsContent value="users">
          <Card className="neon-card-orange bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-orbitron neon-text-orange">
                User Management
              </CardTitle>
              <CardDescription>
                Manage all users and their roles in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Input placeholder="Search users..." className="w-80 neon-border-orange focus:neon-glow" />
                  <Button variant="outline" className="neon-border-orange neon-text-orange hover:neon-glow">Search</Button>
                </div>
                <Button className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))/90] hover:neon-glow">
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
              
              <p className="text-sm text-[hsl(var(--cwg-muted))]">
                User management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="neon-card-green bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-orbitron neon-text-green">
                Content Management
              </CardTitle>
              <CardDescription>
                Manage news, posts, and other content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <div className="relative w-44 neon-border-green rounded-md overflow-hidden">
                    <select
                      className="w-full h-10 px-3 py-2 bg-[hsl(var(--cwg-dark-blue))/60] border-none rounded-md text-sm focus:outline-none appearance-none"
                    >
                      <option value="all">All Content</option>
                      <option value="news">News</option>
                      <option value="announcements">Announcements</option>
                      <option value="guides">Guides</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-[hsl(var(--cwg-green))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  <Button variant="outline" className="neon-border-green neon-text-green hover:neon-glow-green">Filter</Button>
                </div>
                <Button className="bg-[hsl(var(--cwg-green))] hover:bg-[hsl(var(--cwg-green))/90] hover:neon-glow-green text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Content
                </Button>
              </div>
              
              <p className="text-sm text-[hsl(var(--cwg-muted))]">
                Content management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging">
          <Card className="neon-card-purple bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-orbitron neon-text-purple">
                Messaging Center
              </CardTitle>
              <CardDescription>
                Manage messages and announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Input placeholder="Search messages..." className="w-80 neon-border-purple focus:neon-glow-purple" />
                  <Button variant="outline" className="neon-border-purple neon-text-purple hover:neon-glow-purple">Search</Button>
                </div>
                <Button className="bg-[hsl(var(--cwg-purple))] hover:bg-[hsl(var(--cwg-purple))/90] hover:neon-glow-purple text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
              
              <p className="text-sm text-[hsl(var(--cwg-muted))]">
                Messaging interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="neon-card-blue bg-[hsl(var(--cwg-dark))]/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-orbitron neon-text-blue">
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Generate detailed reports about the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="neon-card-blue bg-[hsl(var(--cwg-dark-blue))/60] hover:neon-glow-blue transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <UsersIcon className="h-6 w-6 mr-3 neon-text-blue" />
                      <h3 className="text-base font-medium neon-text-blue">User Reports</h3>
                    </div>
                    <p className="text-sm text-[hsl(var(--cwg-muted))] mb-4">
                      Generate detailed user activity and registration reports
                    </p>
                    <Button variant="outline" size="sm" className="w-full neon-border-blue neon-text-blue hover:neon-glow-blue">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="neon-card-orange bg-[hsl(var(--cwg-dark-blue))/60] hover:neon-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <BarChart2 className="h-6 w-6 mr-3 neon-text-orange" />
                      <h3 className="text-base font-medium neon-text-orange">Financial Reports</h3>
                    </div>
                    <p className="text-sm text-[hsl(var(--cwg-muted))] mb-4">
                      Generate revenue, transaction, and financial reports
                    </p>
                    <Button variant="outline" size="sm" className="w-full neon-border-orange neon-text-orange hover:neon-glow">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="neon-card-green bg-[hsl(var(--cwg-dark-blue))/60] hover:neon-glow-green transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Globe className="h-6 w-6 mr-3 neon-text-green" />
                      <h3 className="text-base font-medium neon-text-green">Content Reports</h3>
                    </div>
                    <p className="text-sm text-[hsl(var(--cwg-muted))] mb-4">
                      Generate content engagement and performance reports
                    </p>
                    <Button variant="outline" size="sm" className="w-full neon-border-green neon-text-green hover:neon-glow-green">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <p className="text-sm text-[hsl(var(--cwg-muted))]">
                Reporting interface will be fully implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for select
function Select({ children, ...props }) {
  return (
    <div className="relative w-44">
      <select
        className="w-full h-10 px-3 py-2 bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-border))] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--cwg-blue))] appearance-none"
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="h-4 w-4 text-[hsl(var(--cwg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
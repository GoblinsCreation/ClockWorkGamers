import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import { NeonCard } from "@/components/ui/animated-elements";

// Icons
import {
  UserCog,
  BarChart3,
  LineChart,
  Settings,
  Users,
  ShieldAlert,
  Ban,
  Check,
  Trash,
  Edit,
  Eye,
  MoreHorizontal,
  UserPlus,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Clock,
  Lock,
  Shield,
  Trophy,
  Gamepad,
  Server,
  Wallet,
  AlertTriangle,
  LifeBuoy,
  HeartPulse,
  BellRing,
  RefreshCw,
  Download,
  FileText,
  Activity,
  Shapes,
  Loader2
} from "lucide-react";

// Types
interface User {
  id: number;
  username: string;
  email: string;
  role: "User" | "Mod" | "Admin" | "Owner";
  status: "active" | "suspended" | "pending";
  joined: string;
}

interface RentalRequest {
  id: number;
  user: string;
  item: string;
  duration: string;
  status: "pending" | "approved" | "rejected" | "completed";
  date: string;
  totalCost: number;
}

interface Report {
  id: number;
  reportType: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
}

interface UserActivity {
  id: number;
  user: string;
  action: string;
  date: string;
  ip: string;
}

interface SystemStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: string;
  lastChecked: string;
}

// Sample data
const users: User[] = [
  {
    id: 1,
    username: "FrostiiGoblin",
    email: "jasoncwest2002@gmail.com",
    role: "Owner",
    status: "active",
    joined: "2025-01-15"
  },
  {
    id: 2,
    username: "CryptoGamer88",
    email: "crypto88@example.com",
    role: "Admin",
    status: "active",
    joined: "2025-01-20"
  },
  {
    id: 3,
    username: "MetaverseQueen",
    email: "mvqueen@example.com",
    role: "Mod",
    status: "active",
    joined: "2025-02-05"
  },
  {
    id: 4,
    username: "BlockchainBro",
    email: "bbro@example.com",
    role: "User",
    status: "suspended",
    joined: "2025-02-10"
  },
  {
    id: 5,
    username: "NFTCollector",
    email: "nftc@example.com",
    role: "User",
    status: "active",
    joined: "2025-02-15"
  },
  {
    id: 6,
    username: "GamersDelight",
    email: "gdelight@example.com",
    role: "User",
    status: "pending",
    joined: "2025-03-01"
  }
];

const rentalRequests: RentalRequest[] = [
  {
    id: 1,
    user: "CryptoGamer88",
    item: "Axie Infinity Starter Team",
    duration: "7 days",
    status: "pending",
    date: "2025-05-02",
    totalCost: 150
  },
  {
    id: 2,
    user: "MetaverseQueen",
    item: "Decentraland Premium Land Plot",
    duration: "30 days",
    status: "approved",
    date: "2025-05-01",
    totalCost: 500
  },
  {
    id: 3,
    user: "BlockchainBro",
    item: "The Sandbox Avatar",
    duration: "14 days",
    status: "rejected",
    date: "2025-04-28",
    totalCost: 200
  },
  {
    id: 4,
    user: "NFTCollector",
    item: "Legendary Weapon Skin",
    duration: "7 days",
    status: "completed",
    date: "2025-04-20",
    totalCost: 75
  }
];

const reports: Report[] = [
  {
    id: 1,
    reportType: "User Conduct",
    reportedBy: "NFTCollector",
    reportedUser: "BlockchainBro",
    reason: "Inappropriate chat messages",
    date: "2025-05-03",
    status: "pending"
  },
  {
    id: 2,
    reportType: "Scam Attempt",
    reportedBy: "MetaverseQueen",
    reportedUser: "GamersDelight",
    reason: "Attempted to scam NFT assets",
    date: "2025-05-02",
    status: "resolved"
  },
  {
    id: 3,
    reportType: "Bug Exploit",
    reportedBy: "CryptoGamer88",
    reportedUser: "BlockchainBro",
    reason: "Exploiting rental system bug",
    date: "2025-04-30",
    status: "dismissed"
  }
];

const userActivity: UserActivity[] = [
  {
    id: 1,
    user: "FrostiiGoblin",
    action: "Updated guild settings",
    date: "2025-05-03 14:23:05",
    ip: "192.168.1.1"
  },
  {
    id: 2,
    user: "CryptoGamer88",
    action: "Added new game to marketplace",
    date: "2025-05-03 12:15:30",
    ip: "192.168.1.2"
  },
  {
    id: 3,
    user: "MetaverseQueen",
    action: "Approved rental request #2",
    date: "2025-05-01 09:45:12",
    ip: "192.168.1.3"
  },
  {
    id: 4,
    user: "BlockchainBro",
    action: "Failed login attempt",
    date: "2025-05-01 08:32:45",
    ip: "192.168.1.4"
  },
  {
    id: 5,
    user: "NFTCollector",
    action: "Purchased premium membership",
    date: "2025-04-30 16:20:18",
    ip: "192.168.1.5"
  }
];

const systemStatus: SystemStatus[] = [
  {
    name: "Web Server",
    status: "online",
    uptime: "99.9%",
    lastChecked: "2025-05-03 15:00:00"
  },
  {
    name: "Database",
    status: "online",
    uptime: "99.8%",
    lastChecked: "2025-05-03 15:00:00"
  },
  {
    name: "NFT API",
    status: "degraded",
    uptime: "98.5%",
    lastChecked: "2025-05-03 15:00:00"
  },
  {
    name: "Payment Gateway",
    status: "online",
    uptime: "99.7%",
    lastChecked: "2025-05-03 15:00:00"
  },
  {
    name: "Game Servers",
    status: "online",
    uptime: "99.5%",
    lastChecked: "2025-05-03 15:00:00"
  },
  {
    name: "Chat System",
    status: "online",
    uptime: "99.6%",
    lastChecked: "2025-05-03 15:00:00"
  }
];

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Search and filter states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string | null>(null);
  const [userStatusFilter, setUserStatusFilter] = useState<string | null>(null);
  
  const [rentalStatusFilter, setRentalStatusFilter] = useState<string | null>(null);
  const [reportStatusFilter, setReportStatusFilter] = useState<string | null>(null);
  
  // Modals and dialogs
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isRentalDetailsDialogOpen, setIsRentalDetailsDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalRequest | null>(null);
  
  const [isReportDetailsDialogOpen, setIsReportDetailsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Filter users
  const filteredUsers = users.filter(user => {
    if (userSearchQuery && 
        !user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(userSearchQuery.toLowerCase())) {
      return false;
    }
    
    if (userRoleFilter && user.role !== userRoleFilter) {
      return false;
    }
    
    if (userStatusFilter && user.status !== userStatusFilter) {
      return false;
    }
    
    return true;
  });
  
  // Filter rental requests
  const filteredRentals = rentalRequests.filter(rental => {
    if (rentalStatusFilter && rental.status !== rentalStatusFilter) {
      return false;
    }
    
    return true;
  });
  
  // Filter reports
  const filteredReports = reports.filter(report => {
    if (reportStatusFilter && report.status !== reportStatusFilter) {
      return false;
    }
    
    return true;
  });
  
  // Permissions check
  if (!user || (user.role !== "Admin" && user.role !== "Mod" && user.role !== "Owner")) {
    return (
      <div className="flex items-center justify-center h-screen bg-[hsl(var(--cwg-dark))]">
        <Card className="w-[350px] neon-card-red">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access the admin area.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/")} className="w-full">Go to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Handle user actions
  const handleUserAction = (action: string, userId: number) => {
    const actionUser = users.find(u => u.id === userId);
    if (actionUser) {
      switch (action) {
        case "view":
          setSelectedUser(actionUser);
          setIsUserDetailsDialogOpen(true);
          break;
        case "promote":
          toast({
            title: "User Promoted",
            description: `${actionUser.username} has been promoted.`,
            variant: "default",
          });
          break;
        case "suspend":
          toast({
            title: "User Suspended",
            description: `${actionUser.username} has been suspended.`,
            variant: "destructive",
          });
          break;
        case "delete":
          toast({
            title: "User Deleted",
            description: `${actionUser.username} has been deleted.`,
            variant: "destructive",
          });
          break;
      }
    }
  };
  
  // Handle rental actions
  const handleRentalAction = (action: string, rentalId: number) => {
    const actionRental = rentalRequests.find(r => r.id === rentalId);
    if (actionRental) {
      switch (action) {
        case "view":
          setSelectedRental(actionRental);
          setIsRentalDetailsDialogOpen(true);
          break;
        case "approve":
          toast({
            title: "Rental Approved",
            description: `Rental request #${actionRental.id} has been approved.`,
            variant: "default",
          });
          break;
        case "reject":
          toast({
            title: "Rental Rejected",
            description: `Rental request #${actionRental.id} has been rejected.`,
            variant: "destructive",
          });
          break;
      }
    }
  };
  
  // Handle report actions
  const handleReportAction = (action: string, reportId: number) => {
    const actionReport = reports.find(r => r.id === reportId);
    if (actionReport) {
      switch (action) {
        case "view":
          setSelectedReport(actionReport);
          setIsReportDetailsDialogOpen(true);
          break;
        case "resolve":
          toast({
            title: "Report Resolved",
            description: `Report #${actionReport.id} has been marked as resolved.`,
            variant: "default",
          });
          break;
        case "dismiss":
          toast({
            title: "Report Dismissed",
            description: `Report #${actionReport.id} has been dismissed.`,
            variant: "destructive",
          });
          break;
      }
    }
  };
  
  // Generate report
  const generateReport = (reportType: string) => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Report Generated",
        description: `${reportType} report has been generated and is ready for download.`,
        variant: "default",
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-orbitron font-bold neon-text-orange">
                    Admin Dashboard
                  </h1>
                  <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-3xl">
                    Manage users, content, and system settings for ClockWork Gamers.
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <Badge className={user.role === "Owner" ? "bg-[hsl(var(--cwg-orange))]" : user.role === "Admin" ? "bg-[hsl(var(--cwg-blue))]" : "bg-[hsl(var(--cwg-purple))]"}>
                    {user.role}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocation("/profile")}
                    className="neon-border-blue"
                  >
                    Back to Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-8"
            >
              <TabsList className="bg-[hsl(var(--cwg-dark-blue))] p-1 rounded-lg w-full sm:w-auto">
                <TabsTrigger 
                  value="dashboard" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="rentals" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <Gamepad className="h-4 w-4 mr-2" />
                  Rentals
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[hsl(var(--cwg-blue))] text-lg">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{users.length}</div>
                      <p className="text-[hsl(var(--cwg-muted))] text-sm">+12% from last month</p>
                    </CardContent>
                  </NeonCard>
                  
                  <NeonCard color="green" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-500 text-lg">Active Rentals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">24</div>
                      <p className="text-[hsl(var(--cwg-muted))] text-sm">+5% from last month</p>
                    </CardContent>
                  </NeonCard>
                  
                  <NeonCard color="red" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-500 text-lg">Open Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {reports.filter(r => r.status === "pending").length}
                      </div>
                      <p className="text-[hsl(var(--cwg-muted))] text-sm">-8% from last month</p>
                    </CardContent>
                  </NeonCard>
                  
                  <NeonCard color="purple" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[hsl(var(--cwg-purple))] text-lg">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">$12,450</div>
                      <p className="text-[hsl(var(--cwg-muted))] text-sm">+18% from last month</p>
                    </CardContent>
                  </NeonCard>
                </div>
                
                {/* Activity and System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <NeonCard color="orange" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-orange))]">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {userActivity.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-start">
                            <div className="h-9 w-9 rounded-full bg-[hsl(var(--cwg-dark))] flex items-center justify-center mr-3">
                              <Activity className="h-5 w-5 text-[hsl(var(--cwg-orange))]" />
                            </div>
                            <div>
                              <p className="font-medium">{activity.user}</p>
                              <p className="text-[hsl(var(--cwg-muted))] text-sm">{activity.action}</p>
                              <p className="text-[hsl(var(--cwg-muted))] text-xs">{activity.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </NeonCard>
                  
                  {/* System Status */}
                  <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-[hsl(var(--cwg-blue))]">System Status</CardTitle>
                        <Button variant="outline" size="sm" className="h-8">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {systemStatus.map((system, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[hsl(var(--cwg-dark))] flex items-center justify-center mr-3">
                                {system.name === "Web Server" ? (
                                  <Server className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                                ) : system.name === "Database" ? (
                                  <Shapes className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                                ) : system.name === "NFT API" ? (
                                  <Shapes className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                                ) : system.name === "Payment Gateway" ? (
                                  <Wallet className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                                ) : system.name === "Game Servers" ? (
                                  <Gamepad className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                                ) : (
                                  <BellRing className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{system.name}</p>
                                <p className="text-[hsl(var(--cwg-muted))] text-xs">Uptime: {system.uptime}</p>
                              </div>
                            </div>
                            <Badge
                              className={
                                system.status === 'online' ? 'bg-green-600 hover:bg-green-700' :
                                system.status === 'degraded' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                'bg-red-600 hover:bg-red-700'
                              }
                            >
                              {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </NeonCard>
                </div>
                
                {/* Report Generation */}
                <NeonCard color="purple" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-purple))]">Analytics Reports</CardTitle>
                    <CardDescription>
                      Generate data reports for monitoring platform performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-[hsl(var(--cwg-dark))]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">User Growth</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            Full analysis of user acquisition and retention metrics.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => generateReport("User Growth")}
                            disabled={isGeneratingReport}
                          >
                            {isGeneratingReport ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="bg-[hsl(var(--cwg-dark))]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Revenue Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            Breakdown of revenue streams and financial performance.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => generateReport("Revenue Analysis")}
                            disabled={isGeneratingReport}
                          >
                            {isGeneratingReport ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="bg-[hsl(var(--cwg-dark))]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">System Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            Technical metrics for platform performance and stability.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => generateReport("System Performance")}
                            disabled={isGeneratingReport}
                          >
                            {isGeneratingReport ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CardContent>
                </NeonCard>
              </TabsContent>
              
              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                      <Input 
                        type="text"
                        placeholder="Search users..." 
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] w-full sm:w-80"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={userRoleFilter || ""} onValueChange={(val) => setUserRoleFilter(val || null)}>
                        <SelectTrigger className="w-32 bg-[hsl(var(--cwg-dark-blue))]">
                          <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Roles</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Mod">Mod</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={userStatusFilter || ""} onValueChange={(val) => setUserStatusFilter(val || null)}>
                        <SelectTrigger className="w-32 bg-[hsl(var(--cwg-dark-blue))]">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Add User Button */}
                  <Button onClick={() => setIsAddUserDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
                
                {/* Users Table */}
                <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.role === 'Owner' ? 'bg-[hsl(var(--cwg-orange))]' :
                                  user.role === 'Admin' ? 'bg-[hsl(var(--cwg-blue))]' :
                                  user.role === 'Mod' ? 'bg-[hsl(var(--cwg-purple))]' :
                                  'bg-[hsl(var(--cwg-muted))]'
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                                  user.status === 'suspended' ? 'bg-red-600 hover:bg-red-700' :
                                  'bg-yellow-600 hover:bg-yellow-700'
                                }
                              >
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUserAction("view", user.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUserAction("promote", user.id)}>
                                    <UserCog className="h-4 w-4 mr-2" />
                                    Change Role
                                  </DropdownMenuItem>
                                  {user.status === 'active' ? (
                                    <DropdownMenuItem onClick={() => handleUserAction("suspend", user.id)}>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleUserAction("activate", user.id)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Activate User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleUserAction("delete", user.id)}
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </NeonCard>
              </TabsContent>
              
              {/* Rentals Tab */}
              <TabsContent value="rentals" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Select value={rentalStatusFilter || ""} onValueChange={(val) => setRentalStatusFilter(val || null)}>
                      <SelectTrigger className="w-40 bg-[hsl(var(--cwg-dark-blue))]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Rentals Table */}
                <NeonCard color="green" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-green-500">Rental Requests</CardTitle>
                    <CardDescription>
                      Manage rental requests for NFTs and in-game items.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRentals.map((rental) => (
                          <TableRow key={rental.id}>
                            <TableCell>{`#${rental.id}`}</TableCell>
                            <TableCell className="font-medium">{rental.user}</TableCell>
                            <TableCell>{rental.item}</TableCell>
                            <TableCell>{rental.duration}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  rental.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                  rental.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                                  rental.status === 'completed' ? 'bg-blue-600 hover:bg-blue-700' :
                                  'bg-yellow-600 hover:bg-yellow-700'
                                }
                              >
                                {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>${rental.totalCost}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleRentalAction("view", rental.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {rental.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleRentalAction("approve", rental.id)}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRentalAction("reject", rental.id)}>
                                        <Ban className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </NeonCard>
              </TabsContent>
              
              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Select value={reportStatusFilter || ""} onValueChange={(val) => setReportStatusFilter(val || null)}>
                      <SelectTrigger className="w-40 bg-[hsl(var(--cwg-dark-blue))]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Reports Table */}
                <NeonCard color="red" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-red-500">User Reports</CardTitle>
                    <CardDescription>
                      Handle reports submitted by users about other users or content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reported By</TableHead>
                          <TableHead>Reported User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{`#${report.id}`}</TableCell>
                            <TableCell>{report.reportType}</TableCell>
                            <TableCell className="font-medium">{report.reportedBy}</TableCell>
                            <TableCell>{report.reportedUser}</TableCell>
                            <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  report.status === 'resolved' ? 'bg-green-600 hover:bg-green-700' :
                                  report.status === 'dismissed' ? 'bg-gray-600 hover:bg-gray-700' :
                                  'bg-yellow-600 hover:bg-yellow-700'
                                }
                              >
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleReportAction("view", report.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {report.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleReportAction("resolve", report.id)}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark Resolved
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleReportAction("dismiss", report.id)}>
                                        <Ban className="h-4 w-4 mr-2" />
                                        Dismiss
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </NeonCard>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Settings */}
                  <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-blue))]">General Settings</CardTitle>
                      <CardDescription>
                        Manage general platform configuration.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Maintenance Mode</Label>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              Put the site in maintenance mode
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">User Registration</Label>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              Allow new user registrations
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              Send email notifications for system events
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label className="text-base">Site Name</Label>
                          <Input
                            type="text"
                            defaultValue="ClockWork Gamers"
                            className="bg-[hsl(var(--cwg-dark))]"
                          />
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            The name of your site displayed in various places
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-base">Support Email</Label>
                          <Input
                            type="email"
                            defaultValue="support@clockworkgamers.com"
                            className="bg-[hsl(var(--cwg-dark))]"
                          />
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            Email address for user support inquiries
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="ml-auto">Save Changes</Button>
                    </CardFooter>
                  </NeonCard>
                  
                  {/* Security Settings */}
                  <NeonCard color="orange" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-orange))]">Security Settings</CardTitle>
                      <CardDescription>
                        Configure security and privacy options.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Two-Factor Authentication</Label>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              Require 2FA for admin accounts
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Content Moderation</Label>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              Automatically filter inappropriate content
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">IP Logging</Label>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              Log IP addresses for security monitoring
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label className="text-base">Session Timeout (minutes)</Label>
                          <Input
                            type="number"
                            defaultValue={60}
                            className="bg-[hsl(var(--cwg-dark))]"
                          />
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            Time before inactive sessions are terminated
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-base">Failed Login Attempts</Label>
                          <Input
                            type="number"
                            defaultValue={5}
                            className="bg-[hsl(var(--cwg-dark))]"
                          />
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">
                            Number of failed attempts before account lockout
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="ml-auto">Save Changes</Button>
                    </CardFooter>
                  </NeonCard>
                </div>
                
                {/* API Settings */}
                <NeonCard color="purple" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-purple))]">API Configuration</CardTitle>
                    <CardDescription>
                      Configure external API integrations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Twitch API */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Twitch API</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Client ID</Label>
                            <Input
                              type="password"
                              value="***************************"
                              className="bg-[hsl(var(--cwg-dark))]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Client Secret</Label>
                            <Input
                              type="password"
                              value="***************************"
                              className="bg-[hsl(var(--cwg-dark))]"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Enabled</Label>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Stripe API */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Stripe API</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Public Key</Label>
                            <Input
                              type="password"
                              value="***************************"
                              className="bg-[hsl(var(--cwg-dark))]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Secret Key</Label>
                            <Input
                              type="password"
                              value="***************************"
                              className="bg-[hsl(var(--cwg-dark))]"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Enabled</Label>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* PayPal API */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">PayPal API</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Client ID</Label>
                            <Input
                              type="password"
                              value="***************************"
                              className="bg-[hsl(var(--cwg-dark))]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Client Secret</Label>
                            <Input
                              type="password"
                              value="***************************"
                              className="bg-[hsl(var(--cwg-dark))]"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Enabled</Label>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto">Save API Settings</Button>
                  </CardFooter>
                </NeonCard>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* User Details Dialog */}
      <Dialog open={isUserDetailsDialogOpen} onOpenChange={setIsUserDetailsDialogOpen}>
        <DialogContent className="max-w-md bg-[hsl(var(--cwg-dark-blue))] neon-border-blue">
          <DialogHeader>
            <DialogTitle className="neon-text-blue">User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="h-20 w-20 rounded-full bg-[hsl(var(--cwg-blue))] mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {selectedUser.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-2">{selectedUser.username}</h3>
                <p className="text-[hsl(var(--cwg-muted))]">{selectedUser.email}</p>
                <div className="flex justify-center mt-1">
                  <Badge
                    className={
                      selectedUser.role === 'Owner' ? 'bg-[hsl(var(--cwg-orange))]' :
                      selectedUser.role === 'Admin' ? 'bg-[hsl(var(--cwg-blue))]' :
                      selectedUser.role === 'Mod' ? 'bg-[hsl(var(--cwg-purple))]' :
                      'bg-[hsl(var(--cwg-muted))]'
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Status</span>
                  <Badge
                    className={
                      selectedUser.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                      selectedUser.status === 'suspended' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-yellow-600 hover:bg-yellow-700'
                    }
                  >
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Joined</span>
                  <span>{new Date(selectedUser.joined).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Last Login</span>
                  <span>May 1, 2025</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">2FA Enabled</span>
                  <span>Yes</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Logged in</span>
                    <span className="text-[hsl(var(--cwg-muted))]">May 1, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated profile</span>
                    <span className="text-[hsl(var(--cwg-muted))]">Apr 28, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchased NFT</span>
                    <span className="text-[hsl(var(--cwg-muted))]">Apr 25, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsUserDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md bg-[hsl(var(--cwg-dark-blue))] neon-border-blue">
          <DialogHeader>
            <DialogTitle className="neon-text-blue">Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. They will receive an email with login instructions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                className="bg-[hsl(var(--cwg-dark))]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                className="bg-[hsl(var(--cwg-dark))]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger className="w-full bg-[hsl(var(--cwg-dark))]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Mod">Moderator</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="welcome-email" />
              <label
                htmlFor="welcome-email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send welcome email
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "User Created",
                description: "New user has been created successfully.",
              });
              setIsAddUserDialogOpen(false);
            }}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rental Details Dialog */}
      <Dialog open={isRentalDetailsDialogOpen} onOpenChange={setIsRentalDetailsDialogOpen}>
        <DialogContent className="max-w-md bg-[hsl(var(--cwg-dark-blue))] neon-border-green">
          <DialogHeader>
            <DialogTitle className="text-green-500">Rental Request Details</DialogTitle>
            <DialogDescription>
              View detailed information about this rental request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRental && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Request ID</span>
                  <span>#{selectedRental.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">User</span>
                  <span>{selectedRental.user}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Item</span>
                  <span>{selectedRental.item}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Duration</span>
                  <span>{selectedRental.duration}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Date</span>
                  <span>{new Date(selectedRental.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Total Cost</span>
                  <span>${selectedRental.totalCost}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Status</span>
                  <Badge
                    className={
                      selectedRental.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                      selectedRental.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                      selectedRental.status === 'completed' ? 'bg-blue-600 hover:bg-blue-700' :
                      'bg-yellow-600 hover:bg-yellow-700'
                    }
                  >
                    {selectedRental.status.charAt(0).toUpperCase() + selectedRental.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  className="bg-[hsl(var(--cwg-dark))]"
                  placeholder="Add admin notes here..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedRental.status === 'pending' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleRentalAction("reject", selectedRental.id);
                        setIsRentalDetailsDialogOpen(false);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        handleRentalAction("approve", selectedRental.id);
                        setIsRentalDetailsDialogOpen(false);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}
                {selectedRental.status !== 'pending' && (
                  <Button onClick={() => setIsRentalDetailsDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Report Details Dialog */}
      <Dialog open={isReportDetailsDialogOpen} onOpenChange={setIsReportDetailsDialogOpen}>
        <DialogContent className="max-w-md bg-[hsl(var(--cwg-dark-blue))] neon-border-red">
          <DialogHeader>
            <DialogTitle className="text-red-500">Report Details</DialogTitle>
            <DialogDescription>
              View detailed information about this report.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Report ID</span>
                  <span>#{selectedReport.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Type</span>
                  <span>{selectedReport.reportType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Reported By</span>
                  <span>{selectedReport.reportedBy}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Reported User</span>
                  <span>{selectedReport.reportedUser}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Date</span>
                  <span>{new Date(selectedReport.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))]">Status</span>
                  <Badge
                    className={
                      selectedReport.status === 'resolved' ? 'bg-green-600 hover:bg-green-700' :
                      selectedReport.status === 'dismissed' ? 'bg-gray-600 hover:bg-gray-700' :
                      'bg-yellow-600 hover:bg-yellow-700'
                    }
                  >
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Reason</Label>
                <div className="p-3 bg-[hsl(var(--cwg-dark))] rounded-md">
                  {selectedReport.reason}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  className="bg-[hsl(var(--cwg-dark))]"
                  placeholder="Add admin notes here..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedReport.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleReportAction("dismiss", selectedReport.id);
                        setIsReportDetailsDialogOpen(false);
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      onClick={() => {
                        handleReportAction("resolve", selectedReport.id);
                        setIsReportDetailsDialogOpen(false);
                      }}
                    >
                      Resolve
                    </Button>
                  </>
                )}
                {selectedReport.status !== 'pending' && (
                  <Button onClick={() => setIsReportDetailsDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Checkbox component
function Checkbox(props: React.ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type="checkbox"
      className="rounded border-gray-300 text-[hsl(var(--cwg-blue))] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      {...props}
    />
  );
}
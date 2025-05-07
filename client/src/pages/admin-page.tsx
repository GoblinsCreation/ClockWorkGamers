import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, RentalRequest, News, Streamer, StreamerSchedule } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Check, 
  X, 
  User as UserIcon, 
  Package, 
  FileText, 
  MessageSquare, 
  Loader2, 
  Search, 
  CheckCircle, 
  XCircle,
  BarChart2,
  Activity,
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { TwitchIntegrationPanel } from "@/components/admin/TwitchIntegrationPanel";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [userFilter, setUserFilter] = useState("");
  const [rentalFilter, setRentalFilter] = useState("");
  const [streamerFilter, setStreamerFilter] = useState("");
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day: "",
    startTime: "",
    endTime: "",
    game: "",
    isSubmitting: false
  });
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("week");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [] as any[],
    streamViewership: [] as any[],
    rentalRevenue: [] as any[],
    tokenDistribution: [] as any[],
    gameDistribution: [] as any[],
    streamActivity: [] as any[],
    streamersPerformance: [] as any[],
  });
  
  // Generate analytics data on component mount and when timeframe changes
  useEffect(() => {
    // Generate user growth analytics
    const userDates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const userGrowth = userDates.map((day, index) => {
      // Create some semi-random growth data that generally trends upward
      const baseValue = 80 + index * 5; // Base user count starts at 80 and increases by 5 each day
      const randomVariation = Math.floor(Math.random() * 20) - 10; // Random variation between -10 and +10
      const uniqueVisitors = baseValue + randomVariation;
      const signups = Math.floor(uniqueVisitors * (0.1 + Math.random() * 0.1)); // 10-20% conversion rate
      
      return {
        name: day,
        'Unique Visitors': uniqueVisitors,
        'New Signups': signups,
      };
    });
    
    // Generate stream viewership analytics
    const streamDates = ['10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
    const streamViewership = streamDates.map((time, index) => {
      // Create viewership pattern with peak during evening hours
      let baseViewers = 50;
      if (index > 2) baseViewers = 100; // Higher base during afternoon
      if (index > 4) baseViewers = 150; // Even higher base during evening
      
      const randomVariation = Math.floor(Math.random() * 40) - 20;
      const viewers = baseViewers + randomVariation;
      
      return {
        name: time,
        'Viewers': viewers,
      };
    });
    
    // Generate rental revenue analytics 
    const rentalDates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rentalRevenue = rentalDates.map((day, index) => {
      const baseRevenue = 1000 + index * 200; // Base revenue starts at 1000 and increases by 200 each day
      const randomVariation = Math.floor(Math.random() * 400) - 200; // Random variation between -200 and +200
      
      return {
        name: day,
        'Revenue': baseRevenue + randomVariation,
      };
    });
    
    // Generate token distribution analytics
    const tokenDistribution = [
      { name: 'Tokens Earned', value: 10200 },
      { name: 'Tokens Spent', value: 7800 },
      { name: 'Tokens Locked', value: 4500 },
      { name: 'Referral Bonus', value: 2100 },
    ];
    
    // Generate game distribution analytics
    const gameDistribution = [
      { name: 'Boss Fighters', value: 35 },
      { name: 'KoKodi', value: 22 },
      { name: 'Nyan Heroes', value: 18 },
      { name: 'Big Time', value: 12 },
      { name: 'WorldShards', value: 8 },
      { name: 'Off The Grid', value: 3 },
      { name: 'RavenQuest', value: 2 },
    ];
    
    // Generate stream activity by day
    const streamActivity = [
      { name: 'Monday', value: 4 },
      { name: 'Tuesday', value: 6 },
      { name: 'Wednesday', value: 8 },
      { name: 'Thursday', value: 10 },
      { name: 'Friday', value: 12 },
      { name: 'Saturday', value: 14 },
      { name: 'Sunday', value: 10 },
    ];
    
    // Generate top streamers performance
    const streamersPerformance = [
      { name: 'FrostiiGoblin', viewers: 248, hours: 28, followers: 1200 },
      { name: 'NeonDragon', viewers: 186, hours: 32, followers: 980 },
      { name: 'CryptoQueen', viewers: 173, hours: 24, followers: 850 },
      { name: 'BlockchainBro', viewers: 145, hours: 20, followers: 720 },
      { name: 'NFTHunter', viewers: 129, hours: 22, followers: 635 },
    ];
    
    setAnalyticsData({
      userGrowth,
      streamViewership,
      rentalRevenue,
      tokenDistribution,
      gameDistribution,
      streamActivity,
      streamersPerformance,
    });
  }, [analyticsTimeframe]);
  
  
  // State for user editing
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    isChangingPassword: false
  });
  
  // State for streamer creation
  const [isAddStreamerDialogOpen, setIsAddStreamerDialogOpen] = useState(false);
  const [newStreamer, setNewStreamer] = useState({
    displayName: "",
    platform: "Twitch",
    channelUrl: "",
    description: "",
    userId: 0,
    isSubmitting: false
  });
  
  // Fetch streamer schedules when a streamer is selected
  const { data: streamerSchedules = [], isLoading: isLoadingSchedules } = useQuery<StreamerSchedule[]>({
    queryKey: ["/api/streamer-schedules", selectedStreamer?.id],
    enabled: !!selectedStreamer,
  });
  
  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  // Fetch rental requests
  const { data: rentalRequests = [], isLoading: isLoadingRentals } = useQuery<RentalRequest[]>({
    queryKey: ["/api/admin/rental-requests"],
  });
  
  // Fetch news
  const { data: news = [], isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });
  
  // Fetch streamers
  const { data: streamers = [], isLoading: isLoadingStreamers } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers"],
  });
  
  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userFilter.toLowerCase()) ||
    user.email.toLowerCase().includes(userFilter.toLowerCase()) ||
    user.fullName.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  // Filter rental requests based on search
  const filteredRentalRequests = rentalRequests.filter(request => 
    request.status.toLowerCase().includes(rentalFilter.toLowerCase())
  );
  
  // Filter streamers based on search
  const filteredStreamers = streamers.filter(streamer => 
    streamer.displayName.toLowerCase().includes(streamerFilter.toLowerCase()) ||
    (streamer.streamTitle && streamer.streamTitle.toLowerCase().includes(streamerFilter.toLowerCase())) ||
    (streamer.currentGame && streamer.currentGame.toLowerCase().includes(streamerFilter.toLowerCase()))
  );
  
  // State for rejection reason dialog
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestToReject, setRequestToReject] = useState<number | null>(null);
  
  // Handle rental request status change
  const handleStatusChange = async (requestId: number, newStatus: string, reason?: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      // Include rejection reason if provided
      if (reason) {
        updateData.rejectionReason = reason;
      }
      
      await apiRequest("PATCH", `/api/admin/rental-requests/${requestId}`, updateData);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rental-requests"] });
      
      // Send notification to user about their request
      try {
        await apiRequest("POST", `/api/notifications`, {
          userId: rentalRequests.find(req => req.id === requestId)?.userId,
          title: `Rental Request ${newStatus === "approved" ? "Approved" : "Rejected"}`,
          message: newStatus === "approved" 
            ? "Your rental request has been approved! You can now proceed with the payment."
            : `Your rental request has been rejected. Reason: ${reason || "No reason provided."}`,
          type: newStatus === "approved" ? "success" : "error",
          read: false
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }
      
      toast({
        title: "Status updated",
        description: `Request #${requestId} status changed to ${newStatus}`,
      });
      
      // Reset rejection form state
      if (newStatus === "rejected") {
        setRejectionReason("");
        setRejectionDialogOpen(false);
        setRequestToReject(null);
      }
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "An error occurred while updating the request status",
        variant: "destructive",
      });
    }
  };
  
  // Open rejection dialog and store request ID
  const openRejectionDialog = (requestId: number) => {
    setRequestToReject(requestId);
    setRejectionDialogOpen(true);
  };
  
  // Create new news post
  const [newNewsPost, setNewNewsPost] = useState({
    title: "",
    content: "",
    category: "",
    isSubmitting: false
  });
  
  // Open schedule dialog
  const openScheduleDialog = (streamer: Streamer) => {
    setSelectedStreamer(streamer);
    setIsScheduleDialogOpen(true);
  };
  
  // Create new schedule
  const handleCreateSchedule = async () => {
    if (!selectedStreamer || !newSchedule.day || !newSchedule.startTime || !newSchedule.endTime || !newSchedule.game) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setNewSchedule({ ...newSchedule, isSubmitting: true });
    
    try {
      await apiRequest("POST", "/api/streamer-schedules", {
        streamerId: selectedStreamer.id,
        dayOfWeek: newSchedule.day,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        game: newSchedule.game,
        isSpecialEvent: false,
        notes: null,
        title: null
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/streamer-schedules", selectedStreamer.id] });
      
      toast({
        title: "Schedule created",
        description: "The streaming schedule has been added successfully",
      });
      
      setNewSchedule({
        day: "",
        startTime: "",
        endTime: "",
        game: "",
        isSubmitting: false
      });
    } catch (error) {
      toast({
        title: "Failed to create schedule",
        description: "An error occurred while adding the streaming schedule",
        variant: "destructive",
      });
      setNewSchedule({ ...newSchedule, isSubmitting: false });
    }
  };
  
  // Delete a schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/streamer-schedules/${scheduleId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/streamer-schedules", selectedStreamer?.id] });
      
      toast({
        title: "Schedule deleted",
        description: "The streaming schedule has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to delete schedule",
        description: "An error occurred while deleting the schedule",
        variant: "destructive",
      });
    }
  };
  
  // Handle user edit dialog
  const openUserEditDialog = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      password: "",
      isChangingPassword: false
    });
    setIsEditUserDialogOpen(true);
  };

  // Handle user update
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updateData: any = {
        username: userFormData.username,
        email: userFormData.email,
        fullName: userFormData.fullName,
      };
      
      if (userFormData.isChangingPassword && userFormData.password) {
        updateData.password = userFormData.password;
      }
      
      await apiRequest("PATCH", `/api/admin/users/${editingUser.id}`, updateData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
      toast({
        title: "User Updated",
        description: `${editingUser.username}'s profile has been updated successfully`,
      });
      
      setIsEditUserDialogOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the user profile",
        variant: "destructive",
      });
    }
  };
  
  // Handle sending password reset
  const handleSendPasswordReset = async () => {
    if (!editingUser) return;
    
    try {
      await apiRequest("POST", `/api/admin/users/${editingUser.id}/reset-password`, {});
      
      toast({
        title: "Password Reset Sent",
        description: `Password reset link has been sent to ${editingUser.email}`,
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to send password reset link",
        variant: "destructive",
      });
    }
  };
  
  // Handle add streamer
  const handleAddStreamer = async () => {
    if (!newStreamer.displayName || !newStreamer.platform || !newStreamer.channelUrl || !newStreamer.userId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setNewStreamer({ ...newStreamer, isSubmitting: true });
    
    try {
      await apiRequest("POST", "/api/streamers", {
        displayName: newStreamer.displayName,
        platform: newStreamer.platform,
        channelUrl: newStreamer.channelUrl,
        description: newStreamer.description,
        userId: newStreamer.userId,
        isLive: false,
        streamTitle: null,
        currentGame: null,
        viewerCount: 0,
        lastStreamedAt: null
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/streamers"] });
      
      toast({
        title: "Streamer Added",
        description: "New streamer has been added successfully",
      });
      
      setNewStreamer({
        displayName: "",
        platform: "Twitch",
        channelUrl: "",
        description: "",
        userId: 0,
        isSubmitting: false
      });
      
      setIsAddStreamerDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Add Streamer",
        description: "An error occurred while adding the streamer",
        variant: "destructive",
      });
      setNewStreamer({ ...newStreamer, isSubmitting: false });
    }
  };

  const handleCreateNews = async () => {
    if (!newNewsPost.title || !newNewsPost.content || !newNewsPost.category) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setNewNewsPost({ ...newNewsPost, isSubmitting: true });
    
    try {
      // Use current user ID as the author
      const authorId = currentUser?.id || 1;
      
      await apiRequest("POST", "/api/news", {
        title: newNewsPost.title,
        content: newNewsPost.content,
        category: newNewsPost.category,
        authorId
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      
      toast({
        title: "News created",
        description: "Your news post has been published successfully",
      });
      
      setNewNewsPost({
        title: "",
        content: "",
        category: "",
        isSubmitting: false
      });
    } catch (error) {
      toast({
        title: "Failed to create news",
        description: "An error occurred while publishing the news post",
        variant: "destructive",
      });
      setNewNewsPost({ ...newNewsPost, isSubmitting: false });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Admin Dashboard</h1>
              <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Manage your guild's users, requests, and content
              </p>
            </div>
          </div>
        </section>
        
        {/* Admin section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs 
              defaultValue="users" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-8">
                <TabsTrigger value="analytics" className="font-orbitron flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="users" className="font-orbitron flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Users
                </TabsTrigger>
                <TabsTrigger value="rental-requests" className="font-orbitron flex items-center gap-2">
                  <Package className="h-4 w-4" /> Rental Requests
                </TabsTrigger>
                <TabsTrigger value="streamers" className="font-orbitron flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Streamers
                </TabsTrigger>
                <TabsTrigger value="news" className="font-orbitron flex items-center gap-2">
                  <FileText className="h-4 w-4" /> News Management
                </TabsTrigger>
                <TabsTrigger value="messages" className="font-orbitron flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Messages
                </TabsTrigger>
              </TabsList>
              
              {/* Analytics Dashboard */}
              <TabsContent value="analytics">
                <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                  <AnalyticsDashboard />
                  {/* Keeping the old code commented out for reference
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">Analytics Dashboard</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-[hsl(var(--cwg-muted))]">Timeframe:</p>
                      <Select 
                        value={analyticsTimeframe}
                        onValueChange={setAnalyticsTimeframe}
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
                    </div>
                  </div>
                  
                  {/* Stats Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <div className="p-5 card-gradient rounded-xl border border-[hsl(var(--cwg-dark-blue))]">
                      <div className="flex items-center gap-4">
                        <div className="bg-[hsl(var(--cwg-blue))]/20 p-3 rounded-full">
                          <Users className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                        </div>
                        <div>
                          <p className="text-[hsl(var(--cwg-muted))] text-sm">Total Users</p>
                          <h3 className="text-2xl font-semibold text-[hsl(var(--cwg-text))]">{users.length}</h3>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500 text-sm">+12%</span>
                          <span className="text-[hsl(var(--cwg-muted))] text-xs ml-1">from last {analyticsTimeframe}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 card-gradient rounded-xl border border-[hsl(var(--cwg-dark-blue))]">
                      <div className="flex items-center gap-4">
                        <div className="bg-[hsl(var(--cwg-orange))]/20 p-3 rounded-full">
                          <Activity className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                        </div>
                        <div>
                          <p className="text-[hsl(var(--cwg-muted))] text-sm">Active Streamers</p>
                          <h3 className="text-2xl font-semibold text-[hsl(var(--cwg-text))]">{streamers.filter(s => s.isLive).length}/{streamers.length}</h3>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500 text-sm">+8%</span>
                          <span className="text-[hsl(var(--cwg-muted))] text-xs ml-1">from last {analyticsTimeframe}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 card-gradient rounded-xl border border-[hsl(var(--cwg-dark-blue))]">
                      <div className="flex items-center gap-4">
                        <div className="bg-[hsl(var(--cwg-green))]/20 p-3 rounded-full">
                          <DollarSign className="h-6 w-6 text-[hsl(var(--cwg-green))]" />
                        </div>
                        <div>
                          <p className="text-[hsl(var(--cwg-muted))] text-sm">Revenue (USD)</p>
                          <h3 className="text-2xl font-semibold text-[hsl(var(--cwg-text))]">$9,845.00</h3>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500 text-sm">+21%</span>
                          <span className="text-[hsl(var(--cwg-muted))] text-xs ml-1">from last {analyticsTimeframe}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 card-gradient rounded-xl border border-[hsl(var(--cwg-dark-blue))]">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-full">
                          <Calendar className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-[hsl(var(--cwg-muted))] text-sm">Active Rentals</p>
                          <h3 className="text-2xl font-semibold text-[hsl(var(--cwg-text))]">{rentalRequests.filter(r => r.status === 'approved').length}</h3>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500 text-sm">+15%</span>
                          <span className="text-[hsl(var(--cwg-muted))] text-xs ml-1">from last {analyticsTimeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                      <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">User Growth</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={analyticsData.userGrowth}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                color: '#fff'
                              }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Unique Visitors" 
                              stroke="#0EA5E9" 
                              fillOpacity={1} 
                              fill="url(#colorVisitors)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="New Signups" 
                              stroke="#F97316" 
                              fillOpacity={1} 
                              fill="url(#colorSignups)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                      <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Stream Viewership</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={analyticsData.streamViewership}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                borderColor: 'rgba(139, 92, 246, 0.5)',
                                color: '#fff'
                              }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Viewers" 
                              stroke="#8B5CF6" 
                              fillOpacity={1} 
                              fill="url(#colorViewers)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts Row 2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                      <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Token Distribution</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.tokenDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={(entry) => entry.name}
                              labelLine={false}
                            >
                              {analyticsData.tokenDistribution.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={[
                                    'rgba(14, 165, 233, 0.8)', // blue
                                    'rgba(249, 115, 22, 0.8)', // orange
                                    'rgba(139, 92, 246, 0.8)', // purple
                                    'rgba(34, 197, 94, 0.8)' // green
                                  ][index % 4]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} CWG Tokens`, 'Amount']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                color: '#fff'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                      <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Game Distribution</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.gameDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={(entry) => `${entry.name}: ${entry.value}%`}
                            >
                              {analyticsData.gameDistribution.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={[
                                    'rgba(14, 165, 233, 0.8)', // blue
                                    'rgba(249, 115, 22, 0.8)', // orange
                                    'rgba(139, 92, 246, 0.8)', // purple
                                    'rgba(34, 197, 94, 0.8)', // green
                                    'rgba(239, 68, 68, 0.8)', // red
                                    'rgba(234, 179, 8, 0.8)', // yellow
                                    'rgba(20, 184, 166, 0.8)', // teal
                                  ][index % 7]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value}%`, 'Percentage']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                color: '#fff'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                      <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Rental Revenue</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData.rentalRevenue}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip 
                              formatter={(value) => [`$${value}`, 'Revenue']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                color: '#fff'
                              }} 
                            />
                            <Bar dataKey="Revenue" fill="rgba(34, 197, 94, 0.8)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Streamers Table */}
                  <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                    <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Top Performers</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                            <TableHead>Streamer</TableHead>
                            <TableHead>Avg. Viewers</TableHead>
                            <TableHead>Hours Streamed</TableHead>
                            <TableHead>Followers</TableHead>
                            <TableHead>Performance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyticsData.streamersPerformance.map((streamer, index) => (
                            <TableRow key={index} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                              <TableCell className="font-medium">{streamer.name}</TableCell>
                              <TableCell>{streamer.viewers}</TableCell>
                              <TableCell>{streamer.hours}</TableCell>
                              <TableCell>{streamer.followers}</TableCell>
                              <TableCell>
                                <div className="w-full bg-[hsl(var(--cwg-dark-blue))] rounded-full h-2.5">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, (streamer.viewers / 250) * 100)}%` }}
                                  ></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Users Tab */}
              <TabsContent value="users">
                <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">User Management</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                      <Input 
                        type="text"
                        placeholder="Search users..."
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </div>
                  </div>
                  
                  {isLoadingUsers ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                            <TableHead>ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Guild</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                              <TableCell>{user.id}</TableCell>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.guild === "ClockWork Gamers" 
                                    ? "bg-[hsl(var(--cwg-orange))]/20 text-[hsl(var(--cwg-orange))]"
                                    : "bg-[hsl(var(--cwg-blue))]/20 text-[hsl(var(--cwg-blue))]"
                                }`}>
                                  {user.guild}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.role === "Owner" 
                                    ? "bg-purple-500/20 text-purple-500 font-bold"
                                    : user.role === "Admin"
                                    ? "bg-red-500/20 text-red-500 font-bold"
                                    : user.role === "Mod"
                                    ? "bg-blue-500/20 text-blue-500 font-bold"
                                    : "bg-green-500/20 text-green-500"
                                }`}>
                                  {user.role || "User"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-8 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                                        Manage Role
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className={user.role === "User" ? "bg-[hsl(var(--cwg-dark-blue))]/50" : ""}
                                        onClick={() => {
                                          apiRequest("PATCH", `/api/admin/users/${user.id}/role`, { role: "User", isAdmin: false })
                                            .then(() => {
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                              toast({
                                                title: "Role Updated",
                                                description: `${user.username} is now a standard User`,
                                              });
                                            })
                                            .catch(error => {
                                              toast({
                                                title: "Update Failed",
                                                description: error.message || "Could not update user role",
                                                variant: "destructive"
                                              });
                                            });
                                        }}
                                      >
                                        User
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className={user.role === "Mod" ? "bg-[hsl(var(--cwg-dark-blue))]/50" : ""}
                                        onClick={() => {
                                          apiRequest("PATCH", `/api/admin/users/${user.id}/role`, { role: "Mod", isAdmin: false })
                                            .then(() => {
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                              toast({
                                                title: "Role Updated",
                                                description: `${user.username} is now a Moderator`,
                                              });
                                            })
                                            .catch(error => {
                                              toast({
                                                title: "Update Failed",
                                                description: error.message || "Could not update user role",
                                                variant: "destructive"
                                              });
                                            });
                                        }}
                                      >
                                        Moderator
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className={user.role === "Admin" ? "bg-[hsl(var(--cwg-dark-blue))]/50" : ""}
                                        onClick={() => {
                                          apiRequest("PATCH", `/api/admin/users/${user.id}/role`, { role: "Admin", isAdmin: true })
                                            .then(() => {
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                              toast({
                                                title: "Role Updated",
                                                description: `${user.username} is now an Admin`,
                                              });
                                            })
                                            .catch(error => {
                                              toast({
                                                title: "Update Failed",
                                                description: error.message || "Could not update user role",
                                                variant: "destructive"
                                              });
                                            });
                                        }}
                                      >
                                        Admin
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className={user.role === "Owner" ? "bg-[hsl(var(--cwg-dark-blue))]/50" : ""}
                                        disabled={currentUser?.role !== "Owner"}
                                        onClick={() => {
                                          if (currentUser?.role !== "Owner") {
                                            toast({
                                              title: "Cannot Change Owner",
                                              description: "Only Owner can assign Owner role",
                                              variant: "destructive"
                                            });
                                            return;
                                          }
                                          
                                          apiRequest("PATCH", `/api/admin/users/${user.id}/role`, { role: "Owner", isAdmin: true })
                                            .then(() => {
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                              toast({
                                                title: "Role Updated",
                                                description: `${user.username} is now an Owner`,
                                              });
                                            })
                                            .catch(error => {
                                              toast({
                                                title: "Update Failed",
                                                description: error.message || "Could not update user role",
                                                variant: "destructive"
                                              });
                                            });
                                        }}
                                      >
                                        Owner (Restricted)
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]"
                                    onClick={() => openUserEditDialog(user)}
                                  >
                                    Edit Profile
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-muted))]">
                        No users match your search
                      </h3>
                      <button 
                        onClick={() => setUserFilter("")}
                        className="mt-4 text-[hsl(var(--cwg-orange))]"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Rental Requests Tab */}
              <TabsContent value="rental-requests">
                <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))]">Rental Requests</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                      <Input 
                        type="text"
                        placeholder="Filter by status..."
                        value={rentalFilter}
                        onChange={(e) => setRentalFilter(e.target.value)}
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </div>
                  </div>
                  
                  {isLoadingRentals ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                    </div>
                  ) : filteredRentalRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                            <TableHead>ID</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Rental ID</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Price</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRentalRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                              <TableCell>{request.id}</TableCell>
                              <TableCell>{request.userId}</TableCell>
                              <TableCell>{request.rentalId || "Custom"}</TableCell>
                              <TableCell>{request.startDate}</TableCell>
                              <TableCell>{request.endDate}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  request.status === "approved" 
                                    ? "bg-green-500/20 text-green-500"
                                    : request.status === "rejected"
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-[hsl(var(--cwg-blue))]/20 text-[hsl(var(--cwg-blue))]"
                                }`}>
                                  {request.status}
                                </span>
                              </TableCell>
                              <TableCell>${request.totalPrice || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {request.status === "pending" && (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 border-green-500 text-green-500 hover:bg-green-500/20"
                                        onClick={() => handleStatusChange(request.id, "approved")}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 border-red-500 text-red-500 hover:bg-red-500/20"
                                        onClick={() => openRejectionDialog(request.id)}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-muted))]">
                        No rental requests match your filter
                      </h3>
                      <button 
                        onClick={() => setRentalFilter("")}
                        className="mt-4 text-[hsl(var(--cwg-orange))]"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Streamers Tab */}
              <TabsContent value="streamers">
                <div className="grid gap-6">
                  {/* Twitch Integration Panel */}
                  <TwitchIntegrationPanel />
                
                  <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">Streamer Management</h2>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                        <Input 
                          type="text"
                          placeholder="Search streamers..."
                          value={streamerFilter}
                          onChange={(e) => setStreamerFilter(e.target.value)}
                          className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Button 
                        className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))]/90"
                        onClick={() => setIsAddStreamerDialogOpen(true)}
                      >
                        Add New Streamer
                      </Button>
                    </div>
                    
                    {isLoadingStreamers ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                      </div>
                    ) : filteredStreamers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                              <TableHead>ID</TableHead>
                              <TableHead>Display Name</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Game</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStreamers.map((streamer) => (
                              <TableRow key={streamer.id} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                                <TableCell>{streamer.id}</TableCell>
                                <TableCell className="font-medium">{streamer.displayName}</TableCell>
                                <TableCell>{streamer.userId}</TableCell>
                                <TableCell>{streamer.currentGame || "N/A"}</TableCell>
                                <TableCell>{streamer.twitchId ? "Twitch" : "N/A"}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    streamer.isLive 
                                      ? "bg-green-500/20 text-green-500"
                                      : "bg-[hsl(var(--cwg-muted))]/20 text-[hsl(var(--cwg-muted))]"
                                  }`}>
                                    {streamer.isLive ? "Live" : "Offline"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" className="h-8 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]"
                                      onClick={() => openScheduleDialog(streamer)}
                                    >
                                      Schedules
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-muted))]">
                          No streamers match your search
                        </h3>
                        <button 
                          onClick={() => setStreamerFilter("")}
                          className="mt-4 text-[hsl(var(--cwg-orange))]"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* News Tab */}
              <TabsContent value="news">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create News Form */}
                  <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-6">Create News Post</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">Title</label>
                        <Input 
                          type="text"
                          value={newNewsPost.title}
                          onChange={(e) => setNewNewsPost({ ...newNewsPost, title: e.target.value })}
                          className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                          placeholder="Enter news title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">Category</label>
                        <Select 
                          value={newNewsPost.category}
                          onValueChange={(value) => setNewNewsPost({ ...newNewsPost, category: value })}
                        >
                          <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                            <SelectItem value="Web3 Gaming">Web3 Gaming</SelectItem>
                            <SelectItem value="Crypto">Crypto</SelectItem>
                            <SelectItem value="Tournaments">Tournaments</SelectItem>
                            <SelectItem value="Updates">Updates</SelectItem>
                            <SelectItem value="Guild News">Guild News</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">Content</label>
                        <Textarea 
                          value={newNewsPost.content}
                          onChange={(e) => setNewNewsPost({ ...newNewsPost, content: e.target.value })}
                          className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] min-h-[150px]"
                          placeholder="Write your news content here..."
                        />
                      </div>
                      
                      <Button
                        onClick={handleCreateNews}
                        disabled={newNewsPost.isSubmitting}
                        className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
                      >
                        {newNewsPost.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          "Publish News"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* News List */}
                  <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Published News</h2>
                    
                    {isLoadingNews ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                      </div>
                    ) : news.length > 0 ? (
                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                        {news.map((item) => (
                          <div key={item.id} className="p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))]">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">{item.title}</h3>
                              <span className="px-2 py-1 rounded-full text-xs bg-[hsl(var(--cwg-orange))]/20 text-[hsl(var(--cwg-orange))]">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[hsl(var(--cwg-muted))] text-sm mb-3 line-clamp-2">
                              {item.content}
                            </p>
                            <div className="flex justify-between items-center text-xs text-[hsl(var(--cwg-muted))]">
                              <span>Author ID: {item.authorId}</span>
                              <span>{format(new Date(item.publishDate), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-end mt-2 space-x-2">
                              <Button variant="outline" size="sm" className="h-7 text-xs border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-muted))]">
                          No news posts found
                        </h3>
                        <p className="mt-2 text-[hsl(var(--cwg-muted))]">
                          Create your first news post using the form.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Messages Tab */}
              <TabsContent value="messages">
                <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">Contact Messages</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                      <Input 
                        type="text"
                        placeholder="Search messages..."
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </div>
                  </div>
                  
                  {/* Sample contact messages - in production, these would come from the database */}
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                    {[
                      {
                        id: 1,
                        name: "John Doe",
                        email: "john@example.com",
                        subject: "Question about NFT Rentals",
                        message: "I'm interested in renting some NFTs for the KoKodi game. Can you tell me more about the rental process and costs?",
                        createdAt: "2023-12-15T14:30:00Z",
                        status: "unread"
                      },
                      {
                        id: 2,
                        name: "Alice Smith",
                        email: "alice@example.com",
                        subject: "Partnership Opportunity",
                        message: "We have a Web3 gaming community and would like to discuss potential partnership opportunities with ClockWork Gamers. Please let me know when we can schedule a call.",
                        createdAt: "2023-12-14T09:15:00Z",
                        status: "read"
                      },
                      {
                        id: 3,
                        name: "Mike Johnson",
                        email: "mike@example.com",
                        subject: "Technical Support",
                        message: "I'm having trouble connecting my wallet to your platform. I'm using MetaMask with the latest version. The connect button doesn't seem to be working correctly.",
                        createdAt: "2023-12-13T16:45:00Z",
                        status: "replied"
                      }
                    ].map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg border ${
                          message.status === 'unread' 
                            ? 'bg-[hsl(var(--cwg-orange))]/5 border-[hsl(var(--cwg-orange))]/30' 
                            : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">
                              {message.subject}
                              {message.status === 'unread' && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--cwg-orange))]/20 text-[hsl(var(--cwg-orange))]">
                                  New
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))]">
                              From: {message.name} ({message.email})
                            </p>
                          </div>
                          <span className="text-xs text-[hsl(var(--cwg-muted))]">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[hsl(var(--cwg-text))] mb-3">
                          {message.message}
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]"
                          >
                            Reply
                          </Button>
                          {message.status === 'unread' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs border-green-500 text-green-500"
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs border-red-500 text-red-500"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
          <DialogHeader>
            <DialogTitle className="text-xl font-orbitron text-red-500">
              Reject Rental Request
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--cwg-muted))]">
              Please provide a reason for rejecting this rental request. This will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-[hsl(var(--cwg-text))] mb-2">Rejection Reason</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] min-h-[100px]"
                placeholder="e.g., Item is currently unavailable, rental period conflicts with existing bookings, etc."
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setRejectionDialogOpen(false)}
              className="border-[hsl(var(--cwg-muted))] text-[hsl(var(--cwg-muted))]"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (requestToReject) {
                  handleStatusChange(requestToReject, "rejected", rejectionReason);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
      
      {/* Streamer Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron text-[hsl(var(--cwg-orange))]">
              Manage Schedules for {selectedStreamer?.displayName}
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--cwg-muted))]">
              Add and manage streaming schedules for this streamer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Create Schedule Form */}
            <div className="p-4 rounded-lg bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-dark-blue))]/80">
              <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-4">
                Add New Schedule
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">Day</label>
                  <Select 
                    value={newSchedule.day}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, day: value })}
                  >
                    <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">Start Time</label>
                  <Input 
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                  />
                </div>
                
                <div>
                  <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">End Time</label>
                  <Input 
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                  />
                </div>
                
                <div>
                  <label className="block text-[hsl(var(--cwg-muted))] mb-1 text-sm">Game</label>
                  <Select 
                    value={newSchedule.game}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, game: value })}
                  >
                    <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                      <SelectValue placeholder="Select game" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                      <SelectItem value="Boss Fighters">Boss Fighters</SelectItem>
                      <SelectItem value="KoKodi">KoKodi</SelectItem>
                      <SelectItem value="Nyan Heroes">Nyan Heroes</SelectItem>
                      <SelectItem value="Big Time">Big Time</SelectItem>
                      <SelectItem value="WorldShards">WorldShards</SelectItem>
                      <SelectItem value="Off The Grid">Off The Grid</SelectItem>
                      <SelectItem value="RavenQuest">RavenQuest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleCreateSchedule}
                  disabled={newSchedule.isSubmitting}
                  className="w-full bg-gradient-to-r from-[hsl(var(--cwg-blue))] to-[hsl(var(--cwg-blue))]/80 text-white rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
                >
                  {newSchedule.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Schedule"
                  )}
                </Button>
              </div>
            </div>
            
            {/* Schedule List */}
            <div className="p-4 rounded-lg bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-dark-blue))]/80">
              <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-4">
                Current Schedules
              </h3>
              
              {isLoadingSchedules ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-blue))]" />
                </div>
              ) : streamerSchedules.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {streamerSchedules.map((schedule) => (
                    <div key={schedule.id} className="p-3 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))]">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-orbitron text-[hsl(var(--cwg-text))]">{schedule.dayOfWeek}</span>
                          <div className="text-sm text-[hsl(var(--cwg-muted))]">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="mt-1 px-2 py-0.5 text-xs inline-block rounded-full bg-[hsl(var(--cwg-blue))]/20 text-[hsl(var(--cwg-blue))]">
                            {schedule.game}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 text-xs border-red-500 text-red-500"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[hsl(var(--cwg-muted))]">
                    No schedules found for this streamer.
                  </p>
                  <p className="text-sm text-[hsl(var(--cwg-muted))] mt-1">
                    Add your first schedule using the form.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsScheduleDialogOpen(false)}
              className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Edit Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
              Edit User Profile
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--cwg-muted))]">
              Make changes to user's profile information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Username</label>
              <Input
                value={userFormData.username}
                onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Email</label>
              <Input
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Full Name</label>
              <Input
                value={userFormData.fullName}
                onChange={(e) => setUserFormData({...userFormData, fullName: e.target.value})}
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="change-password"
                checked={userFormData.isChangingPassword}
                onCheckedChange={(checked: boolean) => setUserFormData({...userFormData, isChangingPassword: checked})}
              />
              <label htmlFor="change-password" className="text-sm font-medium text-[hsl(var(--cwg-muted))]">
                Change password
              </label>
            </div>
            
            {userFormData.isChangingPassword && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">New Password</label>
                <Input
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                  type="password"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2 justify-between">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleSendPasswordReset}
              className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]"
            >
              Send Password Reset
            </Button>
            <div className="space-x-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsEditUserDialogOpen(false)}
                className="border-[hsl(var(--cwg-muted))] text-[hsl(var(--cwg-muted))]"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleUpdateUser}
                className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))]/90"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Streamer Dialog */}
      <Dialog open={isAddStreamerDialogOpen} onOpenChange={setIsAddStreamerDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
              Add New Streamer
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--cwg-muted))]">
              Enter details for the new streamer. They must have a ClockWork Gamers account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Display Name</label>
              <Input
                value={newStreamer.displayName}
                onChange={(e) => setNewStreamer({...newStreamer, displayName: e.target.value})}
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                placeholder="Streamer's display name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Platform</label>
              <Select
                value={newStreamer.platform}
                onValueChange={(value) => setNewStreamer({...newStreamer, platform: value})}
              >
                <SelectTrigger className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                  <SelectItem value="Twitch">Twitch</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Facebook">Facebook Gaming</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Kick">Kick</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Channel URL</label>
              <Input
                value={newStreamer.channelUrl}
                onChange={(e) => setNewStreamer({...newStreamer, channelUrl: e.target.value})}
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                placeholder="https://"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">User Account</label>
              <Select
                value={newStreamer.userId ? String(newStreamer.userId) : ""}
                onValueChange={(value) => setNewStreamer({...newStreamer, userId: parseInt(value)})}
              >
                <SelectTrigger className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <SelectValue placeholder="Select user account" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] max-h-[200px]">
                  {users.map(user => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Description</label>
              <Textarea
                value={newStreamer.description}
                onChange={(e) => setNewStreamer({...newStreamer, description: e.target.value})}
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] min-h-[80px]"
                placeholder="Brief description about the streamer"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsAddStreamerDialogOpen(false)}
              className="border-[hsl(var(--cwg-muted))] text-[hsl(var(--cwg-muted))]"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAddStreamer}
              disabled={newStreamer.isSubmitting}
              className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))]/90"
            >
              {newStreamer.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Streamer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

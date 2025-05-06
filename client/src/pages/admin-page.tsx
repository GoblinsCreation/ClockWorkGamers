import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  BarChart2, 
  UserIcon, 
  Users, 
  Package, 
  FileText, 
  Calendar, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  Check, 
  X, 
  Edit, 
  Trash, 
  Loader2, 
  DollarSign, 
  Activity, 
  TrendingUp,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  profileImage?: string;
  guild?: string;
  role?: string;
  isAdmin: boolean;
}

interface RentalRequest {
  id: number;
  userId: number;
  username: string;
  profileImage?: string;
  itemName: string;
  itemType: string;
  status: 'pending' | 'approved' | 'rejected';
  price: number;
  currency: string;
  rentalPeriod: string;
  createdAt: string;
}

interface Streamer {
  id: number;
  userId: number;
  username: string;
  profileImage?: string;
  twitchId?: string;
  isLive: boolean;
  followers: number;
  schedule: string[];
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  image?: string;
  createdAt: string;
  featured: boolean;
}

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // If not admin, redirect to home
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin page",
        variant: "destructive",
      });
    }
  }, [currentUser, navigate, toast]);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState("analytics");
  
  // User management state
  const [userFilter, setUserFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  
  // Rental requests state
  const [rentalFilter, setRentalFilter] = useState("");
  const [rentalStatusFilter, setRentalStatusFilter] = useState<string>("all");
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalRequest | null>(null);
  
  // Streamer management state
  const [streamerFilter, setStreamerFilter] = useState("");
  const [streamerDialogOpen, setStreamerDialogOpen] = useState(false);
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
  
  // News management state
  const [newsFilter, setNewsFilter] = useState("");
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      return await res.json();
    }
  });
  
  // Fetch rental requests
  const { data: rentalRequests = [], isLoading: isLoadingRentals } = useQuery<RentalRequest[]>({
    queryKey: ['/api/admin/rental-requests'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/rental-requests');
      return await res.json();
    }
  });
  
  // Fetch streamers
  const { data: streamers = [], isLoading: isLoadingStreamers } = useQuery<Streamer[]>({
    queryKey: ['/api/streamers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/streamers');
      return await res.json();
    }
  });
  
  // Fetch news
  const { data: news = [], isLoading: isLoadingNews } = useQuery<NewsItem[]>({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/news');
      return await res.json();
    }
  });
  
  // Filtered users
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userFilter.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(userFilter.toLowerCase())) ||
    user.email.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  // Filtered rental requests
  const filteredRentals = rentalRequests.filter(request => {
    const matchesFilter = 
      request.username.toLowerCase().includes(rentalFilter.toLowerCase()) ||
      request.itemName.toLowerCase().includes(rentalFilter.toLowerCase()) ||
      request.itemType.toLowerCase().includes(rentalFilter.toLowerCase());
      
    const matchesStatus = rentalStatusFilter === 'all' || request.status === rentalStatusFilter;
    
    return matchesFilter && matchesStatus;
  });
  
  // Filtered streamers
  const filteredStreamers = streamers.filter(streamer => 
    streamer.username.toLowerCase().includes(streamerFilter.toLowerCase())
  );
  
  // Filtered news
  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(newsFilter.toLowerCase()) ||
    item.content.toLowerCase().includes(newsFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(newsFilter.toLowerCase())
  );
  
  // Handle rental approval
  const approveRentalMutation = useMutation({
    mutationFn: async (rentalId: number) => {
      await apiRequest('PATCH', `/api/admin/rental-requests/${rentalId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rental-requests'] });
      setApprovalDialogOpen(false);
      toast({
        title: "Rental Approved",
        description: `The rental request has been approved successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Could not approve rental request",
        variant: "destructive"
      });
    }
  });
  
  // Handle rental rejection
  const rejectRentalMutation = useMutation({
    mutationFn: async (rentalId: number) => {
      await apiRequest('PATCH', `/api/admin/rental-requests/${rentalId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rental-requests'] });
      setRejectionDialogOpen(false);
      toast({
        title: "Rental Rejected",
        description: `The rental request has been rejected`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Could not reject rental request",
        variant: "destructive"
      });
    }
  });
  
  // Handle user edit
  const userEditSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email"),
    fullName: z.string().optional(),
    guild: z.string().optional(),
  });
  
  const userEditForm = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      guild: "",
    },
  });
  
  // Handle news edit
  const newsEditSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    featured: z.boolean().default(false),
  });
  
  const newsEditForm = useForm<z.infer<typeof newsEditSchema>>({
    resolver: zodResolver(newsEditSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      featured: false,
    },
  });
  
  // Handle streamer schedule edit
  const streamerScheduleSchema = z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
  });
  
  const streamerScheduleForm = useForm<z.infer<typeof streamerScheduleSchema>>({
    resolver: zodResolver(streamerScheduleSchema),
    defaultValues: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });
  
  // Open dialog to edit user
  const openUserEditDialog = (user: User) => {
    setSelectedUser(user);
    userEditForm.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      guild: user.guild || "",
    });
    setUserDialogOpen(true);
  };
  
  // Open dialog to edit streamer schedule
  const openScheduleDialog = (streamer: Streamer) => {
    setSelectedStreamer(streamer);
    
    // Parse schedule into form values
    const days = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    
    streamer.schedule.forEach(day => {
      const lowerDay = day.toLowerCase();
      if (lowerDay in days) {
        // @ts-ignore: Dynamic key
        days[lowerDay] = true;
      }
    });
    
    streamerScheduleForm.reset(days);
    setStreamerDialogOpen(true);
  };
  
  // Open dialog to edit news
  const openNewsDialog = (newsItem?: NewsItem) => {
    if (newsItem) {
      setSelectedNews(newsItem);
      newsEditForm.reset({
        title: newsItem.title,
        content: newsItem.content,
        category: newsItem.category,
        featured: newsItem.featured,
      });
    } else {
      setSelectedNews(null);
      newsEditForm.reset({
        title: "",
        content: "",
        category: "",
        featured: false,
      });
    }
    setNewsDialogOpen(true);
  };
  
  // Update user
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userEditSchema>) => {
      if (!selectedUser) return;
      await apiRequest('PATCH', `/api/admin/users/${selectedUser.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setUserDialogOpen(false);
      toast({
        title: "User Updated",
        description: `${selectedUser?.username}'s information has been updated`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update user",
        variant: "destructive"
      });
    }
  });
  
  // Update streamer schedule
  const updateStreamerScheduleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof streamerScheduleSchema>) => {
      if (!selectedStreamer) return;
      
      // Convert boolean values to array of days
      const schedule = Object.entries(data)
        .filter(([_, value]) => value)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
      
      await apiRequest('PATCH', `/api/streamers/${selectedStreamer.id}/schedule`, { schedule });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/streamers'] });
      setStreamerDialogOpen(false);
      toast({
        title: "Schedule Updated",
        description: `${selectedStreamer?.username}'s streaming schedule has been updated`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update streaming schedule",
        variant: "destructive"
      });
    }
  });
  
  // Create/Update news
  const saveNewsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newsEditSchema>) => {
      if (selectedNews) {
        // Update existing news
        await apiRequest('PATCH', `/api/news/${selectedNews.id}`, data);
      } else {
        // Create new news item
        await apiRequest('POST', '/api/news', {
          ...data,
          author: currentUser?.username || "Admin",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setNewsDialogOpen(false);
      toast({
        title: selectedNews ? "News Updated" : "News Created",
        description: selectedNews 
          ? `The news article has been updated successfully` 
          : `The news article has been created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: selectedNews ? "Update Failed" : "Creation Failed",
        description: error.message || `Could not ${selectedNews ? 'update' : 'create'} news article`,
        variant: "destructive"
      });
    }
  });
  
  // Delete news
  const deleteNewsMutation = useMutation({
    mutationFn: async (newsId: number) => {
      await apiRequest('DELETE', `/api/news/${newsId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "News Deleted",
        description: "The news article has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete news article",
        variant: "destructive"
      });
    }
  });
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[hsl(var(--cwg-dark))] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-orange))]" />
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-[hsl(var(--cwg-dark))]">
      {/* Header section */}
      <section className="bg-gradient-to-r from-[hsl(var(--cwg-dark-blue))] to-[hsl(var(--cwg-dark))] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-[hsl(var(--cwg-orange))]">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-[hsl(var(--cwg-muted))]">
                Welcome back, {currentUser.username}
              </p>
            </div>
            
            <div className="flex items-center mt-4 lg:mt-0">
              <Button variant="secondary" className="flex items-center gap-2 mr-4" onClick={() => navigate('/notifications')}>
                <Bell size={16} />
                <span>Notifications</span>
              </Button>
              <Button className="flex items-center gap-2" onClick={() => navigate('/')}>
                Back to Site
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[hsla(var(--cwg-dark-blue))] p-4 rounded-xl border border-[hsl(var(--cwg-blue))/30]">
              <div className="flex items-center">
                <div className="bg-[hsl(var(--cwg-blue))]/20 p-3 rounded-full mr-4">
                  <Users className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Total Users</p>
                  <h3 className="text-xl font-semibold">{users.length}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-[hsla(var(--cwg-dark-blue))] p-4 rounded-xl border border-[hsl(var(--cwg-orange))/30]">
              <div className="flex items-center">
                <div className="bg-[hsl(var(--cwg-orange))]/20 p-3 rounded-full mr-4">
                  <Activity className="h-5 w-5 text-[hsl(var(--cwg-orange))]" />
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Active Streamers</p>
                  <h3 className="text-xl font-semibold">{streamers.filter(s => s.isLive).length}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-[hsla(var(--cwg-dark-blue))] p-4 rounded-xl border border-[hsl(var(--cwg-green))/30]">
              <div className="flex items-center">
                <div className="bg-[hsl(var(--cwg-green))]/20 p-3 rounded-full mr-4">
                  <Package className="h-5 w-5 text-[hsl(var(--cwg-green))]" />
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Pending Rentals</p>
                  <h3 className="text-xl font-semibold">{rentalRequests.filter(r => r.status === 'pending').length}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-[hsla(var(--cwg-dark-blue))] p-4 rounded-xl border border-[hsl(var(--cwg-blue))/30]">
              <div className="flex items-center">
                <div className="bg-[hsl(var(--cwg-blue))]/20 p-3 rounded-full mr-4">
                  <FileText className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">News Articles</p>
                  <h3 className="text-xl font-semibold">{news.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Admin section */}
      <section className="py-12 bg-[hsl(var(--cwg-dark))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs 
            defaultValue="analytics" 
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
                    <p>No users found matching your search criteria.</p>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">Rental Requests</h2>
                  <div className="flex gap-4 w-full md:w-auto">
                    <Select value={rentalStatusFilter} onValueChange={setRentalStatusFilter}>
                      <SelectTrigger className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                      <Input 
                        type="text"
                        placeholder="Search rentals..."
                        value={rentalFilter}
                        onChange={(e) => setRentalFilter(e.target.value)}
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </div>
                  </div>
                </div>
                
                {isLoadingRentals ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                  </div>
                ) : filteredRentals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRentals.map((rental) => (
                          <TableRow key={rental.id} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                            <TableCell>{rental.id}</TableCell>
                            <TableCell className="font-medium">{rental.username}</TableCell>
                            <TableCell>{rental.itemName}</TableCell>
                            <TableCell>{rental.itemType}</TableCell>
                            <TableCell>{rental.price} {rental.currency}</TableCell>
                            <TableCell>{rental.rentalPeriod}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                rental.status === "approved" 
                                  ? "bg-green-500/20 text-green-500 font-medium"
                                  : rental.status === "rejected"
                                  ? "bg-red-500/20 text-red-500 font-medium"
                                  : "bg-amber-500/20 text-amber-500 font-medium"
                              }`}>
                                {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{format(new Date(rental.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              {rental.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-green-500 text-green-500"
                                    onClick={() => {
                                      setSelectedRental(rental);
                                      setApprovalDialogOpen(true);
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-red-500 text-red-500"
                                    onClick={() => {
                                      setSelectedRental(rental);
                                      setRejectionDialogOpen(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {rental.status !== 'pending' && (
                                <Badge variant={rental.status === 'approved' ? 'success' : 'destructive'}>
                                  {rental.status === 'approved' ? 'Approved' : 'Rejected'}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p>No rental requests found matching your criteria.</p>
                    <button 
                      onClick={() => {
                        setRentalFilter("");
                        setRentalStatusFilter("all");
                      }}
                      className="mt-4 text-[hsl(var(--cwg-orange))]"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Streamers Tab */}
            <TabsContent value="streamers">
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
                          <TableHead>Username</TableHead>
                          <TableHead>Twitch ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Followers</TableHead>
                          <TableHead>Streaming Days</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStreamers.map((streamer) => (
                          <TableRow key={streamer.id} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                            <TableCell>{streamer.id}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={streamer.profileImage} />
                                  <AvatarFallback className="bg-[hsl(var(--cwg-orange))]">
                                    {streamer.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {streamer.username}
                              </div>
                            </TableCell>
                            <TableCell>{streamer.twitchId || "Not linked"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                streamer.isLive 
                                  ? "bg-green-500/20 text-green-500 font-medium"
                                  : "bg-[hsl(var(--cwg-muted))]/20 text-[hsl(var(--cwg-muted))]"
                              }`}>
                                {streamer.isLive ? "Live Now" : "Offline"}
                              </span>
                            </TableCell>
                            <TableCell>{streamer.followers.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {streamer.schedule.length > 0 ? (
                                  streamer.schedule.map((day, index) => (
                                    <span key={index} className="px-2 py-1 text-xs bg-[hsl(var(--cwg-dark-blue))] rounded-full">
                                      {day}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[hsl(var(--cwg-muted))] text-xs">No schedule set</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]"
                                onClick={() => openScheduleDialog(streamer)}
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Edit Schedule
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p>No streamers found matching your search criteria.</p>
                    <button 
                      onClick={() => setStreamerFilter("")}
                      className="mt-4 text-[hsl(var(--cwg-orange))]"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* News Management Tab */}
            <TabsContent value="news">
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">News Management</h2>
                  <div className="flex gap-4">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                      <Input 
                        type="text"
                        placeholder="Search news..."
                        value={newsFilter}
                        onChange={(e) => setNewsFilter(e.target.value)}
                        className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </div>
                    <Button 
                      className="flex items-center gap-1"
                      onClick={() => openNewsDialog()}
                    >
                      <PlusCircle className="h-4 w-4" /> 
                      Add Article
                    </Button>
                  </div>
                </div>
                
                {isLoadingNews ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                  </div>
                ) : filteredNews.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNews.map((newsItem) => (
                          <TableRow key={newsItem.id} className="hover:bg-[hsl(var(--cwg-dark-blue))]/50">
                            <TableCell>{newsItem.id}</TableCell>
                            <TableCell className="font-medium max-w-[300px] truncate">{newsItem.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize bg-[hsl(var(--cwg-dark-blue))]">
                                {newsItem.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{newsItem.author}</TableCell>
                            <TableCell>{format(new Date(newsItem.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              {newsItem.featured ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-[hsl(var(--cwg-orange))]/20 text-[hsl(var(--cwg-orange))]">
                                  Featured
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-[hsl(var(--cwg-muted))]/20 text-[hsl(var(--cwg-muted))]">
                                  Standard
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]"
                                  onClick={() => openNewsDialog(newsItem)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-red-500 text-red-500"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${newsItem.title}"?`)) {
                                      deleteNewsMutation.mutate(newsItem.id);
                                    }
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
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
                    <p>No news articles found matching your search criteria.</p>
                    <button 
                      onClick={() => setNewsFilter("")}
                      className="mt-4 text-[hsl(var(--cwg-orange))]"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Messages Tab */}
            <TabsContent value="messages">
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">System Messages</h2>
                </div>
                
                <div className="text-center py-16">
                  <p>Message management functionality is coming soon.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* User Edit Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--cwg-blue))] font-orbitron">Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...userEditForm}>
            <form onSubmit={userEditForm.handleSubmit((data) => updateUserMutation.mutate(data))} className="space-y-4">
              <FormField
                control={userEditForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Username" 
                        {...field} 
                        className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userEditForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email" 
                        {...field} 
                        className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userEditForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full Name" 
                        {...field} 
                        className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userEditForm.control}
                name="guild"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guild</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Guild" 
                        {...field} 
                        className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      The guild this user belongs to
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="w-full">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Streamer Schedule Dialog */}
      <Dialog open={streamerDialogOpen} onOpenChange={setStreamerDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--cwg-blue))] font-orbitron">Edit Streaming Schedule</DialogTitle>
            <DialogDescription>
              Set streaming days for {selectedStreamer?.username}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...streamerScheduleForm}>
            <form onSubmit={streamerScheduleForm.handleSubmit((data) => updateStreamerScheduleMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={streamerScheduleForm.control}
                  name="monday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Monday</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={streamerScheduleForm.control}
                  name="tuesday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Tuesday</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={streamerScheduleForm.control}
                  name="wednesday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Wednesday</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={streamerScheduleForm.control}
                  name="thursday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Thursday</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={streamerScheduleForm.control}
                  name="friday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Friday</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={streamerScheduleForm.control}
                  name="saturday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Saturday</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={streamerScheduleForm.control}
                  name="sunday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <FormLabel>Sunday</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="w-full">Save Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* News Edit Dialog */}
      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--cwg-blue))] font-orbitron">
              {selectedNews ? 'Edit News Article' : 'Create News Article'}
            </DialogTitle>
            <DialogDescription>
              {selectedNews ? 'Update existing news article' : 'Create a new news article for the platform'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newsEditForm}>
            <form onSubmit={newsEditForm.handleSubmit((data) => saveNewsMutation.mutate(data))} className="space-y-4">
              <FormField
                control={newsEditForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="News title" 
                        {...field} 
                        className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsEditForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsEditForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="News content" 
                        {...field} 
                        rows={10}
                        className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsEditForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-md">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Feature this article</FormLabel>
                      <FormDescription>
                        Featured articles will be displayed prominently on the homepage
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setNewsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedNews ? 'Update Article' : 'Create Article'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--cwg-blue))] font-orbitron">Approve Rental Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this rental request?
            </DialogDescription>
          </DialogHeader>
          
          {selectedRental && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">User</p>
                  <p className="font-medium">{selectedRental.username}</p>
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Item</p>
                  <p className="font-medium">{selectedRental.itemName}</p>
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Price</p>
                  <p className="font-medium">{selectedRental.price} {selectedRental.currency}</p>
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Period</p>
                  <p className="font-medium">{selectedRental.rentalPeriod}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedRental) {
                  approveRentalMutation.mutate(selectedRental.id);
                }
              }}
            >
              Approve Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--cwg-blue))] font-orbitron">Reject Rental Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this rental request?
            </DialogDescription>
          </DialogHeader>
          
          {selectedRental && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">User</p>
                  <p className="font-medium">{selectedRental.username}</p>
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Item</p>
                  <p className="font-medium">{selectedRental.itemName}</p>
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Price</p>
                  <p className="font-medium">{selectedRental.price} {selectedRental.currency}</p>
                </div>
                <div>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm">Period</p>
                  <p className="font-medium">{selectedRental.rentalPeriod}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedRental) {
                  rejectRentalMutation.mutate(selectedRental.id);
                }
              }}
            >
              Reject Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, RentalRequest, News } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  XCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [userFilter, setUserFilter] = useState("");
  const [rentalFilter, setRentalFilter] = useState("");
  const [streamerFilter, setStreamerFilter] = useState("");
  const { toast } = useToast();
  
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
  const { data: streamers = [], isLoading: isLoadingStreamers } = useQuery({
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
    (streamer.description && streamer.description.toLowerCase().includes(streamerFilter.toLowerCase())) ||
    (streamer.game && streamer.game.toLowerCase().includes(streamerFilter.toLowerCase()))
  );
  
  // Handle rental request status change
  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/rental-requests/${requestId}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rental-requests"] });
      
      toast({
        title: "Status updated",
        description: `Request #${requestId} status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "An error occurred while updating the request status",
        variant: "destructive",
      });
    }
  };
  
  // Create new news post
  const [newNewsPost, setNewNewsPost] = useState({
    title: "",
    content: "",
    category: "",
    isSubmitting: false
  });
  
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
      // Use the first user ID as the author for now
      const authorId = users.length > 0 ? users[0].id : 1;
      
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
                            <TableHead>Admin</TableHead>
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
                                {user.isAdmin ? (
                                  <Check className="text-green-500 h-5 w-5" />
                                ) : (
                                  <X className="text-[hsl(var(--cwg-muted))] h-5 w-5" />
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" className="h-8 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
                                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
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
                                        onClick={() => handleStatusChange(request.id, "rejected")}
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
                    <Button className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))]/90">
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
                              <TableCell>{streamer.game || "N/A"}</TableCell>
                              <TableCell>{streamer.platform || "N/A"}</TableCell>
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
                                  <Button variant="outline" size="sm" className="h-8 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
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
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-6">Contact Messages</h2>
                  
                  <div className="text-center py-16">
                    <MessageSquare className="mx-auto h-16 w-16 text-[hsl(var(--cwg-muted))] mb-4" />
                    <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">
                      Contact Form Integration
                    </h3>
                    <p className="text-[hsl(var(--cwg-muted))] max-w-lg mx-auto">
                      Messages from the contact form will appear here. Setup your contact form to store messages in the database.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

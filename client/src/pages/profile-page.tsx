import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWeb3 } from '@/hooks/use-web3';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  User, 
  Users,
  Copy,
  Pencil, 
  Shield, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  Wallet, 
  UserCircle2, 
  Loader2, 
  CheckCircle,
  CheckCircle2, 
  Settings,
  Save
} from 'lucide-react';
import { formatEthereumAddress } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLocation } from 'wouter';
import StreamerTwitchIntegration from "@/components/streamers/StreamerTwitchIntegration";
import TwitchStreamerStatus from "@/components/streamers/TwitchStreamerStatus";

// Form schema validation
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }).max(30, {
    message: 'Username cannot be longer than 30 characters.',
  }),
  displayName: z.string().max(50, {
    message: 'Display name cannot be longer than 50 characters.',
  }).optional(),
  bio: z.string().max(500, {
    message: 'Bio cannot be longer than 500 characters.',
  }).optional(),
  // Removed email field since it's already in registration
  avatar: z.string().optional(), // Removed URL validation to allow file uploads
  discordUsername: z.string().max(50).optional(),
  twitterUsername: z.string().max(50).optional(),
  twitchUsername: z.string().max(50).optional(),
  kickUsername: z.string().max(50).optional(),
  youtubeChannel: z.string().max(100).optional(),
  gameIds: z.array(z.string()).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    showWalletAddress: z.boolean().default(false),
    darkMode: z.boolean().default(true),
  })
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// List of games supported by the platform
const SUPPORTED_GAMES = [
  { id: 'boss-fighters', name: 'Boss Fighters' },
  { id: 'kokodi', name: 'KoKodi' },
  { id: 'nyan-heroes', name: 'Nyan Heroes' },
  { id: 'big-time', name: 'Big Time' },
  { id: 'worldshards', name: 'WorldShards' },
  { id: 'off-the-grid', name: 'Off The Grid' },
  { id: 'ravenquest', name: 'RavenQuest' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { account, balance } = useWeb3();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);
  
  // Fetch profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: () => apiRequest('GET', '/api/profile').then(res => res.json()),
    enabled: !!user,
  });
  
  // Setup form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      displayName: '',
      bio: '',
      avatar: '',
      discordUsername: '',
      twitterUsername: '',
      twitchUsername: '',
      kickUsername: '',
      youtubeChannel: '',
      gameIds: [],
      preferences: {
        emailNotifications: true,
        showWalletAddress: false,
        darkMode: true,
      }
    },
  });
  
  // Update form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      form.reset({
        username: user?.username || '',
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || '',
        discordUsername: profileData.discordUsername || '',
        twitterUsername: profileData.twitterUsername || '',
        twitchUsername: profileData.twitchUsername || '',
        kickUsername: profileData.kickUsername || '',
        youtubeChannel: profileData.youtubeChannel || '',
        gameIds: profileData.gameIds || [],
        preferences: {
          emailNotifications: profileData.preferences?.emailNotifications !== undefined 
            ? profileData.preferences.emailNotifications : true,
          showWalletAddress: profileData.preferences?.showWalletAddress !== undefined 
            ? profileData.preferences.showWalletAddress : false,
          darkMode: profileData.preferences?.darkMode !== undefined 
            ? profileData.preferences.darkMode : true,
        }
      });
    }
  }, [profileData, form, user]);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest('PUT', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "An error occurred while updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Generate referral code mutation
  const generateReferralCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/referrals/generate-code');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Referral Code Generated",
        description: "Your referral code has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate referral code",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--cwg-orange))]" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  const initialData = profileData || {
    displayName: '',
    avatar: '',
    bio: '',
    discordUsername: '',
    twitterUsername: '',
    twitchUsername: '',
    kickUsername: '',
    youtubeChannel: '',
    gameIds: [],
    preferences: {
      emailNotifications: true,
      showWalletAddress: false,
      darkMode: true,
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">
              Your Profile
            </h1>
            <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-3xl">
              Manage your personal information, gaming credentials, and notification preferences.
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-8"
            >
              <TabsList className="bg-[hsl(var(--cwg-dark-blue))] p-1 rounded-lg">
                <TabsTrigger 
                  value="profile" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="games" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Games
                </TabsTrigger>
                <TabsTrigger 
                  value="streaming" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Streaming
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Profile Overview Card */}
              <div className="lg:col-span-1">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] neon-card-orange">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[hsl(var(--cwg-orange))]">Profile Overview</CardTitle>
                      {!isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditing(true)}
                          className="hover:neon-text-orange"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4 border-2 border-[hsl(var(--cwg-purple))]">
                      <AvatarImage src={initialData.avatar || ''} alt={initialData.displayName || user?.username || 'User'} />
                      <AvatarFallback className="bg-[hsl(var(--cwg-purple-dark))] text-[hsl(var(--cwg-orange))]">
                        {user?.username ? user.username.substring(0, 2).toUpperCase() : 'CG'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-xl font-bold mb-1">{initialData.displayName || user?.username || 'User'}</h3>
                    <p className="text-sm text-[hsl(var(--cwg-muted))] mb-4">@{user?.username || 'user'}</p>
                    
                    {initialData.bio && (
                      <p className="text-sm text-center mb-4">{initialData.bio}</p>
                    )}
                    
                    <div className="w-full space-y-3 mt-2">
                      {account && initialData.preferences.showWalletAddress && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">Wallet</span>
                          <span className="text-sm font-mono">{formatEthereumAddress(account)}</span>
                        </div>
                      )}
                      
                      {initialData.discordUsername && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">Discord</span>
                          <span className="text-sm">{initialData.discordUsername}</span>
                        </div>
                      )}
                      
                      {initialData.twitterUsername && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">Twitter</span>
                          <span className="text-sm">{initialData.twitterUsername}</span>
                        </div>
                      )}
                      
                      {initialData.twitchUsername && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">Twitch</span>
                          <span className="text-sm">{initialData.twitchUsername}</span>
                        </div>
                      )}
                      
                      {initialData.kickUsername && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">Kick</span>
                          <span className="text-sm">{initialData.kickUsername}</span>
                        </div>
                      )}
                      
                      {initialData.youtubeChannel && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">YouTube</span>
                          <span className="text-sm">{initialData.youtubeChannel}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-center border-t border-[hsl(var(--cwg-border))] pt-4">
                    <div className="grid grid-cols-3 gap-4 w-full">
                      <div className="flex flex-col items-center">
                        <Trophy className="h-5 w-5 text-[hsl(var(--cwg-orange))] mb-1" />
                        <span className="text-xs">Level 12</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <Gamepad2 className="h-5 w-5 text-[hsl(var(--cwg-orange))] mb-1" />
                        <span className="text-xs">7 Games</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <Shield className="h-5 w-5 text-[hsl(var(--cwg-orange))] mb-1" />
                        <span className="text-xs">Pro Member</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Wallet Card */}
                {account && (
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] mt-6 neon-card-blue">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-blue))]">
                        <div className="flex items-center">
                          <Wallet className="h-5 w-5 mr-2" />
                          Wallet
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[hsl(var(--cwg-muted))]">Address</Label>
                          <div className="font-mono text-sm bg-[hsl(var(--cwg-dark))] p-2 rounded-md mt-1 overflow-x-auto">
                            {account}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-[hsl(var(--cwg-muted))]">Balance</Label>
                          <div className="font-medium text-lg mt-1">
                            {balance} ETH
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full hover:neon-text-blue" 
                          onClick={() => setLocation('/token-dashboard')}
                        >
                          View Token Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Referral Code Card */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] mt-6 neon-card-purple">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-purple))]">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Referrals
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[hsl(var(--cwg-muted))]">Your Referral Code</Label>
                        <div className="flex mt-1">
                          <Input 
                            value={user?.referralCode || 'Generate a code first'} 
                            readOnly 
                            className="rounded-r-none bg-[hsl(var(--cwg-dark))]"
                          />
                          <Button 
                            variant="outline" 
                            className="rounded-l-none border-l-0"
                            onClick={() => {
                              if (user?.referralCode) {
                                navigator.clipboard.writeText(user.referralCode);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "Referral code has been copied to your clipboard.",
                                });
                              }
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {!user?.referralCode && (
                        <Button 
                          onClick={() => generateReferralCodeMutation.mutate()}
                          disabled={generateReferralCodeMutation.isPending}
                          className="w-full hover:neon-text-purple"
                        >
                          {generateReferralCodeMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Referral Code'
                          )}
                        </Button>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <Label className="text-[hsl(var(--cwg-muted))]">Referrals Made</Label>
                          <span className="text-sm">5</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <Label className="text-[hsl(var(--cwg-muted))]">Points Earned</Label>
                          <span className="text-sm">250</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Edit Profile Form */}
              <div className="lg:col-span-2">
                <TabsContent value="profile" className="mt-0">
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] neon-card-orange">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-orange))]">
                        {isEditing ? 'Edit Profile' : 'Profile Details'}
                      </CardTitle>
                      <CardDescription>
                        {isEditing ? 'Update your profile information below' : 'View your profile information'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {isEditing ? (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[hsl(var(--cwg-text))]">Username</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-[hsl(var(--cwg-dark))]" readOnly />
                                    </FormControl>
                                    <FormDescription>
                                      Your unique username cannot be changed.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[hsl(var(--cwg-text))]">Display Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                    </FormControl>
                                    <FormDescription>
                                      This is how you'll appear to others.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[hsl(var(--cwg-text))]">Bio</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      className="bg-[hsl(var(--cwg-dark))] resize-none" 
                                      rows={4}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Tell others a bit about yourself.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="avatar"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[hsl(var(--cwg-text))]">Avatar URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                  </FormControl>
                                  <FormDescription>
                                    Enter the URL of your profile image.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Social Profiles</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="discordUsername"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[hsl(var(--cwg-text))]">Discord</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="twitterUsername"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[hsl(var(--cwg-text))]">Twitter</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="twitchUsername"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[hsl(var(--cwg-text))]">Twitch</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="kickUsername"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[hsl(var(--cwg-text))]">Kick</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="youtubeChannel"
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel className="text-[hsl(var(--cwg-text))]">YouTube Channel</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="bg-[hsl(var(--cwg-dark))]" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-4">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsEditing(false)}
                                className="hover:neon-text-orange"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={updateProfileMutation.isPending}
                                className="bg-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))/90] text-white hover:neon-glow"
                              >
                                {updateProfileMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label className="text-[hsl(var(--cwg-muted))]">Username</Label>
                              <div className="text-lg mt-1">{user?.username}</div>
                            </div>
                            
                            <div>
                              <Label className="text-[hsl(var(--cwg-muted))]">Display Name</Label>
                              <div className="text-lg mt-1">
                                {initialData.displayName || 'Not set'}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-[hsl(var(--cwg-muted))]">Bio</Label>
                            <div className="mt-1 prose max-w-none prose-invert">
                              {initialData.bio ? (
                                <p>{initialData.bio}</p>
                              ) : (
                                <p className="text-[hsl(var(--cwg-muted))]">No bio provided</p>
                              )}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Social Profiles</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Discord</Label>
                                <div className="mt-1">
                                  {initialData.discordUsername || 'Not linked'}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Twitter</Label>
                                <div className="mt-1">
                                  {initialData.twitterUsername || 'Not linked'}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Twitch</Label>
                                <div className="mt-1">
                                  {initialData.twitchUsername || 'Not linked'}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Kick</Label>
                                <div className="mt-1">
                                  {initialData.kickUsername || 'Not linked'}
                                </div>
                              </div>
                              
                              <div className="sm:col-span-2">
                                <Label className="text-[hsl(var(--cwg-muted))]">YouTube Channel</Label>
                                <div className="mt-1">
                                  {initialData.youtubeChannel || 'Not linked'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="games" className="mt-0">
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] neon-card-green">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-green))]">Gaming Profile</CardTitle>
                      <CardDescription>
                        Manage your games and gaming preferences
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <Label className="text-[hsl(var(--cwg-text))]">Games You Play</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            {SUPPORTED_GAMES.map((game) => (
                              <div
                                key={game.id}
                                className={`p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))] ${
                                  initialData.gameIds?.includes(game.id) 
                                    ? 'bg-[hsl(var(--cwg-green))/20]' 
                                    : 'bg-[hsl(var(--cwg-dark))]'
                                } flex items-center justify-between`}
                              >
                                <div className="flex items-center">
                                  <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--cwg-muted))]"></div>
                                  <span className="ml-3">{game.name}</span>
                                </div>
                                {initialData.gameIds?.includes(game.id) && (
                                  <CheckCircle className="h-5 w-5 text-[hsl(var(--cwg-green))]" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Gaming Achievements</h3>
                          <div className="space-y-4">
                            <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg flex justify-between items-center">
                              <div className="flex items-center">
                                <Trophy className="h-5 w-5 text-[hsl(var(--cwg-gold))] mr-3" />
                                <div>
                                  <span className="block font-medium">Golden Achiever</span>
                                  <span className="text-sm text-[hsl(var(--cwg-muted))]">Complete 10 weekly challenges</span>
                                </div>
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cwg-green))]" />
                            </div>
                            
                            <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg flex justify-between items-center">
                              <div className="flex items-center">
                                <Trophy className="h-5 w-5 text-[hsl(var(--cwg-silver))] mr-3" />
                                <div>
                                  <span className="block font-medium">Silver Streak</span>
                                  <span className="text-sm text-[hsl(var(--cwg-muted))]">Win 5 tournaments in a row</span>
                                </div>
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cwg-green))]" />
                            </div>
                            
                            <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg flex justify-between items-center">
                              <div className="flex items-center">
                                <Trophy className="h-5 w-5 text-[hsl(var(--cwg-bronze))] mr-3" />
                                <div>
                                  <span className="block font-medium">Web3 Explorer</span>
                                  <span className="text-sm text-[hsl(var(--cwg-muted))]">Connect your first crypto wallet</span>
                                </div>
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cwg-green))]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="streaming" className="mt-0">
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] neon-card-purple">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-purple))]">Streaming Integration</CardTitle>
                      <CardDescription>
                        Connect and manage your streaming accounts
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-6">
                        <StreamerTwitchIntegration />
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Streaming Status</h3>
                          <TwitchStreamerStatus username={initialData.twitchUsername || ''} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0">
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] neon-card-blue">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-blue))]">Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account preferences and settings
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Form {...form}>
                        <form className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Notification Preferences</h3>
                            
                            <FormField
                              control={form.control}
                              name="preferences.emailNotifications"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base text-[hsl(var(--cwg-text))]">
                                      Email Notifications
                                    </FormLabel>
                                    <FormDescription>
                                      Receive email notifications about important updates
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="preferences.showWalletAddress"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base text-[hsl(var(--cwg-text))]">
                                      Show Wallet Address
                                    </FormLabel>
                                    <FormDescription>
                                      Display your wallet address on your public profile
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="preferences.darkMode"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base text-[hsl(var(--cwg-text))]">
                                      Dark Mode
                                    </FormLabel>
                                    <FormDescription>
                                      Use dark mode for the application interface
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Account Actions</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Button 
                                type="button" 
                                variant="outline"
                                className="hover:neon-text-blue"
                              >
                                Change Password
                              </Button>
                              
                              <Button 
                                type="button" 
                                variant="outline"
                                className="hover:neon-text-blue"
                              >
                                Privacy Settings
                              </Button>
                              
                              <Button 
                                type="button" 
                                variant="outline"
                                className="hover:neon-text-blue"
                                onClick={() => setLocation('/admin')}
                              >
                                Admin Dashboard
                              </Button>
                              
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="hover:text-red-500"
                              >
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
              </div>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
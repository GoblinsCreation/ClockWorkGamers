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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--cwg-orange))]" />
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
    <div className="flex flex-col min-h-screen">
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
        
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview Card */}
              <div className="lg:col-span-1">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[hsl(var(--cwg-orange))]">Profile Overview</CardTitle>
                      {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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
                  <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] mt-6">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-orange))]">
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
                        
                        <Button variant="outline" className="w-full" onClick={() => setLocation('/token-dashboard')}>
                          View Token Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Referral Code Card */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] mt-6">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-orange))]">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Referral Program
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[hsl(var(--cwg-muted))]">Your Referral Code</Label>
                        {user?.referralCode ? (
                          <div className="font-mono text-sm bg-[hsl(var(--cwg-dark))] p-2 rounded-md mt-1 overflow-x-auto flex items-center justify-between">
                            <span>{user.referralCode}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(user.referralCode || '');
                                toast({
                                  title: "Copied!",
                                  description: "Referral code copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center">
                            <span className="text-[hsl(var(--cwg-muted))]">No referral code generated yet</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => {
                                generateReferralCodeMutation.mutate(undefined, {
                                  onSuccess: (data) => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                                    toast({
                                      title: "Success!",
                                      description: "Your referral code has been generated",
                                    });
                                  }
                                });
                              }}
                              disabled={generateReferralCodeMutation.isPending}
                            >
                              {generateReferralCodeMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>Generate</>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-[hsl(var(--cwg-muted))]">How it works</Label>
                        <p className="text-sm mt-1 text-[hsl(var(--cwg-muted))]">
                          Share your referral code with friends. When they register using your code, 
                          both of you will earn exclusive rewards and tokens!
                        </p>
                      </div>
                      
                      <Button 
                        variant="default" 
                        className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80" 
                        onClick={() => setLocation('/referrals')}
                      >
                        View My Referrals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-orange))]">
                      {isEditing ? 'Edit Profile' : 'Profile Details'}
                    </CardTitle>
                    {isEditing && (
                      <CardDescription>
                        Update your profile information and preferences
                      </CardDescription>
                    )}
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
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    This is your public username.
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
                                  <FormLabel>Display Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your display name" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    How you want to be called.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="avatar"
                              render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                  <FormLabel>Profile Image</FormLabel>
                                  <FormControl>
                                    <div className="flex flex-col space-y-2">
                                      {value && (
                                        <div className="relative w-24 h-24 mx-auto mb-2">
                                          <img 
                                            src={value} 
                                            alt="Avatar preview" 
                                            className="w-full h-full object-cover rounded-md border border-border"
                                          />
                                        </div>
                                      )}
                                      <Input 
                                        placeholder="Enter image URL or upload a file" 
                                        value={value || ''} 
                                        onChange={onChange}
                                        {...field} 
                                      />
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                      >
                                        Choose File
                                      </Button>
                                      <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Create a URL for the file
                                            const url = URL.createObjectURL(file);
                                            onChange(url);
                                          }
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Upload or link to your profile image. Supports JPG, PNG, and GIF.
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
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about yourself and your gaming experience..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Brief description visible on your profile.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Social Media Profiles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="discordUsername"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Discord Username</FormLabel>
                                    <FormControl>
                                      <Input placeholder="username#1234" {...field} />
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
                                    <FormLabel>Twitter Handle</FormLabel>
                                    <FormControl>
                                      <Input placeholder="username" {...field} />
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
                                    <FormLabel>Twitch Username</FormLabel>
                                    <FormControl>
                                      <Input placeholder="twitchusername" {...field} />
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
                                    <FormLabel>Kick Username</FormLabel>
                                    <FormControl>
                                      <Input placeholder="kickusername" {...field} />
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
                                    <FormLabel>YouTube Channel</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Channel name or URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Games</h3>
                            <div className="grid grid-cols-2 gap-4">
                              {SUPPORTED_GAMES.map((game) => (
                                <FormField
                                  key={game.id}
                                  control={form.control}
                                  name="gameIds"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={game.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              checked={field.value?.includes(game.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value || []), game.id])
                                                  : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== game.id
                                                    )
                                                  );
                                              }}
                                            />
                                            <Label className="cursor-pointer">{game.name}</Label>
                                          </div>
                                        </FormControl>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Preferences</h3>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="preferences.emailNotifications"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Email Notifications</FormLabel>
                                      <FormDescription>
                                        Receive email notifications about important updates.
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
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Show Wallet Address</FormLabel>
                                      <FormDescription>
                                        Display your wallet address on your public profile.
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
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Dark Mode</FormLabel>
                                      <FormDescription>
                                        Use dark theme throughout the application.
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
                          </div>
                          
                          <div className="flex justify-end space-x-4 pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsEditing(false);
                                form.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={updateProfileMutation.isPending}
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
                      <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                          <TabsTrigger value="info" className="flex items-center">
                            <UserCircle2 className="h-4 w-4 mr-2" />
                            Basic Info
                          </TabsTrigger>
                          <TabsTrigger value="social" className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Social
                          </TabsTrigger>
                          <TabsTrigger value="games" className="flex items-center">
                            <Gamepad2 className="h-4 w-4 mr-2" />
                            Games
                          </TabsTrigger>
                          <TabsTrigger value="streaming" className="flex items-center">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2 fill-current">
                              <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
                            </svg>
                            Streaming
                          </TabsTrigger>
                          <TabsTrigger value="preferences" className="flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Preferences
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="info" className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Username</Label>
                                <p className="font-medium">{initialData.username || "FrostiiGoblin"}</p>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Display Name</Label>
                                <p className="font-medium">{initialData.displayName || "FrostiiGoblin"}</p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Username</Label>
                                <p className="font-medium">{initialData.username || "FrostiiGoblin"}</p>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Display Name</Label>
                                <p className="font-medium">{initialData.displayName || "FrostiiGoblin"}</p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Biography</h3>
                            <p className="text-sm">{initialData.bio || 'No biography provided yet.'}</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="social" className="space-y-6">
                          <h3 className="text-lg font-medium mb-4">Social Media Profiles</h3>
                          
                          <div className="space-y-4">
                            {initialData.discordUsername || initialData.twitterUsername || 
                             initialData.twitchUsername || initialData.kickUsername || 
                             initialData.youtubeChannel ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {initialData.discordUsername && (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <h4 className="font-medium">Discord</h4>
                                      <p className="text-sm text-[hsl(var(--cwg-orange))]">
                                        {initialData.discordUsername}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {initialData.twitterUsername && (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <h4 className="font-medium">Twitter</h4>
                                      <p className="text-sm text-[hsl(var(--cwg-orange))]">
                                        {initialData.twitterUsername}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {initialData.twitchUsername && (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <h4 className="font-medium">Twitch</h4>
                                      <p className="text-sm text-[hsl(var(--cwg-orange))]">
                                        {initialData.twitchUsername}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {initialData.kickUsername && (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <h4 className="font-medium">Kick</h4>
                                      <p className="text-sm text-[hsl(var(--cwg-orange))]">
                                        {initialData.kickUsername}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {initialData.youtubeChannel && (
                                  <div className="flex items-center justify-between p-4 border rounded-lg md:col-span-2">
                                    <div>
                                      <h4 className="font-medium">YouTube</h4>
                                      <p className="text-sm text-[hsl(var(--cwg-orange))]">
                                        {initialData.youtubeChannel}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[hsl(var(--cwg-muted))]">No social media profiles added yet. Edit your profile to add your social media information.</p>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="games" className="space-y-6">
                          <h3 className="text-lg font-medium mb-4">Your Games</h3>
                          
                          {initialData.gameIds && initialData.gameIds.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {SUPPORTED_GAMES.filter(game => initialData.gameIds?.includes(game.id)).map(game => (
                                <Card key={game.id} className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-border))]">
                                  <CardContent className="pt-6">
                                    <div className="flex items-center">
                                      <Gamepad2 className="h-8 w-8 text-[hsl(var(--cwg-orange))] mr-3" />
                                      <div>
                                        <h4 className="font-medium">{game.name}</h4>
                                        <p className="text-xs text-[hsl(var(--cwg-muted))]">
                                          Connected
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[hsl(var(--cwg-muted))]">No games added to your profile yet. Edit your profile to add games.</p>
                          )}
                          
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-4">Available Games</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {SUPPORTED_GAMES.filter(game => !initialData.gameIds?.includes(game.id)).map(game => (
                                <Card key={game.id} className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-border))]">
                                  <CardContent className="pt-6">
                                    <div className="flex items-center">
                                      <Gamepad2 className="h-8 w-8 text-[hsl(var(--cwg-muted))] mr-3" />
                                      <div>
                                        <h4 className="font-medium">{game.name}</h4>
                                        <p className="text-xs text-[hsl(var(--cwg-muted))]">
                                          Not connected
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="streaming" className="space-y-6">
                          <h3 className="text-lg font-medium mb-4">Streaming Setup</h3>
                          
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="text-lg font-medium">Twitch Integration</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                  Connect your Twitch account to stream for ClockWork Gamers
                                </p>
                              </div>
                              
                              <TwitchStreamerStatus userId={user?.id} />
                            </div>
                            
                            <div className="mt-6">
                              <StreamerTwitchIntegration />
                            </div>
                            
                            <div className="mt-8">
                              <h4 className="text-lg font-medium mb-4">Streaming Benefits</h4>
                              <div className="space-y-4">
                                <div className="bg-[hsl(var(--cwg-dark-blue))]/30 p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                                  <div className="flex items-start">
                                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cwg-orange))] mt-0.5 mr-2" />
                                    <div>
                                      <h5 className="font-medium">Automatic status updates</h5>
                                      <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                        We'll automatically detect when you're live and update your status
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-[hsl(var(--cwg-dark-blue))]/30 p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                                  <div className="flex items-start">
                                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cwg-orange))] mt-0.5 mr-2" />
                                    <div>
                                      <h5 className="font-medium">Featured on the homepage</h5>
                                      <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                        When you're live, your stream will be featured in our live streamers section
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-[hsl(var(--cwg-dark-blue))]/30 p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                                  <div className="flex items-start">
                                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cwg-orange))] mt-0.5 mr-2" />
                                    <div>
                                      <h5 className="font-medium">Dedicated streamer profile</h5>
                                      <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                        Get a customizable streamer profile page that showcases your content
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="preferences" className="space-y-6">
                          <h3 className="text-lg font-medium mb-4">User Preferences</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">Email Notifications</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                  Receive email notifications about important updates.
                                </p>
                              </div>
                              <div className="flex items-center">
                                {initialData.preferences?.emailNotifications ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--cwg-muted))]"></div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">Show Wallet Address</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                  Display your wallet address on your public profile.
                                </p>
                              </div>
                              <div className="flex items-center">
                                {initialData.preferences?.showWalletAddress ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--cwg-muted))]"></div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">Dark Mode</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                                  Use dark theme throughout the application.
                                </p>
                              </div>
                              <div className="flex items-center">
                                {initialData.preferences?.darkMode ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--cwg-muted))]"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
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
  Pencil, 
  Shield, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  Wallet, 
  UserCircle2, 
  Loader2, 
  CheckCircle, 
  Save
} from 'lucide-react';
import { formatEthereumAddress } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLocation } from 'wouter';

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
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  avatar: z.string().url({
    message: 'Please enter a valid URL for your avatar.',
  }).optional(),
  discordUsername: z.string().max(50).optional(),
  twitterUsername: z.string().max(50).optional(),
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
      displayName: profileData?.displayName || '',
      bio: profileData?.bio || '',
      email: profileData?.email || '',
      avatar: profileData?.avatar || '',
      discordUsername: profileData?.discordUsername || '',
      twitterUsername: profileData?.twitterUsername || '',
      gameIds: profileData?.gameIds || [],
      preferences: {
        emailNotifications: profileData?.preferences?.emailNotifications || true,
        showWalletAddress: profileData?.preferences?.showWalletAddress || false,
        darkMode: profileData?.preferences?.darkMode || true,
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
        email: profileData.email || '',
        avatar: profileData.avatar || '',
        discordUsername: profileData.discordUsername || '',
        twitterUsername: profileData.twitterUsername || '',
        gameIds: profileData.gameIds || [],
        preferences: {
          emailNotifications: profileData.preferences?.emailNotifications || true,
          showWalletAddress: profileData.preferences?.showWalletAddress || false,
          darkMode: profileData.preferences?.darkMode || true,
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
    username: user.username,
    email: '',
    avatar: '',
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
                      <AvatarImage src={initialData.avatar || ''} alt={initialData.displayName || initialData.username} />
                      <AvatarFallback className="bg-[hsl(var(--cwg-purple-dark))] text-[hsl(var(--cwg-orange))]">
                        {initialData.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-xl font-bold mb-1">{initialData.displayName || initialData.username}</h3>
                    <p className="text-sm text-[hsl(var(--cwg-muted))] mb-4">@{initialData.username}</p>
                    
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
                      
                      {initialData.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--cwg-muted))]">Email</span>
                          <span className="text-sm">{initialData.email}</span>
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
                          <span className="text-sm">@{initialData.twitterUsername}</span>
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
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your.email@example.com" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Your contact email.
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
                                  <FormLabel>Avatar URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/avatar.png" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Link to your profile image.
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
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="info" className="flex items-center">
                            <UserCircle2 className="h-4 w-4 mr-2" />
                            Basic Info
                          </TabsTrigger>
                          <TabsTrigger value="games" className="flex items-center">
                            <Gamepad2 className="h-4 w-4 mr-2" />
                            Games
                          </TabsTrigger>
                          <TabsTrigger value="preferences" className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Preferences
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="info" className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Username</Label>
                                <p className="font-medium">{initialData.username}</p>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Display Name</Label>
                                <p className="font-medium">{initialData.displayName || '-'}</p>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Email</Label>
                                <p className="font-medium">{initialData.email || '-'}</p>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Avatar URL</Label>
                                <p className="font-medium text-xs break-all">{initialData.avatar || '-'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Social Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Discord</Label>
                                <p className="font-medium">{initialData.discordUsername || '-'}</p>
                              </div>
                              
                              <div>
                                <Label className="text-[hsl(var(--cwg-muted))]">Twitter</Label>
                                <p className="font-medium">{initialData.twitterUsername ? `@${initialData.twitterUsername}` : '-'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Biography</h3>
                            <p className="text-sm">{initialData.bio || 'No biography provided yet.'}</p>
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
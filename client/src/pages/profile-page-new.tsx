import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useWeb3 } from "@/lib/web3/Web3Provider";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import * as z from "zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons
import {
  User,
  UserCircle2,
  Gamepad2,
  Settings,
  Trophy,
  Shield,
  Users,
  Wallet,
  BookOpen,
  Copy,
  Loader2,
  Pencil,
  LogOut,
} from "lucide-react";

import { NeonCard } from "@/components/ui/animated-elements";

// Profile form schema
const profileFormSchema = z.object({
  username: z.string(),
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }).optional(),
  avatar: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  discordUsername: z.string().optional().or(z.literal("")),
  twitterUsername: z.string().optional().or(z.literal("")),
  twitchUsername: z.string().optional().or(z.literal("")),
  kickUsername: z.string().optional().or(z.literal("")),
  youtubeChannel: z.string().optional().or(z.literal("")),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    showWalletAddress: z.boolean().default(false),
    darkMode: z.boolean().default(true),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Helper to format Ethereum addresses
const formatEthereumAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { address: account, getBalance } = useWeb3();
  const [balance, setBalance] = useState<string>("0.00");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch Ethereum balance
  React.useEffect(() => {
    if (account && getBalance) {
      getBalance().then((balance) => {
        setBalance(balance);
      });
    }
  }, [account, getBalance]);

  // Initialize form with user data
  const initialData: ProfileFormValues = {
    username: user?.username || "",
    displayName: user?.displayName || user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatarUrl || "",
    discordUsername: user?.discordUsername || "",
    twitterUsername: user?.twitterUsername || "",
    twitchUsername: user?.twitchUsername || "",
    kickUsername: user?.kickUsername || "",
    youtubeChannel: user?.youtubeChannel || "",
    preferences: {
      emailNotifications: user?.emailNotifications || true,
      showWalletAddress: user?.showWalletAddress || false,
      darkMode: true,
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    // In a real implementation, this would call an API endpoint
    // to update the user's profile information
    console.log(data);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  // Simulated mutation for generating a referral code
  const generateReferralCodeMutation = {
    mutate: () => {
      setTimeout(() => {
        toast({
          title: "Referral code generated",
          description: "Your referral code has been generated successfully.",
        });
      }, 1000);
    },
    isPending: false,
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[hsl(var(--cwg-dark))]">
        <Card className="w-[350px] neon-card-blue">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>You need to be logged in to view your profile.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/auth")} className="w-full">Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1 
              className="text-3xl font-orbitron font-bold neon-text-orange"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Profile
            </motion.h1>
            <motion.p 
              className="mt-2 text-[hsl(var(--cwg-muted))] max-w-3xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Manage your personal information, gaming credentials, and notification preferences.
            </motion.p>
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
                <NeonCard color="orange" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
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
                </NeonCard>
                
                {/* Wallet Card */}
                {account && (
                  <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] mt-6">
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
                          onClick={() => setLocation('/web3-dashboard')}
                        >
                          View Web3 Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </NeonCard>
                )}
                
                {/* Referral Code Card */}
                <NeonCard color="purple" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] mt-6">
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
                </NeonCard>
              </div>
              
              {/* Edit Profile Form */}
              <div className="lg:col-span-2">
                <TabsContent value="profile" className="mt-0">
                  <NeonCard color="orange" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
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
                              >
                                Cancel
                              </Button>
                              <Button type="submit">
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Username</dt>
                                <dd className="mt-1 text-sm">{initialData.username}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Display Name</dt>
                                <dd className="mt-1 text-sm">{initialData.displayName}</dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Bio</dt>
                                <dd className="mt-1 text-sm">{initialData.bio || 'No bio provided'}</dd>
                              </div>
                            </dl>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Social Profiles</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Discord</dt>
                                <dd className="mt-1 text-sm">{initialData.discordUsername || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Twitter</dt>
                                <dd className="mt-1 text-sm">{initialData.twitterUsername || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Twitch</dt>
                                <dd className="mt-1 text-sm">{initialData.twitchUsername || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Kick</dt>
                                <dd className="mt-1 text-sm">{initialData.kickUsername || 'Not provided'}</dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-[hsl(var(--cwg-muted))]">YouTube Channel</dt>
                                <dd className="mt-1 text-sm">{initialData.youtubeChannel || 'Not provided'}</dd>
                              </div>
                            </dl>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditing(true)}
                              className="hover:neon-text-orange"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Profile
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </NeonCard>
                </TabsContent>
                
                <TabsContent value="games" className="mt-0">
                  <NeonCard color="green" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-green-500">Gaming Profiles</CardTitle>
                      <CardDescription>
                        Manage your gaming accounts and preferences
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Connected Games</h3>
                          <div className="grid grid-cols-1 gap-4">
                            {/* Game 1 */}
                            <div className="flex items-center p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="h-12 w-12 rounded-md bg-green-900 flex items-center justify-center mr-4">
                                <Gamepad2 className="h-6 w-6 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">Axie Infinity</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">Connected · Last played 2 days ago</p>
                              </div>
                              <Button variant="outline" size="sm">View</Button>
                            </div>
                            
                            {/* Game 2 */}
                            <div className="flex items-center p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="h-12 w-12 rounded-md bg-blue-900 flex items-center justify-center mr-4">
                                <Gamepad2 className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">The Sandbox</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">Connected · Last played 5 days ago</p>
                              </div>
                              <Button variant="outline" size="sm">View</Button>
                            </div>
                            
                            {/* Game 3 */}
                            <div className="flex items-center p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="h-12 w-12 rounded-md bg-purple-900 flex items-center justify-center mr-4">
                                <Gamepad2 className="h-6 w-6 text-purple-500" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">Decentraland</h4>
                                <p className="text-sm text-[hsl(var(--cwg-muted))]">Connected · Last played 1 week ago</p>
                              </div>
                              <Button variant="outline" size="sm">View</Button>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Button className="w-full" variant="outline">
                              Connect New Game
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Gaming Activity</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Hours Played</h4>
                              <p className="text-2xl font-bold">247</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Play-to-Earn Earnings</h4>
                              <p className="text-2xl font-bold">$1,234.56</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Achievement Completion</h4>
                              <div className="flex items-center mt-2">
                                <div className="w-full bg-[hsl(var(--cwg-dark))] rounded-full h-2.5 mr-2">
                                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                                <span className="text-sm">65%</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Next Reward</h4>
                              <p className="text-sm">100 CWG Tokens at Level 13</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </NeonCard>
                </TabsContent>
                
                <TabsContent value="streaming" className="mt-0">
                  <NeonCard color="purple" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-purple))]">Streaming Setup</CardTitle>
                      <CardDescription>
                        Manage your streaming accounts and preferences
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Connected Platforms</h3>
                          
                          {/* Twitch */}
                          <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg mb-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md bg-purple-900 flex items-center justify-center mr-4">
                                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-500" fill="currentColor">
                                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-medium">Twitch</h4>
                                  {initialData.twitchUsername ? (
                                    <p className="text-sm text-green-500">Connected as {initialData.twitchUsername}</p>
                                  ) : (
                                    <p className="text-sm text-[hsl(var(--cwg-muted))]">Not connected</p>
                                  )}
                                </div>
                              </div>
                              
                              <Button variant="outline" size="sm">
                                {initialData.twitchUsername ? 'Disconnect' : 'Connect'}
                              </Button>
                            </div>
                            
                            {initialData.twitchUsername && (
                              <div className="mt-4">
                                <div className="bg-[hsl(var(--cwg-dark-blue))] p-4 rounded-lg">
                                  <p className="text-[hsl(var(--cwg-muted))] mb-2">Twitch Channel: <span className="text-[hsl(var(--cwg-blue))]">{initialData.twitchUsername}</span></p>
                                  <p className="text-[hsl(var(--cwg-muted))]">Status: <span className="text-green-500">Connected</span></p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* YouTube */}
                          <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg mb-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md bg-red-900 flex items-center justify-center mr-4">
                                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-500" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-medium">YouTube</h4>
                                  {initialData.youtubeChannel ? (
                                    <p className="text-sm text-green-500">Connected as {initialData.youtubeChannel}</p>
                                  ) : (
                                    <p className="text-sm text-[hsl(var(--cwg-muted))]">Not connected</p>
                                  )}
                                </div>
                              </div>
                              
                              <Button variant="outline" size="sm">
                                {initialData.youtubeChannel ? 'Disconnect' : 'Connect'}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Kick */}
                          <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md bg-green-900 flex items-center justify-center mr-4">
                                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-500" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"></path>
                                    <path d="M15 8h-2.5v8H15V8zM11.5 8H9v8h2.5V8z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-medium">Kick</h4>
                                  {initialData.kickUsername ? (
                                    <p className="text-sm text-green-500">Connected as {initialData.kickUsername}</p>
                                  ) : (
                                    <p className="text-sm text-[hsl(var(--cwg-muted))]">Not connected</p>
                                  )}
                                </div>
                              </div>
                              
                              <Button variant="outline" size="sm">
                                {initialData.kickUsername ? 'Disconnect' : 'Connect'}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Streaming Benefits</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="flex items-center mb-2">
                                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                                <h4 className="font-medium">Guild Revenue Share</h4>
                              </div>
                              <p className="text-sm text-[hsl(var(--cwg-muted))]">Earn 5% of revenue from viewers who subscribe using your referral code.</p>
                            </div>
                            
                            <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="flex items-center mb-2">
                                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                                <h4 className="font-medium">Featured Streamers</h4>
                              </div>
                              <p className="text-sm text-[hsl(var(--cwg-muted))]">Get featured on the CWG homepage when you go live.</p>
                            </div>
                            
                            <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="flex items-center mb-2">
                                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                                <h4 className="font-medium">NFT Drops</h4>
                              </div>
                              <p className="text-sm text-[hsl(var(--cwg-muted))]">Access exclusive NFT drops for your viewers.</p>
                            </div>
                            
                            <div className="p-4 bg-[hsl(var(--cwg-dark))] rounded-lg">
                              <div className="flex items-center mb-2">
                                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                                <h4 className="font-medium">Promotional Support</h4>
                              </div>
                              <p className="text-sm text-[hsl(var(--cwg-muted))]">Get promoted across CWG social channels.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </NeonCard>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0">
                  <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
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
                  </NeonCard>
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
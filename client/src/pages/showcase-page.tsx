import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ShareButton } from '@/components/guild/ShareButton';
import { MemberLeaderboard } from '@/components/leaderboard/MemberLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Share2, Settings } from 'lucide-react';

// CWG Logo SVG Component
const CWGLogo = () => (
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-12 h-12"
  >
    <circle cx="60" cy="60" r="56" fill="#111827" stroke="#FF8800" strokeWidth="2" />
    <path d="M32 40H42L52 80H42L32 40Z" fill="#FF8800" />
    <path d="M58 40H68L78 80H68L58 40Z" fill="#1E40AF" />
    <path d="M84 40L60 80H70L94 40H84Z" fill="#FF8800" />
    <path d="M36 85H84" stroke="#FF8800" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function ShowcasePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('showcase');

  // Sample guild data
  const guildData = {
    name: 'ClockWork Gamers',
    description: 'A Web3 gaming guild connecting players, streamers, and creators',
    memberCount: 350,
    websiteUrl: window.location.origin,
    imageUrl: '/images/cwg-logo.png'
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-background border flex-shrink-0">
            <CWGLogo />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CWG Features Showcase</h1>
            <p className="text-muted-foreground">
              Explore our latest guild features and functionality
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ShareButton variant="outline" label="Share Guild" />
          <Button variant="default">
            <Users className="h-4 w-4 mr-2" />
            Join Guild
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="border-b">
          <div className="container flex-col md:flex-row flex items-start md:items-center py-4 md:py-0">
            <TabsList className="mr-auto">
              <TabsTrigger value="showcase">Features Showcase</TabsTrigger>
              <TabsTrigger value="leaderboard">Guild Leaderboard</TabsTrigger>
              <TabsTrigger value="integrations">Social Sharing</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="showcase" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customizable Chat Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Customizable Chat
                </CardTitle>
                <CardDescription>Chat widget with personalization options</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our chat system includes position control, theme options, transparency settings,
                  and font style customization.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline">Position Control</Badge>
                  <Badge variant="outline">Theme Options</Badge>
                  <Badge variant="outline">Transparency</Badge>
                  <Badge variant="outline">Font Styles</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => toast({
                  title: "Chat Widget",
                  description: "Click the chat icon in the bottom right corner to try it"
                })}>
                  Try Chat Widget
                </Button>
              </CardFooter>
            </Card>

            {/* Guild Sharing Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Guild Sharing
                </CardTitle>
                <CardDescription>One-click social media integration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share your guild on popular social platforms with customizable messages
                  and direct links to invite friends.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline">Twitter</Badge>
                  <Badge variant="outline">Facebook</Badge>
                  <Badge variant="outline">LinkedIn</Badge>
                  <Badge variant="outline">Email</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <ShareButton size="sm" variant="outline" />
              </CardFooter>
            </Card>

            {/* Leaderboard Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Gamified Leaderboard
                </CardTitle>
                <CardDescription>Interactive member rankings with gamification</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track achievements, points, activity, and referrals with our interactive
                  leaderboard system featuring badges and rewards.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline">Rankings</Badge>
                  <Badge variant="outline">Achievements</Badge>
                  <Badge variant="outline">Badges</Badge>
                  <Badge variant="outline">Rewards</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('leaderboard')}
                >
                  View Leaderboard
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CWG Feature Showcase</CardTitle>
                <CardDescription>
                  A collection of ClockWork Gamers' Web3 gaming platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  ClockWork Gamers is a comprehensive Web3 gaming platform that seamlessly 
                  integrates traditional gaming community features with blockchain technology.
                  This showcase demonstrates our latest features including:
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Interactive Chat System</strong> - A floating chat widget with 
                    customizable themes, positions, and appearance settings
                  </li>
                  <li>
                    <strong>Social Sharing</strong> - One-click guild sharing across multiple 
                    social platforms with customizable messages
                  </li>
                  <li>
                    <strong>Guild Leaderboard</strong> - Interactive member rankings with 
                    gamification elements, badges, and level rewards
                  </li>
                  <li>
                    <strong>Achievement System</strong> - Track user progress, unlock badges, 
                    and earn rewards
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <MemberLeaderboard />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guild Social Sharing</CardTitle>
              <CardDescription>
                Promote your guild across social platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Our social sharing tools make it easy to promote your guild and invite new 
                  members across multiple platforms. You can customize your message and share
                  directly to Twitter, Facebook, LinkedIn, or via email.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Share Features</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Multiple social platform support</li>
                      <li>• Customizable share messages</li>
                      <li>• Direct sharing links</li>
                      <li>• Copy to clipboard functionality</li>
                      <li>• Guild stats and information included</li>
                    </ul>
                  </div>
                  
                  <div className="sm:w-[300px] flex flex-col gap-3">
                    <h3 className="text-lg font-medium">Try it now</h3>
                    <ShareButton className="w-full" />
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Click the button above to open the share dialog and test the functionality.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievement Sharing</CardTitle>
                <CardDescription>Share your gaming milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  In addition to guild sharing, users can share individual achievements on social 
                  media. When you earn badges or complete guild achievements, you can share them 
                  with friends.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Share Achievement
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    View Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Program</CardTitle>
                <CardDescription>Invite friends and earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Our referral program allows you to earn points and exclusive rewards by inviting 
                  friends to join ClockWork Gamers. Each successful referral increases your ranking 
                  on the leaderboard.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    My Referral Link
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Referral Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
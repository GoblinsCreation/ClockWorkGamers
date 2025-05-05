import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Copy, Users, Award, Gift, ChevronRight, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Fetch referrals data
  const { data: referralsData, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['/api/referrals'],
    queryFn: () => apiRequest('GET', '/api/referrals').then(res => res.json()),
    enabled: !!user,
  });

  // Stats calculation (if data is available)
  const stats = {
    totalReferrals: referralsData?.length || 0,
    activeReferrals: referralsData?.filter((ref: any) => ref.status === 'active')?.length || 0,
    pendingRewards: referralsData?.filter((ref: any) => !ref.rewardClaimed)?.length || 0,
    totalRewards: referralsData?.length * 100 || 0, // Assuming 100 tokens per referral
  };

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Referral Program</h1>
            <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-3xl">
              Invite your friends to join ClockWork Gamers and earn rewards together.
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--cwg-orange))]">Your Referral Code</CardTitle>
                  <CardDescription>Share this code with your friends to earn rewards</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg flex items-center justify-between">
                    <div className="font-mono text-xl text-[hsl(var(--cwg-orange))]">
                      {user.referralCode || 'No referral code generated yet'}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!user.referralCode}
                        onClick={() => {
                          navigator.clipboard.writeText(user.referralCode || '');
                          toast({
                            title: "Copied!",
                            description: "Referral code copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      
                      <Button 
                        variant="default" 
                        size="sm"
                        disabled={!user.referralCode}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Join ClockWork Gamers',
                              text: `Use my referral code ${user.referralCode} to join ClockWork Gamers and earn rewards!`,
                              url: window.location.origin,
                            });
                          } else {
                            navigator.clipboard.writeText(
                              `Join ClockWork Gamers using my referral code: ${user.referralCode}! ${window.location.origin}`
                            );
                            toast({
                              title: "Copied share message!",
                              description: "Share text copied to clipboard",
                            });
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Referrals</p>
                      <h3 className="text-2xl font-bold">{stats.totalReferrals}</h3>
                    </div>
                    <Users className="h-8 w-8 text-[hsl(var(--cwg-orange))]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Active Referrals</p>
                      <h3 className="text-2xl font-bold">{stats.activeReferrals}</h3>
                    </div>
                    <Award className="h-8 w-8 text-[hsl(var(--cwg-orange))]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Pending Rewards</p>
                      <h3 className="text-2xl font-bold">{stats.pendingRewards}</h3>
                    </div>
                    <Gift className="h-8 w-8 text-[hsl(var(--cwg-orange))]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--cwg-muted))]">Total Tokens Earned</p>
                      <h3 className="text-2xl font-bold">{stats.totalRewards}</h3>
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center text-[hsl(var(--cwg-orange))] font-bold">
                      CWG
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="referrals">My Referrals</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-[hsl(var(--cwg-purple))] h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Share Your Code</h3>
                          <p className="text-[hsl(var(--cwg-muted))]">
                            Share your unique referral code with friends through social media, messaging apps, or email.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-[hsl(var(--cwg-purple))] h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Friends Register</h3>
                          <p className="text-[hsl(var(--cwg-muted))]">
                            When your friends register using your referral code, they'll become part of your referral network.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-[hsl(var(--cwg-purple))] h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Both Get Rewards</h3>
                          <p className="text-[hsl(var(--cwg-muted))]">
                            You earn 100 CWG tokens for each successful referral, and your friend gets 50 CWG tokens as a welcome bonus.
                          </p>
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Reward Tiers</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tier</TableHead>
                              <TableHead>Referrals Required</TableHead>
                              <TableHead>Token Bonus</TableHead>
                              <TableHead>Special Rewards</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Bronze</TableCell>
                              <TableCell>5+</TableCell>
                              <TableCell>500 CWG</TableCell>
                              <TableCell>Bronze Profile Badge</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Silver</TableCell>
                              <TableCell>15+</TableCell>
                              <TableCell>1500 CWG</TableCell>
                              <TableCell>Silver Profile Badge, Exclusive NFT</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Gold</TableCell>
                              <TableCell>30+</TableCell>
                              <TableCell>3000 CWG</TableCell>
                              <TableCell>Gold Profile Badge, Premium NFT, Access to VIP Events</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="referrals">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle>My Referrals</CardTitle>
                    <CardDescription>
                      People who joined using your referral code
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isLoadingReferrals ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-orange))]" />
                      </div>
                    ) : referralsData?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reward</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralsData.map((referral: any) => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-medium">{referral.referredUsername}</TableCell>
                              <TableCell>{referral.createdAt ? formatDistanceToNow(new Date(referral.createdAt), { addSuffix: true }) : 'Unknown'}</TableCell>
                              <TableCell>
                                <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                                  {referral.status === 'active' ? 'Active' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {referral.rewardClaimed ? (
                                  <Badge variant="outline" className="bg-[hsl(var(--cwg-success))] text-background">
                                    Claimed
                                  </Badge>
                                ) : (
                                  <Button variant="outline" size="sm">
                                    Claim
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-10">
                        <Users className="h-10 w-10 mx-auto mb-4 text-[hsl(var(--cwg-muted))]" />
                        <h3 className="text-lg font-medium">No referrals yet</h3>
                        <p className="text-[hsl(var(--cwg-muted))] mt-2 max-w-sm mx-auto">
                          Share your referral code with friends to start earning rewards.
                        </p>
                        <Button className="mt-4" onClick={() => setActiveTab('overview')}>
                          Learn How It Works
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rewards">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle>My Rewards</CardTitle>
                    <CardDescription>
                      Track and claim rewards from your referrals
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">Total Rewards Earned</h3>
                            <p className="text-[hsl(var(--cwg-orange))] font-bold text-3xl mt-1">
                              {stats.totalRewards} CWG
                            </p>
                          </div>
                          <div className="bg-[hsl(var(--cwg-purple))] p-3 rounded-lg">
                            <Award className="h-6 w-6" />
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[hsl(var(--cwg-muted))] text-sm">Available to Claim</p>
                            <p className="font-medium">{stats.pendingRewards * 100} CWG</p>
                          </div>
                          <div>
                            <p className="text-[hsl(var(--cwg-muted))] text-sm">Claimed</p>
                            <p className="font-medium">
                              {(stats.totalReferrals - stats.pendingRewards) * 100} CWG
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                        <h3 className="font-medium text-lg mb-2">Referral Tier Progress</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Bronze Tier</span>
                              <span className="text-sm">{stats.totalReferrals}/5</span>
                            </div>
                            <div className="w-full h-2 bg-[hsl(var(--cwg-border))] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[hsl(var(--cwg-orange))] rounded-full" 
                                style={{ width: `${Math.min(100, (stats.totalReferrals / 5) * 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Silver Tier</span>
                              <span className="text-sm">{stats.totalReferrals}/15</span>
                            </div>
                            <div className="w-full h-2 bg-[hsl(var(--cwg-border))] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[hsl(var(--cwg-orange))] rounded-full" 
                                style={{ width: `${Math.min(100, (stats.totalReferrals / 15) * 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Gold Tier</span>
                              <span className="text-sm">{stats.totalReferrals}/30</span>
                            </div>
                            <div className="w-full h-2 bg-[hsl(var(--cwg-border))] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[hsl(var(--cwg-orange))] rounded-full" 
                                style={{ width: `${Math.min(100, (stats.totalReferrals / 30) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4" variant="default" disabled={stats.pendingRewards === 0}>
                          Claim All Rewards
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCopy, Gift, Users, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Referral {
  id: number;
  referrerId: number;
  referredId: number;
  status: string;
  rewardClaimed: boolean;
  createdAt: string;
}

interface ReferredUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export default function ReferralSystem() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const { toast } = useToast();
  
  // Query for getting the user's referral code
  const { data: userReferralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['/api/referrals/my-code'],
    queryFn: async () => {
      if (!user) return null;
      try {
        // Check if user already has a referral code
        const response = await apiRequest('GET', `/api/referrals/my-code`);
        if (response.ok) {
          const data = await response.json();
          return data.referralCode;
        }
        return null;
      } catch (error) {
        console.error('Error fetching referral code:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Set the referral code state when data is loaded
  useEffect(() => {
    if (userReferralCode) {
      setReferralCode(userReferralCode);
    }
  }, [userReferralCode]);

  // Query for getting referrals (people who used the user's code)
  const { data: referrals = [], isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['/api/referrals'],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/referrals');
      const data = await response.json();
      return data as Referral[];
    },
    enabled: !!user,
  });

  // Query for getting referred users (more details about referred users)
  const { data: referredUsers = [], isLoading: isLoadingReferredUsers } = useQuery({
    queryKey: ['/api/referrals/users'],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/referrals/users');
      const data = await response.json();
      return data as ReferredUser[];
    },
    enabled: !!user,
  });

  // Mutation for generating a new referral code
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/referrals/generate-code');
      const data = await response.json();
      return data.referralCode;
    },
    onSuccess: (newCode) => {
      setReferralCode(newCode);
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/my-code'] });
      toast({
        title: 'Success',
        description: 'New referral code generated!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to generate code: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for using a referral code
  const useCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/referrals/use-code', { referralCode: code });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to use referral code');
      }
      return await response.json();
    },
    onSuccess: () => {
      setInputCode('');
      toast({
        title: 'Success',
        description: 'Referral code applied successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  const handleUseCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      useCodeMutation.mutate(inputCode.trim());
    }
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
    }
  };

  // If user is not authenticated
  if (!user) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>You need to be logged in to access the referral program.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Invite friends to join ClockWork Gamers and earn rewards when they join!
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="my-code">
        <TabsList className="mx-6">
          <TabsTrigger value="my-code">My Referral Code</TabsTrigger>
          <TabsTrigger value="use-code">Use a Code</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="my-code" className="mx-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label>Your Referral Code</Label>
                <div className="flex mt-1.5">
                  <Input
                    value={referralCode || "Generate a code first"}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                    disabled={!referralCode}
                    className="ml-2"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleGenerateCode}
                  disabled={generateCodeMutation.isPending}
                  className="w-full max-w-xs"
                >
                  {generateCodeMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate New Code</>
                  )}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm mt-4">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Generate your unique referral code</li>
                  <li>Share your code with friends</li>
                  <li>When they join using your code, you both earn rewards</li>
                  <li>Track your referrals and rewards in the "My Referrals" tab</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="use-code" className="mx-6">
          <CardContent className="pt-6">
            <form onSubmit={handleUseCode} className="space-y-4">
              <div>
                <Label htmlFor="referral-code">Enter Referral Code</Label>
                <Input
                  id="referral-code"
                  placeholder="e.g. USER123-ABC"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputCode.trim() || useCodeMutation.isPending}
                className="w-full"
              >
                {useCodeMutation.isPending ? "Processing..." : "Apply Code"}
              </Button>
            </form>
          </CardContent>
        </TabsContent>

        <TabsContent value="referrals" className="mx-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Your Referred Members</h3>
              </div>

              {isLoadingReferrals || isLoadingReferredUsers ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading referrals...</p>
                </div>
              ) : referredUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>You haven't referred anyone yet.</p>
                  <p className="text-sm mt-1">Share your code to start earning rewards!</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referredUsers.map((referredUser) => {
                        const referral = referrals.find(r => r.referredId === referredUser.id);
                        return (
                          <TableRow key={referredUser.id}>
                            <TableCell className="font-medium">{referredUser.username}</TableCell>
                            <TableCell>{referredUser.fullName}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                referral?.status === 'active' ? 'bg-green-100 text-green-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {referral?.status || 'pending'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {referral ? new Date(referral.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}

              <div className="bg-muted p-4 rounded-lg text-sm mt-4">
                <h4 className="font-medium mb-2">Rewards:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Earn 50 CWG tokens for each successful referral</li>
                  <li>Additional 5% commission on their first purchase</li>
                  <li>Special badge on your profile after 5 referrals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export default function StreamerTwitchIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLinking, setIsLinking] = useState(false);

  // Fetch streamer data to check if Twitch is connected
  const { data: streamer, isLoading } = useQuery({
    queryKey: ['/api/streamer/me'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/streamer/me');
        if (res.status === 404) {
          return { twitchId: null };
        }
        return res.json();
      } catch (error) {
        // If no streamer profile exists yet, return empty object
        return { twitchId: null };
      }
    },
    enabled: !!user,
  });

  const hasLinkedAccount = !!streamer?.twitchId;

  // Generate Twitch OAuth URL
  const linkTwitchAccount = async () => {
    setIsLinking(true);
    try {
      const res = await fetch('/api/twitch/auth-url');
      
      if (!res.ok) {
        throw new Error('Failed to generate authentication URL');
      }
      
      const { url } = await res.json();
      
      // Open new window for Twitch authentication
      const authWindow = window.open(url, 'twitchAuth', 'width=600,height=800');
      
      // Check for popup blocker
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        throw new Error('Please disable your popup blocker to connect with Twitch');
      }
      
      // Listen for OAuth callback via message event
      const handleCallback = async (event: MessageEvent) => {
        if (event.data && event.data.type === 'TWITCH_AUTH') {
          const { code, state } = event.data;
          
          // Call API to complete the auth
          const linkRes = await apiRequest('POST', '/api/twitch/link-account', {
            code,
            state
          });
          
          if (!linkRes.ok) {
            throw new Error('Failed to link Twitch account');
          }
          
          // Close the window
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          
          // Remove the event listener
          window.removeEventListener('message', handleCallback);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ['/api/streamer/me'],
          });
          
          toast({
            title: 'Success!',
            description: 'Your Twitch account has been connected',
            variant: 'default',
          });
        }
      };
      
      window.addEventListener('message', handleCallback);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect to Twitch',
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };
  
  // Mutation to disconnect Twitch account
  const unlinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/twitch/unlink-account');
      if (!response.ok) {
        throw new Error('Failed to unlink Twitch account');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/streamer/me'],
      });
      toast({
        title: 'Success!',
        description: 'Your Twitch account has been disconnected',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return (
    <Card className="border-2 border-[#9146FF]/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#9146FF]">
            <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
          </svg>
          Twitch Integration
        </CardTitle>
        <CardDescription>
          Connect your Twitch account to enable live streaming features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--cwg-muted))]" />
          </div>
        ) : hasLinkedAccount ? (
          <div className="bg-green-500/10 text-green-500 p-3 rounded flex items-center gap-2">
            <div className="rounded-full bg-green-500 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">Your Twitch account (<span className="font-medium">{streamer?.twitchId}</span>) is connected</p>
          </div>
        ) : (
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">Connect your Twitch account for automatic stream status updates</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {hasLinkedAccount ? (
          <Button 
            variant="outline" 
            className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={() => unlinkMutation.mutate()}
            disabled={unlinkMutation.isPending}
          >
            {unlinkMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect Twitch Account"
            )}
          </Button>
        ) : (
          <Button 
            className="w-full bg-[#9146FF] hover:bg-[#7d2ff4]"
            onClick={linkTwitchAccount}
            disabled={isLinking}
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Connect Twitch Account
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
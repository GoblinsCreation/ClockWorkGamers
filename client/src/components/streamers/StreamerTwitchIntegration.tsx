import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  Link as LinkIcon, 
  AlertTriangle, 
  Radio, 
  Clock, 
  Users, 
  ExternalLink,
  RefreshCw,
  GamepadIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';

export default function StreamerTwitchIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLinking, setIsLinking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch streamer data to check if Twitch is connected
  const { data: streamer, isLoading, refetch } = useQuery({
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
    refetchInterval: 60000, // Refetch every minute
  });

  const hasLinkedAccount = !!streamer?.twitchId;
  const isLive = streamer?.isLive || false;

  // Manually refresh streamer status
  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await apiRequest('GET', '/api/streamers/update-status');
      await refetch();
      toast({
        title: 'Status Updated',
        description: 'Your stream status has been refreshed',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh stream status',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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
            redirectUri: window.location.origin + '/twitch-callback',
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

  // Format stream duration
  const formatDuration = (startedAt: string) => {
    if (!startedAt) return 'N/A';
    
    try {
      const startTime = new Date(startedAt);
      return formatDistanceToNow(startTime, { addSuffix: false });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Card className="border-2 border-[#9146FF]/30 relative overflow-hidden">
      {/* Animated neon glow effect for live streamers */}
      {isLive && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9146FF] to-[#fa506e] opacity-75 blur-lg animate-pulse pointer-events-none"></div>
      )}
      
      <div className="relative bg-[hsl(var(--cwg-dark))] rounded-lg z-10">
        <CardHeader className={`pb-3 ${isLive ? 'bg-gradient-to-r from-[#9146FF]/20 to-[#fa506e]/20' : ''}`}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#9146FF]">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
              Twitch Integration
              
              {hasLinkedAccount && isLive && (
                <Badge variant="outline" className="ml-2 bg-red-500 text-white border-0 animate-pulse">
                  <Radio className="w-3 h-3 mr-1 fill-white" /> LIVE
                </Badge>
              )}
            </CardTitle>
            
            {hasLinkedAccount && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full h-8 w-8 p-0" 
                onClick={refreshStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            )}
          </div>
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {streamer.profileImageUrl ? (
                  <img 
                    src={streamer.profileImageUrl} 
                    alt={streamer.displayName} 
                    className="w-12 h-12 rounded-full border-2 border-[#9146FF]" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#9146FF]/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#9146FF]">
                      <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
                    </svg>
                  </div>
                )}
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {streamer.displayName}
                    <a 
                      href={`https://twitch.tv/${streamer.twitchId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#9146FF] hover:text-[#7d2ff4] inline-flex items-center"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="text-xs text-[hsl(var(--cwg-muted))]">
                    {streamer.twitchId}
                  </div>
                </div>
              </div>
              
              {isLive && (
                <div className="rounded-md border bg-card p-3 overflow-hidden">
                  {streamer.thumbnailUrl && (
                    <div className="relative mb-3 rounded-md overflow-hidden group">
                      <img 
                        src={streamer.thumbnailUrl} 
                        alt="Stream thumbnail" 
                        className="w-full h-auto rounded-md transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {streamer.viewerCount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  <h3 className="font-medium text-sm line-clamp-1 mb-1">
                    {streamer.streamTitle || "Untitled Stream"}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-[hsl(var(--cwg-muted))]">
                    <div className="flex items-center gap-1">
                      <GamepadIcon className="h-3 w-3" />
                      <span className="truncate">{streamer.currentGame || "No Game"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      <span>Live for {formatDuration(streamer.startedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!isLive && streamer.lastUpdated && (
                <div className="text-xs text-[hsl(var(--cwg-muted))] mt-2">
                  Last checked: {new Date(streamer.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#9146FF]/10 text-[#9146FF] p-3 rounded flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">Connect your Twitch account for automatic stream status updates</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {hasLinkedAccount ? (
            <div className="w-full space-y-3">
              {isLive && (
                <Button 
                  className="w-full bg-[#9146FF] hover:bg-[#7d2ff4]"
                  onClick={() => window.open(`https://twitch.tv/${streamer.twitchId}`, '_blank')}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-white">
                    <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
                  </svg>
                  Watch Stream
                </Button>
              )}
              
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
            </div>
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
      </div>
    </Card>
  );
}
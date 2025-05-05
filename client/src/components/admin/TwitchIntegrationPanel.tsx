import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Streamer } from '@shared/schema';

export function TwitchIntegrationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch streamers data with Twitch status
  const { data: streamers, isLoading, error } = useQuery<Streamer[]>({
    queryKey: ['/api/streamers'],
    queryFn: () => fetch('/api/streamers').then(res => res.json()),
  });
  
  // Mutation for updating streamer status via Twitch API
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/streamers/update-status');
      return response.json();
    },
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Streamer status has been updated from Twitch.',
        variant: 'default',
      });
      // Invalidate and refetch streamers data
      queryClient.invalidateQueries({ queryKey: ['/api/streamers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/streamers/live'] });
      setIsUpdating(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update streamer status: ${error.message}`,
        variant: 'destructive',
      });
      setIsUpdating(false);
    },
  });
  
  // Handle manual update button click
  const handleUpdateStatus = () => {
    updateStatusMutation.mutate();
  };
  
  // Count streamers with Twitch integration
  const streamersWithTwitch = streamers?.filter((s: Streamer) => s.twitchId).length || 0;
  const liveStreamers = streamers?.filter((s: Streamer) => s.isLive).length || 0;
  
  return (
    <Card className="w-full border-2 border-orange-500/20">
      <CardHeader className="bg-gradient-to-r from-blue-900/20 to-orange-900/20">
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://brand.twitch.tv/assets/images/platform-logo-white.png" 
            alt="Twitch Logo" 
            className="h-6" 
          />
          Twitch Integration Management
        </CardTitle>
        <CardDescription>
          Manage Twitch integration and streaming status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Integrated Streamers" 
              value={streamersWithTwitch} 
              description="Streamers with linked Twitch accounts"
              isLoading={isLoading}
            />
            
            <StatCard 
              title="Live Now" 
              value={liveStreamers} 
              description="Currently live streamers"
              isLoading={isLoading}
              highlight={liveStreamers > 0}
            />
            
            <StatCard 
              title="Last Update" 
              value={new Date().toLocaleTimeString()} 
              description="Automatic updates every 5 minutes"
              isLoading={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Manual Update</h3>
            <p className="text-sm text-muted-foreground">
              Twitch stream status is automatically updated every 5 minutes.
              You can manually update the status using the button below.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpdateStatus}
          disabled={isUpdating}
          className="flex items-center gap-2"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isUpdating ? 'Updating...' : 'Update Stream Status Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatCard({ 
  title, 
  value, 
  description, 
  isLoading = false,
  highlight = false
}: { 
  title: string;
  value: string | number;
  description: string;
  isLoading?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-red-500 bg-red-500/5' : ''}`}>
      <h4 className="text-sm font-medium">{title}</h4>
      
      {isLoading ? (
        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
      ) : (
        <div className="mt-1 flex items-center">
          <div className={`text-2xl font-bold ${highlight ? 'text-red-500' : ''}`}>
            {value}
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
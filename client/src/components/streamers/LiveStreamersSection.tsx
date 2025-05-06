import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Users, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function LiveStreamersSection() {
  // Query to fetch all currently live streamers
  const { data: liveStreamers, isLoading, error } = useQuery({
    queryKey: ['/api/streamers/live'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/streamers/live');
      if (!res.ok) throw new Error('Failed to fetch live streamers');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
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

  if (isLoading) {
    return (
      <div className="my-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-muted))]" />
      </div>
    );
  }

  if (error || !liveStreamers) {
    return (
      <div className="my-8 text-center text-[hsl(var(--cwg-muted))]">
        Failed to load live streamers.
      </div>
    );
  }

  if (liveStreamers.length === 0) {
    return (
      <div className="my-8 text-center">
        <div className="text-[hsl(var(--cwg-muted))] mb-2">No streamers are currently live.</div>
        <div className="text-sm text-[hsl(var(--cwg-muted-foreground))]">
          Check back later to catch your favorite CWG streamers!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
      {liveStreamers.map((streamer) => (
        <Card 
          key={streamer.id} 
          className="group overflow-hidden border border-[#9146FF]/30 relative"
        >
          {/* Animated neon glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9146FF] to-[#fa506e] opacity-75 blur-md animate-pulse pointer-events-none"></div>
          
          <div className="relative bg-[hsl(var(--cwg-dark))] rounded-lg z-10 h-full">
            <CardContent className="p-0">
              {streamer.thumbnailUrl && (
                <div className="relative overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={streamer.thumbnailUrl} 
                      alt={`${streamer.displayName} stream`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-red-500 text-white border-0 animate-pulse">
                      <Radio className="w-3 h-3 mr-1 fill-white" /> LIVE
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <Users className="h-3 w-3 mr-1.5" />
                    {streamer.viewerCount.toLocaleString()}
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {streamer.profileImageUrl ? (
                    <img 
                      src={streamer.profileImageUrl} 
                      alt={streamer.displayName} 
                      className="w-8 h-8 rounded-full border border-[#9146FF]" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#9146FF]/20 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#9146FF]">
                        <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-md">{streamer.displayName}</h3>
                    <div className="text-xs text-[hsl(var(--cwg-muted))]">
                      Live for {formatDuration(streamer.startedAt)}
                    </div>
                  </div>
                </div>
                
                <h4 className="text-sm mb-2 line-clamp-1 font-medium">{streamer.streamTitle || "Untitled Stream"}</h4>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-[hsl(var(--cwg-muted))] bg-[hsl(var(--cwg-muted))]/10 px-2 py-1 rounded">
                    {streamer.currentGame || "No Game"}
                  </div>
                  
                  <Button 
                    className="h-8 bg-[#9146FF] hover:bg-[#7d2ff4]"
                    onClick={() => window.open(`https://twitch.tv/${streamer.twitchId}`, '_blank')}
                    size="sm"
                  >
                    Watch
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
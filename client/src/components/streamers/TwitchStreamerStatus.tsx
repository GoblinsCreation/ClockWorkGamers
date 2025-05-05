import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TwitchStreamerStatusProps {
  userId?: number;
}

export default function TwitchStreamerStatus({ userId }: TwitchStreamerStatusProps) {
  // Fetch streamer data to check status
  const { data: streamer, isLoading } = useQuery({
    queryKey: ['/api/streamer/me'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/streamer/me');
        if (res.status === 404) {
          return null;
        }
        return res.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refetch every minute for live status
  });

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-[hsl(var(--cwg-muted))]" />
        <span className="text-sm text-[hsl(var(--cwg-muted))]">Checking status...</span>
      </div>
    );
  }

  if (!streamer || !streamer.twitchId) {
    return (
      <Badge variant="outline" className="bg-[hsl(var(--cwg-dark))] text-[hsl(var(--cwg-muted))]">
        Not Connected
      </Badge>
    );
  }

  if (streamer.isLive) {
    return (
      <Badge className="bg-red-500 text-white flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
        Live Now
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-[hsl(var(--cwg-dark-blue))] border-[#9146FF] text-[#9146FF]">
      Connected
    </Badge>
  );
}
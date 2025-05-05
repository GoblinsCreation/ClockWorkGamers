import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Streamer } from '@shared/schema';

export function LiveStreamers() {
  const { data: liveStreamers, isLoading, error } = useQuery({
    queryKey: ['/api/streamers/live'],
    queryFn: () => fetch('/api/streamers/live').then(res => res.json()),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minutes
  });

  if (isLoading) {
    return (
      <div className="mt-10 container">
        <h2 className="text-3xl font-bold mb-6">Live Streamers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden border-2 border-orange-400/20">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 container">
        <h2 className="text-3xl font-bold mb-6">Live Streamers</h2>
        <Card className="p-6 border-orange-400/20">
          <div className="flex flex-col items-center gap-2 text-center">
            <WifiOff className="h-12 w-12 text-orange-500" />
            <h3 className="text-xl font-semibold">Unable to load live streamers</h3>
            <p className="text-gray-500 dark:text-gray-400">
              There was an error connecting to the server. Please try again later.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!liveStreamers || liveStreamers.length === 0) {
    return (
      <div className="mt-10 container">
        <h2 className="text-3xl font-bold mb-6">Live Streamers</h2>
        <Card className="p-6 border-orange-400/20">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
              <WifiOff className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold">No Streamers Live</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back later to see when our guild members go live!
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-10 container">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <span className="relative mr-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        Live Streamers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(liveStreamers as (Streamer & { startedAt?: string; thumbnailUrl?: string; description?: string })[]).map((streamer) => (
          <StreamerCard key={streamer.id} streamer={streamer} />
        ))}
      </div>
    </div>
  );
}

interface StreamerCardProps {
  streamer: Streamer & {
    startedAt?: string;
    thumbnailUrl?: string;
    description?: string;
  }
}

function StreamerCard({ streamer }: StreamerCardProps) {
  const {
    id,
    displayName,
    twitchId,
    profileImageUrl,
    isLive,
    currentGame,
    viewerCount,
    streamTitle,
    thumbnailUrl
  } = streamer;

  return (
    <Card className={cn(
      "overflow-hidden transition-all border-2",
      isLive ? "border-red-500/50 shadow-lg shadow-red-500/10" : "border-gray-200 dark:border-gray-800"
    )}>
      <div className="aspect-video relative overflow-hidden bg-black">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`${displayName}'s stream`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/60 to-orange-900/60">
            <img 
              src={profileImageUrl || "https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe85943c7-profile_image-300x300.png"} 
              alt={displayName}
              className="w-24 h-24 rounded-full"
            />
          </div>
        )}
        
        {isLive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
            <span className="relative mr-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
            {viewerCount !== undefined && (
              <span className="ml-2">· {viewerCount} viewers</span>
            )}
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <img 
            src={profileImageUrl || "https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe85943c7-profile_image-300x300.png"} 
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
          <CardTitle className="text-xl truncate">{displayName}</CardTitle>
        </div>
        {currentGame && (
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            Playing: {currentGame}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        {streamTitle ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{streamTitle}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {isLive ? "No stream title" : "Currently offline"}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          asChild
        >
          <Link to={`/streamers/${id}`}>View Profile</Link>
        </Button>
        
        {isLive && twitchId && (
          <Button
            className="bg-[#9146FF] hover:bg-[#7d2ff4]"
            size="sm"
            asChild
          >
            <a 
              href={`https://twitch.tv/${twitchId}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Watch Now
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
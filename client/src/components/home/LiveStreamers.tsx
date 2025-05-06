import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Streamer } from '@shared/schema';
import LiveStreamersSection from '@/components/streamers/LiveStreamersSection';

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

export default function LiveStreamers() {
  return (
    <div className="mt-10 container">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <span className="relative mr-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        Live Streamers
      </h2>
      
      {/* Use our enhanced LiveStreamersSection component which integrates with Twitch API */}
      <LiveStreamersSection />
    </div>
  );
}
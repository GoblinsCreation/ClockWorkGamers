import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Streamer } from "@shared/schema";
import { Button } from "@/components/ui/button";

function StreamerCard({ streamer }: { streamer: Streamer }) {
  return (
    <div className="relative card-gradient rounded-xl overflow-hidden streamer-card transition-all duration-300 border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))]/50">
      <div className="relative">
        {/* Streamer stream preview */}
        <div className="w-full h-48 bg-[hsl(var(--cwg-dark-blue))]">
          <svg
            viewBox="0 0 800 450"
            className="w-full h-full"
          >
            <rect width="800" height="450" fill="#1E1E2F" />
            <rect x="300" y="150" width="200" height="150" rx="10" fill="#2A2A3A" />
            <circle cx="400" cy="225" r="50" fill="#3A3A4A" />
            <path d="M380,200 L430,225 L380,250 Z" fill="#FF6B00" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--cwg-dark))] to-transparent"></div>
        
        {/* Live indicator */}
        {streamer.isLive && (
          <div className="live-indicator bg-green-500"></div>
        )}
        
        {/* Bottom stats */}
        <div className="absolute bottom-3 left-3 flex items-center">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-white mr-1 animate-pulse"></span> LIVE
          </span>
          <span className="ml-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {streamer.viewerCount} viewers
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center">
          {/* Streamer profile image */}
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--cwg-dark-blue))] border-2 border-[hsl(var(--cwg-orange))] flex items-center justify-center">
            {streamer.displayName.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">{streamer.displayName}</h3>
            <p className="text-sm text-[hsl(var(--cwg-muted))]">{streamer.currentGame} - {streamer.streamTitle || "Streaming"}</p>
          </div>
        </div>
        
        {streamer.isLive ? (
          <a 
            href={`https://twitch.tv/${streamer.twitchId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 block w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] font-orbitron py-2 rounded text-center hover:bg-[hsl(var(--cwg-orange))]/90 transition-colors"
          >
            Watch Now
          </a>
        ) : (
          <span className="mt-4 block w-full bg-[hsl(var(--cwg-muted))]/20 text-[hsl(var(--cwg-muted))] font-orbitron py-2 rounded text-center">
            Offline
          </span>
        )}
      </div>
    </div>
  );
}

export function LiveStreamers() {
  const { data, isLoading, isError } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers/live"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
  
  // Ensure streamers is always an array
  const streamers = Array.isArray(data) ? data : [];
  
  // Display at most 3 live streamers
  const displayStreamers = streamers.slice(0, 3);
  
  // Create placeholder streamers when data is loading
  const placeholders = [
    {
      id: 1,
      userId: 1,
      displayName: "CWG | FrostiiGoblin",
      twitchId: "FrostiiGoblin",
      isLive: true,
      currentGame: "Boss Fighters",
      streamTitle: "Tournament Finals",
      viewerCount: 1200,
      profileImageUrl: null
    },
    {
      id: 2,
      userId: 2,
      displayName: "CWG | YarblesTV",
      twitchId: "YarblesTV",
      isLive: true,
      currentGame: "Boss Fighters",
      streamTitle: "Crafting Guide",
      viewerCount: 743,
      profileImageUrl: null
    },
    {
      id: 3,
      userId: 3,
      displayName: "CWG | Nexion",
      twitchId: "Nexion",
      isLive: true,
      currentGame: "Boss Fighters",
      streamTitle: "Token Earnings Run",
      viewerCount: 512,
      profileImageUrl: null
    }
  ];
  
  const renderStreamers = isLoading || isError || displayStreamers.length === 0 ? placeholders : displayStreamers;

  return (
    <section className="py-16 bg-[hsl(var(--cwg-dark))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Live Now</h2>
            <p className="mt-2 text-[hsl(var(--cwg-muted))]">Watch our guild members streaming their gameplay</p>
          </div>
          
          <Link href="/streamers">
            <Button className="mt-4 md:mt-0 px-5 py-2 border border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] rounded-lg font-orbitron text-sm hover:bg-[hsl(var(--cwg-orange))] hover:text-[hsl(var(--cwg-dark))] transition-colors duration-200 flex items-center">
              View All Streamers <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderStreamers.map((streamer) => (
            <StreamerCard key={streamer.id} streamer={streamer} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LiveStreamers;

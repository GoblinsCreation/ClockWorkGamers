import { Streamer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function StreamerCard({ streamer }: { streamer: Streamer }) {
  return (
    <div className="relative card-gradient rounded-xl overflow-hidden streamer-card transition-all duration-300 border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))]/50">
      <div className="relative">
        {/* Stream preview */}
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
        
        {/* Stream stats */}
        <div className="absolute bottom-3 left-3 flex items-center">
          {streamer.isLive ? (
            <>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-1 animate-pulse"></span> LIVE
              </span>
              <span className="ml-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {streamer.viewerCount} viewers
              </span>
            </>
          ) : (
            <span className="bg-[hsl(var(--cwg-muted))]/70 text-white px-2 py-1 rounded text-xs font-semibold">
              OFFLINE
            </span>
          )}
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
            <p className="text-sm text-[hsl(var(--cwg-muted))]">
              {streamer.isLive 
                ? `${streamer.currentGame} - ${streamer.streamTitle || "Streaming"}` 
                : "Currently Offline"
              }
            </p>
          </div>
        </div>
        
        {streamer.isLive ? (
          <a 
            href={`https://twitch.tv/${streamer.twitchId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 block w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] font-orbitron py-2 rounded text-center hover:bg-[hsl(var(--cwg-orange))]/90 transition-colors"
          >
            <div className="flex items-center justify-center">
              <Eye className="mr-2 h-4 w-4" />
              Watch Now
            </div>
          </a>
        ) : (
          <a 
            href={`https://twitch.tv/${streamer.twitchId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 block w-full bg-[hsl(var(--cwg-muted))]/20 text-[hsl(var(--cwg-muted))] font-orbitron py-2 rounded text-center hover:bg-[hsl(var(--cwg-muted))]/30 transition-colors"
          >
            View Channel
          </a>
        )}
      </div>
    </div>
  );
}

export default StreamerCard;

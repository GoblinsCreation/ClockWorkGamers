import { useQuery } from "@tanstack/react-query";
import { Streamer } from "@shared/schema";
import { Link } from "wouter";
import { Twitch, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveStreamers() {
  const { data: liveStreamers = [], isLoading } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers/live"],
  });
  
  if (isLoading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-[hsl(var(--cwg-dark-blue))] rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-32 bg-[hsl(var(--cwg-dark-blue))] rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (liveStreamers.length === 0) {
    return null; // Don't show this section if no streamers are live
  }
  
  return (
    <section className="py-12 bg-[hsl(var(--cwg-dark))] relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-web3-grid opacity-10"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--cwg-orange))]/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[hsl(var(--cwg-blue))]/10 blur-3xl rounded-full"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <h2 className="text-2xl font-orbitron font-bold neon-text-orange">Live Now</h2>
            </div>
            <p className="mt-2 text-[hsl(var(--cwg-muted))]">
              CWG members streaming right now. Join and support our community!
            </p>
          </div>
          
          <Link href="/streamers">
            <Button variant="outline" className="mt-4 sm:mt-0 group web3-chip">
              View All Streamers
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreamers.slice(0, 3).map((streamer) => (
            <div 
              key={streamer.id} 
              className="relative rounded-xl overflow-hidden border-2 border-[hsl(var(--cwg-orange))]/50 bg-[hsl(var(--cwg-dark-blue))]/50 hover:border-[hsl(var(--cwg-orange))] transition-all duration-300 web3-chip"
            >
              <div className="relative">
                {/* Stream preview */}
                <div className="w-full h-40 bg-[hsl(var(--cwg-dark-blue))] relative overflow-hidden">
                  <div className="absolute inset-0 bg-web3-circuit opacity-20 animate-cyber-scan"></div>
                  
                  {/* Animated glitch effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--cwg-orange))]/5 to-[hsl(var(--cwg-blue))]/5 animate-pulse-glow"></div>
                  
                  {/* Live indicator */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-orbitron flex items-center neon-glow">
                    <span className="inline-block w-2 h-2 rounded-full bg-white mr-1 animate-pulse"></span> LIVE
                  </div>
                  
                  {/* Viewer count */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs">
                    {streamer.viewerCount} viewers
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    {/* Streamer profile image */}
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--cwg-dark-blue))] border-2 border-[hsl(var(--cwg-orange))] flex items-center justify-center neon-glow">
                      {streamer.profileImageUrl ? (
                        <img 
                          src={streamer.profileImageUrl} 
                          alt={streamer.displayName} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
                          {streamer.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-orbitron text-[hsl(var(--cwg-text))]">{streamer.displayName}</h3>
                      {streamer.currentGame && (
                        <p className="text-sm text-[hsl(var(--cwg-muted))]">{streamer.currentGame}</p>
                      )}
                    </div>
                  </div>
                  
                  {streamer.streamTitle && (
                    <p className="text-sm text-[hsl(var(--cwg-text))] mb-3 line-clamp-2">{streamer.streamTitle}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://twitch.tv/${streamer.twitchId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange-dark))] text-white font-orbitron py-2 px-4 rounded-lg text-center neon-border-orange btn-hover transition-all duration-300"
                    >
                      <div className="flex items-center justify-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Watch Stream
                      </div>
                    </a>
                    
                    <Link 
                      href={`/streamers/${streamer.id}`}
                      className="bg-[hsl(var(--cwg-dark-blue))] hover:bg-[hsl(var(--cwg-dark-blue))]/80 text-[hsl(var(--cwg-blue))] py-2 px-3 rounded-lg transition-colors border border-[hsl(var(--cwg-blue))]/20 hover:border-[hsl(var(--cwg-blue))]/50"
                    >
                      <Twitch className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {liveStreamers.length > 3 && (
          <div className="mt-8 text-center">
            <Link href="/streamers?tab=live">
              <Button 
                variant="outline" 
                className="group web3-chip border-[hsl(var(--cwg-orange))]/50 hover:border-[hsl(var(--cwg-orange))]"
              >
                View All Live Streams ({liveStreamers.length})
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
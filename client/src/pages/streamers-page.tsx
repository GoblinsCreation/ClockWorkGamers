import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Streamer } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StreamerCard from "@/components/streamers/StreamerCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/button";
import { Loader2, Search, Twitch, Users, Gamepad, ArrowRight, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StreamersPage() {
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterGame, setFilterGame] = useState<string | null>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // Add background scrolling effect
  useEffect(() => {
    if (backgroundRef.current) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        if (backgroundRef.current) {
          backgroundRef.current.style.backgroundPosition = `0 ${scrollPosition * 0.05}px`;
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  const { data: streamers = [], isLoading } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers"],
  });
  
  const { data: liveStreamers = [] } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers/live"],
  });
  
  // Get unique games for filter
  const games = Array.from(new Set(
    streamers
      .map(streamer => streamer.currentGame)
      .filter((game): game is string => !!game)
  )).sort();
  
  // Filter streamers based on search term and game
  const filteredStreamers = streamers.filter(streamer => {
    const matchesSearch = streamer.displayName.toLowerCase().includes(filter.toLowerCase()) ||
      (streamer.currentGame && streamer.currentGame.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesGame = !filterGame || (streamer.currentGame && streamer.currentGame === filterGame);
    
    return matchesSearch && matchesGame;
  });
  
  // Filter live streamers based on search term and game
  const filteredLiveStreamers = liveStreamers.filter(streamer => {
    const matchesSearch = streamer.displayName.toLowerCase().includes(filter.toLowerCase()) ||
      (streamer.currentGame && streamer.currentGame.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesGame = !filterGame || (streamer.currentGame && streamer.currentGame === filterGame);
    
    return matchesSearch && matchesGame;
  });
  
  // Display streamers based on active tab
  const displayStreamers = activeTab === "all" ? filteredStreamers : filteredLiveStreamers;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section - enhanced with Web3 effects */}
        <section className="bg-mesh py-12 relative overflow-hidden animate-cyber-scan">
          {/* Animated background */}
          <div className="absolute inset-0 bg-web3-circuit opacity-20"></div>
          
          {/* Floating elements */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 diamond bg-[hsl(var(--cwg-orange))]/20 animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-3/4 right-1/4 w-6 h-6 hexagon bg-[hsl(var(--cwg-blue))]/20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full bg-[hsl(var(--web3-neon-green))]/30 animate-float" style={{animationDelay: '1.5s'}}></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold neon-text-orange">Guild Streamers</h1>
              <div className="mt-4 max-w-3xl mx-auto flex items-center justify-center space-x-6">
                <div className="flex items-center">
                  <div className="h-1 w-12 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-transparent"></div>
                </div>
                <p className="text-[hsl(var(--cwg-muted))] max-w-2xl">
                  Watch CWG members streaming their gameplay on Twitch. Support our community and learn from the best.
                </p>
                <div className="flex items-center">
                  <div className="h-1 w-12 bg-gradient-to-l from-[hsl(var(--cwg-orange))] to-transparent"></div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-8 flex flex-wrap justify-center gap-6">
                <div className="bg-[hsl(var(--cwg-dark-blue))]/70 backdrop-blur-sm p-4 rounded-lg web3-chip neon-border-orange">
                  <div className="flex items-center">
                    <Twitch className="text-[hsl(var(--cwg-orange))] mr-2" />
                    <span className="font-orbitron text-xl text-[hsl(var(--cwg-text))]">{liveStreamers.length}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--cwg-muted))]">Live Now</p>
                </div>
                
                <div className="bg-[hsl(var(--cwg-dark-blue))]/70 backdrop-blur-sm p-4 rounded-lg web3-chip neon-border-blue">
                  <div className="flex items-center">
                    <Users className="text-[hsl(var(--cwg-blue))] mr-2" />
                    <span className="font-orbitron text-xl text-[hsl(var(--cwg-text))]">{streamers.length}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--cwg-muted))]">Total Streamers</p>
                </div>
                
                <div className="bg-[hsl(var(--cwg-dark-blue))]/70 backdrop-blur-sm p-4 rounded-lg web3-chip neon-border-orange">
                  <div className="flex items-center">
                    <Gamepad className="text-[hsl(var(--cwg-orange))] mr-2" />
                    <span className="font-orbitron text-xl text-[hsl(var(--cwg-text))]">{games.length}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--cwg-muted))]">Games</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Streamers section - enhanced with background patterns */}
        <section ref={backgroundRef} className="py-12 bg-web3-grid relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Tabs 
                    defaultValue="all" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="web3-chip neon-border-blue p-1"
                  >
                    <TabsList className="bg-[hsl(var(--cwg-dark-blue))]">
                      <TabsTrigger value="all" className="font-orbitron data-[state=active]:bg-[hsl(var(--cwg-blue))]/20 data-[state=active]:text-[hsl(var(--cwg-blue))]">
                        All Streamers
                      </TabsTrigger>
                      <TabsTrigger value="live" className="font-orbitron data-[state=active]:bg-[hsl(var(--cwg-orange))]/20 data-[state=active]:text-[hsl(var(--cwg-orange))]">
                        Live Now ({liveStreamers.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Game filters */}
                  {games.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        onClick={() => setFilterGame(null)} 
                        className={`cursor-pointer ${!filterGame ? 'bg-[hsl(var(--cwg-orange))]' : 'bg-[hsl(var(--cwg-dark-blue))]'}`}
                      >
                        All Games
                      </Badge>
                      {games.map(game => (
                        <Badge 
                          key={game} 
                          onClick={() => setFilterGame(game === filterGame ? null : game)}
                          className={`cursor-pointer ${game === filterGame ? 'bg-[hsl(var(--cwg-orange))]' : 'bg-[hsl(var(--cwg-dark-blue))]'}`}
                        >
                          {game}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                    <input 
                      type="text"
                      placeholder="Search streamers or games..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-blue))]/30 focus:border-[hsl(var(--cwg-blue))] rounded-lg text-[hsl(var(--cwg-text))] w-full sm:w-64 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[hsl(var(--cwg-orange))]/20 animate-ping"></div>
                  <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--cwg-orange))]" />
                </div>
              </div>
            ) : displayStreamers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayStreamers.map((streamer) => (
                  <StreamerCard key={streamer.id} streamer={streamer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[hsl(var(--cwg-dark-blue))]/30 border border-[hsl(var(--cwg-blue))]/20 rounded-xl p-8">
                <h3 className="text-2xl font-orbitron neon-text-blue">
                  {filter 
                    ? "No streamers match your search" 
                    : filterGame 
                      ? `No ${activeTab === "live" ? "live " : ""}streamers for ${filterGame}`
                      : activeTab === "live" 
                        ? "No streamers are currently live" 
                        : "No streamers found"
                  }
                </h3>
                {(filter || filterGame) && (
                  <button 
                    onClick={() => {
                      setFilter("");
                      setFilterGame(null);
                    }}
                    className="mt-6 text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))]/50 border border-[hsl(var(--cwg-orange))]/30 hover:border-[hsl(var(--cwg-orange))] px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
            
            {/* Call to Action - Become a Streamer */}
            {displayStreamers.length > 0 && (
              <div className="mt-16 web3-gradient rounded-xl p-6 md:p-8 border-2 border-[hsl(var(--cwg-orange))]/50 animate-cyber-scan relative overflow-hidden">
                <div className="absolute inset-0 bg-web3-dots"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center">
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">
                      Want to join our <span className="neon-text-orange">Streamer Team</span>?
                    </h3>
                    <p className="mt-4 text-[hsl(var(--cwg-muted))]">
                      If you're a ClockWork Gamers member and stream regularly, you can apply to join our official streamer team. Gain exposure, grow your audience, and represent the guild.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <a href="https://discord.gg/qC3wMKXYQb" target="_blank" rel="noopener noreferrer" className="neon-border-orange px-6 py-3 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange-dark))] text-white rounded-lg font-orbitron btn-hover web3-hover transition-all duration-300">
                        <div className="flex items-center">
                          <Twitch className="mr-2" /> Apply Now
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="mt-8 md:mt-0 md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 relative animate-float">
                      <div className="w-full h-full hexagon bg-gradient-to-br from-[hsl(var(--cwg-orange))]/30 to-[hsl(var(--cwg-blue))]/30 border-2 border-[hsl(var(--cwg-orange))]/70 flex items-center justify-center neon-glow">
                        <Twitch className="h-12 w-12 text-white animate-pulse-glow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

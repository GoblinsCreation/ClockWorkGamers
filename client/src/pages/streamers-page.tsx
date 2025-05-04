import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Streamer } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StreamerCard from "@/components/streamers/StreamerCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function StreamersPage() {
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: streamers = [], isLoading } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers"],
  });
  
  const { data: liveStreamers = [] } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers/live"],
  });
  
  // Filter streamers based on search term
  const filteredStreamers = streamers.filter(streamer => 
    streamer.displayName.toLowerCase().includes(filter.toLowerCase()) ||
    (streamer.currentGame && streamer.currentGame.toLowerCase().includes(filter.toLowerCase()))
  );
  
  // Filter live streamers based on search term
  const filteredLiveStreamers = liveStreamers.filter(streamer => 
    streamer.displayName.toLowerCase().includes(filter.toLowerCase()) ||
    (streamer.currentGame && streamer.currentGame.toLowerCase().includes(filter.toLowerCase()))
  );
  
  // Display streamers based on active tab
  const displayStreamers = activeTab === "all" ? filteredStreamers : filteredLiveStreamers;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Guild Streamers</h1>
              <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Watch CWG members streaming their gameplay on Twitch. Support our community and learn from the best.
              </p>
            </div>
          </div>
        </section>
        
        {/* Streamers section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs 
                  defaultValue="all" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList>
                    <TabsTrigger value="all" className="font-orbitron">All Streamers</TabsTrigger>
                    <TabsTrigger value="live" className="font-orbitron">Live Now ({liveStreamers.length})</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                  <Input 
                    type="text"
                    placeholder="Search streamers or games..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
              </div>
            ) : displayStreamers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayStreamers.map((streamer) => (
                  <StreamerCard key={streamer.id} streamer={streamer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-muted))]">
                  {filter ? "No streamers match your search" : activeTab === "live" ? "No streamers are currently live" : "No streamers found"}
                </h3>
                {filter && (
                  <button 
                    onClick={() => setFilter("")}
                    className="mt-4 text-[hsl(var(--cwg-orange))]"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

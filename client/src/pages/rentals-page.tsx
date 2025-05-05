import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rental } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentalOptions from "@/components/rentals/RentalOptions";
import CustomRental from "@/components/rentals/CustomRental";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState("preset");
  const [selectedGame, setSelectedGame] = useState("boss-fighters"); // Default to Boss Fighters
  
  const { data: rentals = [], isLoading } = useQuery<Rental[]>({
    queryKey: [`/api/rentals?game=${selectedGame}`],
  });
  
  // Available games for rental items
  const games = [
    { id: "boss-fighters", name: "Boss Fighters" },
    { id: "kokodi", name: "KoKodi" },
    { id: "nyan-heroes", name: "Nyan Heroes" },
    { id: "big-time", name: "Big Time" },
    { id: "worldshards", name: "WorldShards" },
    { id: "off-the-grid", name: "Off The Grid" },
    { id: "ravenquest", name: "RavenQuest" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Game Asset Rentals</h1>
              <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Rent premium in-game assets to enhance your gameplay and increase your earnings
              </p>
            </div>
          </div>
        </section>
        
        {/* Rentals section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Tabs 
                defaultValue="preset" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <TabsList>
                    <TabsTrigger value="preset" className="font-orbitron">Preset Rentals</TabsTrigger>
                    <TabsTrigger value="custom" className="font-orbitron">Custom Request</TabsTrigger>
                  </TabsList>
                  
                  {activeTab === "preset" && (
                    <div className="w-full sm:w-auto">
                      <Select 
                        defaultValue={selectedGame} 
                        value={selectedGame}
                        onValueChange={setSelectedGame}
                      >
                        <SelectTrigger className="w-full sm:w-[220px] bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                          <SelectValue placeholder="Select Game" />
                        </SelectTrigger>
                        <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                          {games.map((game) => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <TabsContent value="preset">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                    </div>
                  ) : (
                    <RentalOptions rentals={rentals} selectedGame={selectedGame} />
                  )}
                </TabsContent>
                
                <TabsContent value="custom">
                  <CustomRental games={games} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Rental Terms & FAQ Section */}
            <div className="mt-16 card-gradient rounded-xl p-6 md:p-8 border border-[hsl(var(--cwg-blue))]/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">Rental Terms & Conditions</h2>
                  <ul className="mt-4 space-y-2 text-[hsl(var(--cwg-muted))]">
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>All rentals require a security deposit returned upon completion</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Rental periods begin at the time of asset transfer</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Early returns are not eligible for partial refunds</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Guild members receive a 15% discount on all rentals</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                      <span>Damage or loss of items will result in forfeiture of deposit</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">Rental FAQ</h2>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <h4 className="font-orbitron text-[hsl(var(--cwg-text))]">How do I receive my rented items?</h4>
                      <p className="text-[hsl(var(--cwg-muted))]">Assets are transferred directly to your connected wallet or game account within 1 hour of approval.</p>
                    </li>
                    <li>
                      <h4 className="font-orbitron text-[hsl(var(--cwg-text))]">Can I extend my rental period?</h4>
                      <p className="text-[hsl(var(--cwg-muted))]">Yes, rental extensions can be requested through your account page before the end date.</p>
                    </li>
                    <li>
                      <h4 className="font-orbitron text-[hsl(var(--cwg-text))]">What payment methods are accepted?</h4>
                      <p className="text-[hsl(var(--cwg-muted))]">We accept cryptocurrency payments (BFToken, ETH, USDC) and major credit/debit cards.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

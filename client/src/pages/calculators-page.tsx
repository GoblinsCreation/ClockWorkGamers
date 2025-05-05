import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BossFightersCalculator from "@/components/calculators/BossFightersCalculator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function CalculatorsPage() {
  const [selectedGame, setSelectedGame] = useState("boss-fighters"); // Updated games list with Boss Fighters, KoKodi, Nyan Heroes
  const { user } = useAuth();
  
  // Check if the user is a CWG member to access calculators
  const isGuildMember = user?.guild === "ClockWork Gamers";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Web3 Game Calculators</h1>
              <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Maximize your in-game earnings with our specialized calculators for Web3 games
              </p>
            </div>
          </div>
        </section>
        
        {/* Calculators section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Tabs 
                defaultValue="boss-fighters" 
                value={selectedGame}
                onValueChange={setSelectedGame}
                className="w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="boss-fighters" className="font-orbitron">Boss Fighters</TabsTrigger>
                    <TabsTrigger value="kokodi" className="font-orbitron" disabled>
                      KoKodi <span className="ml-1 text-xs">(Soon)</span>
                    </TabsTrigger>
                    <TabsTrigger value="nyan-heroes" className="font-orbitron" disabled>
                      Nyan Heroes <span className="ml-1 text-xs">(Soon)</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="boss-fighters">
                  {user ? (
                    isGuildMember ? (
                      <BossFightersCalculator />
                    ) : (
                      <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-orange))]/20 text-center">
                        <Lock className="mx-auto h-16 w-16 text-[hsl(var(--cwg-muted))] mb-4" />
                        <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-3">
                          CWG Members Only
                        </h3>
                        <p className="text-[hsl(var(--cwg-muted))] max-w-lg mx-auto mb-6">
                          This calculator is exclusively available to ClockWork Gamers guild members. Join our guild to access this and other premium tools.
                        </p>
                        <Button className="bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90">
                          Update Guild Membership
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-orange))]/20 text-center">
                      <Lock className="mx-auto h-16 w-16 text-[hsl(var(--cwg-muted))] mb-4" />
                      <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-3">
                        Sign In Required
                      </h3>
                      <p className="text-[hsl(var(--cwg-muted))] max-w-lg mx-auto mb-6">
                        Please sign in to access our premium game calculators. CWG members get exclusive access to all calculators.
                      </p>
                      <Link href="/auth">
                        <Button className="bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90">
                          Sign In or Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="kokodi">
                  <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-blue))]/20 text-center">
                    <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-3">
                      Coming Soon
                    </h3>
                    <p className="text-[hsl(var(--cwg-muted))] max-w-lg mx-auto">
                      Our KoKodi calculators are currently in development. Check back soon for tools to optimize your gameplay and earnings.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="nyan-heroes">
                  <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-blue))]/20 text-center">
                    <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-3">
                      Coming Soon
                    </h3>
                    <p className="text-[hsl(var(--cwg-muted))] max-w-lg mx-auto">
                      Our Nyan Heroes calculators are currently in development. Check back soon for tools to optimize your gameplay and earnings.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Calculator Info Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-blue))]/20">
                <h2 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))]">What Our Calculators Do</h2>
                <ul className="mt-4 space-y-2 text-[hsl(var(--cwg-muted))]">
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                    <span>Calculate optimal earnings based on gameplay time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                    <span>Determine most efficient badge crafting strategies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                    <span>Compare recharge costs versus potential earnings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                    <span>Analyze optimal skill and gear configurations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                    <span>Project ROI for different gaming strategies</span>
                  </li>
                </ul>
              </div>
              
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-orange))]/20">
                <h2 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))]">Why Use Our Calculators</h2>
                <ul className="mt-4 space-y-2 text-[hsl(var(--cwg-muted))]">
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                    <span>Regularly updated with latest game mechanics and prices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                    <span>Designed by top players with in-depth game knowledge</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                    <span>Exclusive access for CWG guild members only</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                    <span>Save time and maximize your earning potential</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--cwg-orange))] mr-2">•</span>
                    <span>Custom support for individual optimization questions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

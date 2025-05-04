import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { GameController, Trophy, Users, ChevronRight } from 'lucide-react';

export default function PlayToEarnPage() {
  // List of games from your document
  const games = [
    {
      name: "Boss Fighters",
      description: "A competitive fighting game where players battle bosses for rewards.",
      imageUrl: "/assets/games/boss-fighters.jpg", // Placeholder image path
      link: "https://bossfighters.io",
      rewards: "Up to 500 CWG tokens per week"
    },
    {
      name: "Call of Legends",
      description: "A team-based shooter with play-to-earn mechanics integrated into ranked matches.",
      imageUrl: "/assets/games/call-of-legends.jpg", // Placeholder image path
      link: "https://calloflegends.com",
      rewards: "250-400 CWG tokens per tournament"
    },
    {
      name: "Spellcraft",
      description: "A strategic card game with collectible NFT cards that can be earned through play.",
      imageUrl: "/assets/games/spellcraft.jpg", // Placeholder image path
      link: "https://spellcraft-game.com",
      rewards: "Earn cards and 100-200 CWG tokens daily"
    },
    {
      name: "Metaverse Racing",
      description: "High-octane racing in the metaverse with upgradable NFT vehicles.",
      imageUrl: "/assets/games/metaverse-racing.jpg", // Placeholder image path
      link: "https://metaverse-racing.com",
      rewards: "Vehicle parts and up to 300 CWG tokens"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[hsl(var(--cwg-blue))]/20 to-[hsl(var(--cwg-orange))]/20 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-tight text-[hsl(var(--cwg-text))] mb-4">
              Play-to-Earn
            </h1>
            <p className="text-xl text-[hsl(var(--cwg-muted))] max-w-3xl mx-auto">
              Join the gaming revolution where your skills translate to real rewards.
              Play, compete, and earn in the ClockWork Gaming ecosystem.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button className="bg-[hsl(var(--cwg-orange))] text-white font-orbitron">
                <GameController className="mr-2 h-5 w-5" /> Browse Games
              </Button>
              <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] font-orbitron">
                <Trophy className="mr-2 h-5 w-5" /> View Tournaments
              </Button>
            </div>
          </div>
        </div>
        
        {/* Featured Games section */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))]">Featured Games</h2>
            <Button variant="link" className="text-[hsl(var(--cwg-blue))]">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <div key={index} className="bg-[hsl(var(--cwg-dark-blue))]/30 border border-[hsl(var(--cwg-dark-blue))] rounded-lg overflow-hidden">
                <div className="h-48 bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center">
                  {/* Placeholder for game image */}
                  <GameController className="h-16 w-16 text-[hsl(var(--cwg-blue))]/50" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">{game.name}</h3>
                  <p className="text-[hsl(var(--cwg-muted))] text-sm mb-4">{game.description}</p>
                  <div className="bg-[hsl(var(--cwg-dark))] p-2 rounded text-sm text-[hsl(var(--cwg-orange))] font-orbitron mb-4">
                    {game.rewards}
                  </div>
                  <a 
                    href={game.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-[hsl(var(--cwg-blue))] text-white font-orbitron py-2 px-4 rounded text-center hover:bg-[hsl(var(--cwg-blue))]/80 transition-colors"
                  >
                    Play Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* How it Works section */}
        <div className="bg-[hsl(var(--cwg-dark-blue))]/20 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] text-center mb-12">
              How Play-to-Earn Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mb-4">
                  <GameController className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">1. Play Games</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Join any of our partner games and start playing. Your in-game achievements will be tracked and rewarded.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 bg-[hsl(var(--cwg-orange))]/20 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">2. Complete Quests</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Fulfill quests and objectives to earn CWG tokens, NFTs, and other valuable rewards.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">3. Join Tournaments</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Participate in weekly tournaments with prize pools of CWG tokens and exclusive rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] mb-4">
            Ready to start earning?
          </h2>
          <p className="text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto mb-8">
            Join thousands of players already earning rewards through their gaming skills.
            Sign up now and claim your welcome bonus of 50 CWG tokens!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth">
              <Button className="bg-[hsl(var(--cwg-orange))] text-white font-orbitron px-8 py-6">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/token-dashboard">
              <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] font-orbitron px-8 py-6">
                Learn About CWG Tokens
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
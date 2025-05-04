import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Trophy, Coins, Users, ChevronRight } from 'lucide-react';

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState("play-to-earn");

  // List of play-to-earn games
  const playToEarnGames = [
    {
      name: "Boss Fighters",
      description: "A competitive fighting game where players battle bosses for rewards.",
      imageUrl: "/assets/games/boss-fighters.jpg",
      link: "https://economy.bossfighters.game/register?ref=9f15935b",
      rewards: "Up to 500 CWG tokens per week"
    },
    {
      name: "KoKodi",
      description: "An immersive blockchain game with NFT-based characters and worlds.",
      imageUrl: "/assets/games/kokodi.jpg",
      link: "https://kokodi.io",
      rewards: "Earn NFT assets and 150-300 CWG tokens"
    },
    {
      name: "Nyan Heroes",
      description: "Battle royale game featuring upgradeable mech suits and cute cat pilots.",
      imageUrl: "/assets/games/nyan-heroes.jpg",
      link: "https://nyanheroes.com",
      rewards: "Earn 200-400 CWG tokens weekly"
    },
    {
      name: "Big Time",
      description: "Action RPG where players journey through time and collect valuable NFTs.",
      imageUrl: "/assets/games/big-time.jpg",
      link: "https://bigtime.gg",
      rewards: "Rare items and up to 350 CWG tokens"
    }
  ];

  // List of pay-to-earn games
  const payToEarnGames = [
    {
      name: "Crypto Legends",
      description: "Purchase heroes and earn through PvP battles and quests with exponential rewards.",
      imageUrl: "/assets/games/crypto-legends.jpg",
      link: "https://cryptolegends.io",
      investment: "Starting at 0.1 ETH",
      roi: "15-30% monthly"
    },
    {
      name: "NFT Worlds",
      description: "Own land in the metaverse and earn passive income through events and rentals.",
      imageUrl: "/assets/games/nft-worlds.jpg",
      link: "https://nftworlds.com",
      investment: "0.5-2 ETH",
      roi: "10-25% monthly"
    },
    {
      name: "Yield Hunters",
      description: "Purchase NFT characters and equipment to earn through resource gathering.",
      imageUrl: "/assets/games/yield-hunters.jpg",
      link: "https://yieldhunters.finance",
      investment: "0.2-0.8 ETH",
      roi: "20-40% monthly"
    },
    {
      name: "Crypto Racing League",
      description: "Purchase NFT vehicles and compete in races with substantial prize pools.",
      imageUrl: "/assets/games/crypto-racing.jpg",
      link: "https://cryptoracing.io",
      investment: "0.3-1 ETH",
      roi: "15-35% monthly"
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
              Web3 Gaming Hub
            </h1>
            <p className="text-xl text-[hsl(var(--cwg-muted))] max-w-3xl mx-auto">
              Join the gaming revolution with ClockWork Gamers. Choose your path: play for free and earn rewards, 
              or invest and maximize your returns in the blockchain gaming ecosystem.
            </p>
            <div className="mt-8">
              <Tabs defaultValue="play-to-earn" className="max-w-xl mx-auto" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-[hsl(var(--cwg-dark-blue))]">
                  <TabsTrigger 
                    value="play-to-earn" 
                    className="font-orbitron data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                  >
                    <Gamepad2 className="mr-2 h-4 w-4" /> Play-to-Earn
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pay-to-earn" 
                    className="font-orbitron data-[state=active]:bg-[hsl(var(--cwg-orange))] data-[state=active]:text-white"
                  >
                    <Coins className="mr-2 h-4 w-4" /> Pay-to-Earn
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Games section */}
        <div className="container mx-auto px-4 py-16">
          {activeTab === "play-to-earn" ? (
            <>
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))]">Play-to-Earn Games</h2>
                <Button variant="link" className="text-[hsl(var(--cwg-blue))]">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {playToEarnGames.map((game, index) => (
                  <div key={index} className="bg-[hsl(var(--cwg-dark-blue))]/30 border border-[hsl(var(--cwg-dark-blue))] rounded-lg overflow-hidden">
                    <div className="h-48 bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center">
                      {/* Placeholder for game image */}
                      <Gamepad2 className="h-16 w-16 text-[hsl(var(--cwg-blue))]/50" />
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
              
              <div className="mt-16">
                <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] text-center mb-12">
                  How Play-to-Earn Works
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                    <div className="w-12 h-12 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mb-4">
                      <Gamepad2 className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
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
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))]">Pay-to-Earn Games</h2>
                <Button variant="link" className="text-[hsl(var(--cwg-orange))]">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {payToEarnGames.map((game, index) => (
                  <div key={index} className="bg-[hsl(var(--cwg-dark-blue))]/30 border border-[hsl(var(--cwg-dark-blue))] rounded-lg overflow-hidden">
                    <div className="h-48 bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center">
                      {/* Placeholder for game image */}
                      <Coins className="h-16 w-16 text-[hsl(var(--cwg-orange))]/50" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">{game.name}</h3>
                      <p className="text-[hsl(var(--cwg-muted))] text-sm mb-4">{game.description}</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-[hsl(var(--cwg-dark))] p-2 rounded text-sm">
                          <span className="block text-[hsl(var(--cwg-muted))] text-xs">Investment</span>
                          <span className="text-[hsl(var(--cwg-orange))] font-orbitron">{game.investment}</span>
                        </div>
                        <div className="bg-[hsl(var(--cwg-dark))] p-2 rounded text-sm">
                          <span className="block text-[hsl(var(--cwg-muted))] text-xs">Est. ROI</span>
                          <span className="text-[hsl(var(--cwg-green))] font-orbitron">{game.roi}</span>
                        </div>
                      </div>
                      <a 
                        href={game.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-[hsl(var(--cwg-orange))] text-white font-orbitron py-2 px-4 rounded text-center hover:bg-[hsl(var(--cwg-orange))]/80 transition-colors"
                      >
                        Invest Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16">
                <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] text-center mb-12">
                  How Pay-to-Earn Works
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                    <div className="w-12 h-12 bg-[hsl(var(--cwg-orange))]/20 rounded-full flex items-center justify-center mb-4">
                      <Coins className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                    </div>
                    <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">1. Invest in Assets</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">
                      Purchase in-game NFTs, characters, or assets to start earning. Each game has different investment requirements.
                    </p>
                  </div>
                  
                  <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                    <div className="w-12 h-12 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mb-4">
                      <Gamepad2 className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                    </div>
                    <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">2. Play & Optimize</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">
                      Use your assets in the game to generate yield. Optimize your strategy to maximize returns.
                    </p>
                  </div>
                  
                  <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                    <div className="w-12 h-12 bg-[hsl(var(--cwg-green))]/20 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="h-6 w-6 text-[hsl(var(--cwg-green))]" />
                    </div>
                    <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">3. Earn Returns</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">
                      Collect regular returns on your investment through gameplay, staking, or automated yield systems.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* CTA section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] mb-4">
            Ready to start your Web3 gaming journey?
          </h2>
          <p className="text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto mb-8">
            Join thousands of players already earning rewards through our gaming ecosystem.
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
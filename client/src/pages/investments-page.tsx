import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, Award, Trophy, Gamepad2, Building } from 'lucide-react';
import { useWeb3 } from '@/hooks/use-web3';
import { Link } from 'wouter';

export default function InvestmentsPage() {
  const { connected, connectWallet } = useWeb3();

  // Investment opportunities data
  const investments = [
    {
      id: "future-nfts",
      title: "Future NFTs",
      description: "Invest in upcoming NFT collections by ClockWork Gamers. Holders get early access to games, airdrops, and revenue sharing.",
      icon: <Award className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />,
      minInvestment: "0.5 SOL",
      currentRaise: 145,
      targetRaise: 200,
      unit: "SOL",
      returnEstimate: "Variable based on collection performance",
      timeframe: "Quarterly drops",
      badge: "Popular"
    },
    {
      id: "nft-staking",
      title: "NFT Staking Pool",
      description: "Provide liquidity for our NFT staking platform. Earn fees from users staking their gaming NFTs for yield.",
      icon: <Coins className="h-6 w-6 text-[hsl(var(--cwg-green))]" />,
      minInvestment: "0.75 SOL",
      currentRaise: 210,
      targetRaise: 300,
      unit: "SOL",
      returnEstimate: "10-20% annually",
      timeframe: "Continuous returns",
      badge: "Stable"
    },
    {
      id: "game-development",
      title: "Game Development Fund",
      description: "Fund the development of Web3 games. Investors receive revenue share from game profits and exclusive in-game items.",
      icon: <Gamepad2 className="h-6 w-6 text-[hsl(var(--cwg-purple))]" />,
      minInvestment: "2 SOL",
      currentRaise: 320,
      targetRaise: 500,
      unit: "SOL",
      returnEstimate: "Potential 3-5x returns",
      timeframe: "18-24 month horizon",
      badge: "High Risk/Reward"
    },
    {
      id: "guild-treasury",
      title: "Guild Treasury",
      description: "Contribute to our diversified treasury which invests in blue-chip crypto, gaming tokens, and yield-generating protocols.",
      icon: <Building className="h-6 w-6 text-[hsl(var(--cwg-yellow))]" />,
      minInvestment: "0.25 SOL",
      currentRaise: 450,
      targetRaise: 1000,
      unit: "SOL",
      returnEstimate: "8-15% annually",
      timeframe: "Quarterly dividends",
      badge: "Beginner Friendly"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[hsl(var(--cwg-blue))]/20 to-[hsl(var(--cwg-green))]/20 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-tight text-[hsl(var(--cwg-text))] mb-4">
              Guild Investments
            </h1>
            <p className="text-xl text-[hsl(var(--cwg-muted))] max-w-3xl mx-auto">
              Invest in the future of Web3 gaming with ClockWork Gamers. 
              Multiple investment opportunities with different risk profiles and return potentials.
            </p>
            <div className="mt-8 flex justify-center">
              {!connected ? (
                <Button 
                  className="bg-[hsl(var(--cwg-green))] hover:bg-[hsl(var(--cwg-green))]/80 text-white font-orbitron" 
                  onClick={connectWallet}
                >
                  <Coins className="mr-2 h-5 w-5" /> Connect Wallet to Invest
                </Button>
              ) : (
                <Button className="bg-[hsl(var(--cwg-green))] hover:bg-[hsl(var(--cwg-green))]/80 text-white font-orbitron">
                  <Coins className="mr-2 h-5 w-5" /> Browse Investments
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Investment opportunities */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] mb-12 text-center">
            Investment Opportunities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((investment) => (
              <Card key={investment.id} className="bg-[hsl(var(--cwg-dark-blue))]/30 border border-[hsl(var(--cwg-dark-blue))] overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[hsl(var(--cwg-dark))]">
                      {investment.icon}
                    </div>
                    {investment.badge && (
                      <Badge className="bg-[hsl(var(--cwg-orange))] text-white">
                        {investment.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-xl font-orbitron text-[hsl(var(--cwg-text))]">
                    {investment.title}
                  </CardTitle>
                  <CardDescription className="text-[hsl(var(--cwg-muted))]">
                    {investment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-[hsl(var(--cwg-muted))]">Fundraising Progress</span>
                        <span className="text-sm font-orbitron text-[hsl(var(--cwg-blue))]">
                          {investment.currentRaise} / {investment.targetRaise} {investment.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(investment.currentRaise / investment.targetRaise) * 100} 
                        className="h-2 bg-[hsl(var(--cwg-dark))]" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-md">
                        <span className="block text-xs text-[hsl(var(--cwg-muted))]">Min. Investment</span>
                        <span className="font-orbitron text-[hsl(var(--cwg-text))]">{investment.minInvestment}</span>
                      </div>
                      <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-md">
                        <span className="block text-xs text-[hsl(var(--cwg-muted))]">Est. Returns</span>
                        <span className="font-orbitron text-[hsl(var(--cwg-green))]">{investment.returnEstimate}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-md">
                      <span className="block text-xs text-[hsl(var(--cwg-muted))]">Distribution Schedule</span>
                      <span className="font-orbitron text-[hsl(var(--cwg-text))]">{investment.timeframe}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[hsl(var(--cwg-blue))] hover:bg-[hsl(var(--cwg-blue))]/80 text-white font-orbitron">
                    Invest Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {/* How it works section */}
        <div className="bg-[hsl(var(--cwg-dark-blue))]/20 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] text-center mb-12">
              How Investing Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[hsl(var(--cwg-blue))]/20 mb-4">
                  <span className="font-orbitron font-bold text-[hsl(var(--cwg-blue))]">1</span>
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Connect Wallet</h3>
                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                  Link your Solana wallet to our platform to enable seamless investments.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[hsl(var(--cwg-blue))]/20 mb-4">
                  <span className="font-orbitron font-bold text-[hsl(var(--cwg-blue))]">2</span>
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Choose Investment</h3>
                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                  Select from our curated investment opportunities based on your risk profile.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[hsl(var(--cwg-blue))]/20 mb-4">
                  <span className="font-orbitron font-bold text-[hsl(var(--cwg-blue))]">3</span>
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Deposit Funds</h3>
                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                  Send SOL from your wallet to secure your position in the investment pool.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[hsl(var(--cwg-blue))]/20 mb-4">
                  <span className="font-orbitron font-bold text-[hsl(var(--cwg-blue))]">4</span>
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Track & Collect</h3>
                <p className="text-sm text-[hsl(var(--cwg-muted))]">
                  Monitor your investments through our dashboard and collect returns based on each investment's schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Disclosure section */}
        <div className="container mx-auto px-4 py-16">
          <div className="bg-[hsl(var(--cwg-dark))]/80 border border-[hsl(var(--cwg-orange))]/30 rounded-lg p-6">
            <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-orange))] mb-4">Risk Disclosure</h3>
            <p className="text-[hsl(var(--cwg-muted))] mb-6">
              All investments involve risk and may result in partial or complete loss of capital. 
              Web3 gaming investments are particularly volatile and should only represent a portion of a diversified portfolio. 
              Past performance is not indicative of future results.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
                Read Full Risk Disclosure
              </Button>
              <Link href="/token-dashboard">
                <Button className="bg-[hsl(var(--cwg-blue))] text-white">
                  View CWG Token Performance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
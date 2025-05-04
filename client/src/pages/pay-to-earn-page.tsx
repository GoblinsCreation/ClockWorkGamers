import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { DollarSign, Zap, Coins, ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PayToEarnPage() {
  // Example investment opportunities
  const investmentOptions = [
    {
      name: "Tournament Sponsor",
      description: "Sponsor weekly tournaments and earn a percentage of the entry fees.",
      minInvestment: "1,000 CWG",
      expectedReturn: "15-20% monthly",
      duration: "1 month",
      risk: "Medium"
    },
    {
      name: "NFT Staking Pool",
      description: "Contribute to our NFT acquisition fund and share in the rental income.",
      minInvestment: "2,500 CWG",
      expectedReturn: "10-15% monthly",
      duration: "3 months",
      risk: "Medium-High"
    },
    {
      name: "Game Development Fund",
      description: "Invest in upcoming game development and receive revenue share.",
      minInvestment: "5,000 CWG",
      expectedReturn: "25-35% annually",
      duration: "1 year",
      risk: "High"
    },
    {
      name: "Guild Treasury",
      description: "Stake in the guild's operations and earn from all guild activities.",
      minInvestment: "500 CWG",
      expectedReturn: "8-12% monthly",
      duration: "Flexible",
      risk: "Low"
    }
  ];

  // Risk level indicator component
  const RiskIndicator = ({ level }: { level: string }) => {
    const getColor = () => {
      switch (level) {
        case "Low": return "bg-green-500";
        case "Medium": return "bg-yellow-500";
        case "Medium-High": return "bg-orange-500";
        case "High": return "bg-red-500";
        default: return "bg-gray-500";
      }
    };
    
    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${getColor()} mr-2`}></div>
        <span>{level} Risk</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[hsl(var(--cwg-blue))]/20 to-[hsl(var(--cwg-orange))]/20 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-tight text-[hsl(var(--cwg-text))] mb-4">
              Pay-to-Earn
            </h1>
            <p className="text-xl text-[hsl(var(--cwg-muted))] max-w-3xl mx-auto">
              Invest your CWG tokens and earn passive income through our ecosystem.
              Stake, invest, and grow your digital assets.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button className="bg-[hsl(var(--cwg-orange))] text-white font-orbitron">
                <DollarSign className="mr-2 h-5 w-5" /> Investment Options
              </Button>
              <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] font-orbitron">
                <Coins className="mr-2 h-5 w-5" /> View Returns
              </Button>
            </div>
          </div>
        </div>
        
        {/* Investment Options section */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))]">Investment Options</h2>
            <Button variant="link" className="text-[hsl(var(--cwg-blue))]">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investmentOptions.map((option, index) => (
              <Card key={index} className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--cwg-text))]">{option.name}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Min Investment:</span>
                      <span className="text-[hsl(var(--cwg-orange))] font-orbitron">{option.minInvestment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Expected Return:</span>
                      <span className="text-green-500 font-orbitron">{option.expectedReturn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Duration:</span>
                      <span className="text-[hsl(var(--cwg-text))]">{option.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Risk Level:</span>
                      <RiskIndicator level={option.risk} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[hsl(var(--cwg-blue))] text-white">
                    Invest Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {/* How it Works section */}
        <div className="bg-[hsl(var(--cwg-dark-blue))]/20 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] text-center mb-12">
              How Pay-to-Earn Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">1. Stake CWG Tokens</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Invest your CWG tokens in various opportunities within our ecosystem based on your risk tolerance.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 bg-[hsl(var(--cwg-orange))]/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">2. Generate Passive Income</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Your investments work for you, generating returns through guild activities, tournaments, and NFT rentals.
                </p>
              </div>
              
              <div className="bg-[hsl(var(--cwg-dark))] p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                <div className="w-12 h-12 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-[hsl(var(--cwg-blue))]" />
                </div>
                <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">3. Collect & Reinvest</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Collect your returns regularly and choose to cash out or reinvest to compound your earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Benefits section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] text-center mb-12">
            Benefits of Pay-to-Earn
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[hsl(var(--cwg-dark-blue))]/10 p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mr-4 mt-1">
                  <Coins className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                </div>
                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Passive Income</h3>
                  <p className="text-[hsl(var(--cwg-muted))]">
                    Earn consistent returns without actively playing games. Let your tokens work for you.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[hsl(var(--cwg-dark-blue))]/10 p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mr-4 mt-1">
                  <ShieldCheck className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                </div>
                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Risk Management</h3>
                  <p className="text-[hsl(var(--cwg-muted))]">
                    Choose from a variety of investment options with different risk profiles to match your comfort level.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[hsl(var(--cwg-dark-blue))]/10 p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mr-4 mt-1">
                  <FileText className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                </div>
                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Transparent Returns</h3>
                  <p className="text-[hsl(var(--cwg-muted))]">
                    All investments and returns are tracked on-chain for complete transparency and accountability.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[hsl(var(--cwg-dark-blue))]/10 p-6 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 bg-[hsl(var(--cwg-blue))]/20 rounded-full flex items-center justify-center mr-4 mt-1">
                  <Zap className="h-5 w-5 text-[hsl(var(--cwg-blue))]" />
                </div>
                <div>
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Guild Growth</h3>
                  <p className="text-[hsl(var(--cwg-muted))]">
                    Your investments help the guild grow, creating more opportunities and higher returns for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-gradient-to-r from-[hsl(var(--cwg-blue))]/30 to-[hsl(var(--cwg-orange))]/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))] mb-4">
              Ready to start investing?
            </h2>
            <p className="text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto mb-8">
              Join our investment community and start earning passive income today.
              Connect your wallet and make your first investment in minutes!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-[hsl(var(--cwg-orange))] text-white font-orbitron px-8 py-6">
                Connect Wallet
              </Button>
              <Link href="/token-dashboard">
                <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] font-orbitron px-8 py-6">
                  View Token Dashboard
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
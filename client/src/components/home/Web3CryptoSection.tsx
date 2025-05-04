import { Wallet, Gamepad, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { WalletConnect } from "@/components/web3/WalletConnect";

export function Web3CryptoSection() {
  return (
    <section className="py-16 bg-[hsl(var(--cwg-dark-blue))]/30 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 top-20 -right-20 bg-[hsl(var(--cwg-blue))]/10 rounded-full blur-3xl"></div>
        <div className="absolute w-96 h-96 -bottom-20 -left-20 bg-[hsl(var(--cwg-orange))]/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Web3 Gaming Ecosystem</h2>
          <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
            Discover the future of gaming where players own their assets and earn real value
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Crypto Wallet Card */}
          <div className="card-gradient rounded-xl p-6 md:p-8 border border-[hsl(var(--cwg-blue))]/20 hover:border-[hsl(var(--cwg-blue))] transition-colors duration-300">
            <div className="h-16 w-16 rounded-lg bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mb-6">
              <Wallet className="text-[hsl(var(--cwg-blue))] text-2xl" />
            </div>
            <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">
              Connect Your Crypto Wallet
            </h3>
            <p className="mt-4 text-[hsl(var(--cwg-muted))]">
              Link your Web3 wallet to start earning, trading, and managing your in-game assets. We support MetaMask, Coinbase Wallet, and other popular providers.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start">
                <Check className="text-[hsl(var(--cwg-blue))] mt-1 mr-3" />
                <span className="text-[hsl(var(--cwg-muted))]">Securely store your game assets as NFTs</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[hsl(var(--cwg-blue))] mt-1 mr-3" />
                <span className="text-[hsl(var(--cwg-muted))]">Earn cryptocurrency through gameplay</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[hsl(var(--cwg-blue))] mt-1 mr-3" />
                <span className="text-[hsl(var(--cwg-muted))]">Trade items with other players</span>
              </li>
            </ul>
            <div className="mt-8">
              <WalletConnect />
            </div>
          </div>
          
          {/* Play-to-Earn Games Card */}
          <div className="card-gradient rounded-xl p-6 md:p-8 border border-[hsl(var(--cwg-orange))]/20 hover:border-[hsl(var(--cwg-orange))] transition-colors duration-300">
            <div className="h-16 w-16 rounded-lg bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mb-6">
              <Gamepad className="text-[hsl(var(--cwg-orange))] text-2xl" />
            </div>
            <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">
              Play-to-Earn Games
            </h3>
            <p className="mt-4 text-[hsl(var(--cwg-muted))]">
              Join our guild to access premium play-to-earn games where your skills translate to real earnings and valuable digital assets.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {/* Game thumbnails */}
              <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-lg border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))] transition-colors">
                <div className="w-full h-20 bg-[hsl(var(--cwg-dark-blue))] rounded flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <polygon points="50,20 80,40 80,70 50,90 20,70 20,40" fill="#FF6B00" fillOpacity="0.5" />
                    <text x="50" y="60" textAnchor="middle" fontFamily="Orbitron" fontSize="10" fill="#FFFFFF">BF</text>
                  </svg>
                </div>
                <p className="mt-2 text-center text-xs text-[hsl(var(--cwg-muted))]">Boss Fighters</p>
              </div>
              <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-lg border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))] transition-colors">
                <div className="w-full h-20 bg-[hsl(var(--cwg-dark-blue))] rounded flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <circle cx="50" cy="50" r="30" fill="#00A3FF" fillOpacity="0.5" />
                    <text x="50" y="55" textAnchor="middle" fontFamily="Orbitron" fontSize="10" fill="#FFFFFF">GR</text>
                  </svg>
                </div>
                <p className="mt-2 text-center text-xs text-[hsl(var(--cwg-muted))]">Galaxy Raiders</p>
              </div>
              <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-lg border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))] transition-colors">
                <div className="w-full h-20 bg-[hsl(var(--cwg-dark-blue))] rounded flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <rect x="30" y="30" width="40" height="40" fill="#FF6B00" fillOpacity="0.5" />
                    <text x="50" y="55" textAnchor="middle" fontFamily="Orbitron" fontSize="10" fill="#FFFFFF">CL</text>
                  </svg>
                </div>
                <p className="mt-2 text-center text-xs text-[hsl(var(--cwg-muted))]">Crypto Legends</p>
              </div>
            </div>
            <Button className="mt-8 px-6 py-3 bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] rounded-lg font-orbitron btn-hover transition-all duration-300">
              Explore Games
            </Button>
          </div>
        </div>
        
        {/* Join CTA */}
        <div className="mt-16 card-gradient rounded-xl p-6 md:p-8 border border-[hsl(var(--cwg-orange))]/20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3">
              <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Ready to join ClockWork Gamers?</h3>
              <p className="mt-4 text-[hsl(var(--cwg-muted))]">
                Become part of our Web3 gaming community today and start earning while playing your favorite games.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/auth">
                  <Button className="px-6 py-3 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white rounded-lg font-orbitron btn-hover transition-all duration-300">
                    Join Our Guild
                  </Button>
                </Link>
                <a href="https://discord.gg/qC3wMKXYQb" target="_blank" rel="noopener noreferrer">
                  <Button className="px-6 py-3 border border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] rounded-lg font-orbitron hover:bg-[hsl(var(--cwg-blue))] hover:text-[hsl(var(--cwg-dark))] transition-colors duration-300">
                    Discord Community
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-8 md:mt-0 md:w-1/3 flex justify-center">
              <div className="w-48 h-48 relative animate-float">
                <div className="w-full h-full hexagon bg-gradient-to-br from-[hsl(var(--cwg-orange))]/20 to-[hsl(var(--cwg-blue))]/20 border border-[hsl(var(--cwg-orange))]/50 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-32 h-32">
                    <polygon points="60,10 110,40 110,90 60,120 10,90 10,40" fill="none" stroke="#FF6B00" strokeWidth="2" />
                    <text x="60" y="65" textAnchor="middle" fontFamily="Orbitron" fontSize="16" fill="#FFFFFF">NFT</text>
                    <text x="60" y="85" textAnchor="middle" fontFamily="Inter" fontSize="12" fill="#9B9BAD">ASSET</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Web3CryptoSection;

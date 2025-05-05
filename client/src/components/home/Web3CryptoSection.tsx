import { Wallet, Gamepad, Check, Zap, ChevronsUp, Trophy, Coins, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { useEffect, useRef } from "react";

export function Web3CryptoSection() {
  const web3Ref = useRef<HTMLDivElement>(null);
  
  // Add scrolling effect for the background grid
  useEffect(() => {
    if (web3Ref.current) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        if (web3Ref.current) {
          web3Ref.current.style.backgroundPosition = `0 ${scrollPosition * 0.05}px`;
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <section ref={web3Ref} className="py-16 bg-web3-grid relative overflow-hidden animate-cyber-scan">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 top-20 -right-20 bg-[hsl(var(--cwg-blue))]/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute w-96 h-96 -bottom-20 -left-20 bg-[hsl(var(--cwg-orange))]/20 rounded-full blur-3xl animate-pulse-glow"></div>
        
        {/* Floating Web3 elements */}
        <div className="absolute top-1/5 right-1/5 w-10 h-10 diamond bg-[hsl(var(--cwg-orange))]/30 animate-float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/5 left-1/5 w-8 h-8 hexagon bg-[hsl(var(--cwg-blue))]/30 animate-float" style={{animationDelay: '1.2s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-orbitron font-bold neon-text-orange">Web3 Gaming Ecosystem</h2>
          <div className="mt-4 max-w-3xl mx-auto flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <div className="h-1 w-12 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-transparent"></div>
            </div>
            <p className="text-[hsl(var(--cwg-muted))] max-w-2xl">
              Discover the future of gaming where players own their assets and earn real value
            </p>
            <div className="flex items-center">
              <div className="h-1 w-12 bg-gradient-to-l from-[hsl(var(--cwg-orange))] to-transparent"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Crypto Wallet Card */}
          <div className="card-gradient rounded-xl p-6 md:p-8 border border-[hsl(var(--cwg-blue))]/20 hover:border-[hsl(var(--cwg-blue))] transition-colors duration-300 web3-chip neon-border-blue group">
            <div className="h-16 w-16 rounded-lg bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mb-6 blue-glow group-hover:scale-110 transition-transform duration-300">
              <Wallet className="text-[hsl(var(--cwg-blue))] text-2xl" />
            </div>
            <h3 className="text-2xl font-orbitron font-semibold neon-text-blue">
              Connect Your Crypto Wallet
            </h3>
            <p className="mt-4 text-[hsl(var(--cwg-muted))]">
              Link your Web3 wallet to start earning, trading, and managing your in-game assets. We support MetaMask, Coinbase Wallet, and other popular providers.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start">
                <Check className="text-[hsl(var(--cwg-blue))] mt-1 mr-3 animate-pulse-glow" />
                <span className="text-[hsl(var(--cwg-muted))]">Securely store your game assets as NFTs</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[hsl(var(--cwg-blue))] mt-1 mr-3 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                <span className="text-[hsl(var(--cwg-muted))]">Earn cryptocurrency through gameplay</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[hsl(var(--cwg-blue))] mt-1 mr-3 animate-pulse-glow" style={{ animationDelay: '1s' }} />
                <span className="text-[hsl(var(--cwg-muted))]">Trade items with other players</span>
              </li>
            </ul>
            <div className="mt-8">
              <WalletConnect />
            </div>
          </div>
          
          {/* Play-to-Earn Games Card */}
          <div className="card-gradient rounded-xl p-6 md:p-8 border border-[hsl(var(--cwg-orange))]/20 hover:border-[hsl(var(--cwg-orange))] transition-colors duration-300 web3-chip neon-border-orange group">
            <div className="h-16 w-16 rounded-lg bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mb-6 neon-glow group-hover:scale-110 transition-transform duration-300">
              <Gamepad className="text-[hsl(var(--cwg-orange))] text-2xl" />
            </div>
            <h3 className="text-2xl font-orbitron font-semibold neon-text-orange">
              Play-to-Earn Games
            </h3>
            <p className="mt-4 text-[hsl(var(--cwg-muted))]">
              Join our guild to access premium play-to-earn games where your skills translate to real earnings and valuable digital assets.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {/* Game thumbnails */}
              <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-lg web3-chip neon-border-orange btn-hover web3-hover">
                <div className="w-full h-20 bg-[hsl(var(--cwg-dark-blue))] rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-web3-grid opacity-30"></div>
                  <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10">
                    <polygon points="50,20 80,40 80,70 50,90 20,70 20,40" fill="#FF6B00" fillOpacity="0.7" />
                    <text x="50" y="60" textAnchor="middle" fontFamily="Orbitron" fontSize="10" fill="#FFFFFF" className="neon-text-orange">BF</text>
                  </svg>
                </div>
                <p className="mt-2 text-center text-xs text-[hsl(var(--cwg-muted))]">Boss Fighters</p>
              </div>
              <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-lg web3-chip neon-border-blue btn-hover-blue web3-hover">
                <div className="w-full h-20 bg-[hsl(var(--cwg-dark-blue))] rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-web3-grid opacity-30"></div>
                  <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10">
                    <circle cx="50" cy="50" r="30" fill="#00A3FF" fillOpacity="0.7" />
                    <text x="50" y="55" textAnchor="middle" fontFamily="Orbitron" fontSize="10" fill="#FFFFFF" className="neon-text-blue">KO</text>
                  </svg>
                </div>
                <p className="mt-2 text-center text-xs text-[hsl(var(--cwg-muted))]">KoKodi</p>
              </div>
              <div className="bg-[hsl(var(--cwg-dark))] p-3 rounded-lg web3-chip neon-border-orange btn-hover web3-hover">
                <div className="w-full h-20 bg-[hsl(var(--cwg-dark-blue))] rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-web3-grid opacity-30"></div>
                  <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10">
                    <rect x="30" y="30" width="40" height="40" fill="#FF6B00" fillOpacity="0.7" />
                    <text x="50" y="55" textAnchor="middle" fontFamily="Orbitron" fontSize="10" fill="#FFFFFF" className="neon-text-orange">NH</text>
                  </svg>
                </div>
                <p className="mt-2 text-center text-xs text-[hsl(var(--cwg-muted))]">Nyan Heroes</p>
              </div>
            </div>
            <Button className="mt-8 px-6 py-3 bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] rounded-lg font-orbitron btn-hover transition-all duration-300 neon-glow">
              Explore Games
            </Button>
          </div>
        </div>
        
        {/* Web3 Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="web3-chip card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-orange))]/20 neon-border-orange group hover:scale-105 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mb-4 neon-glow group-hover:animate-pulse-glow">
              <Zap className="text-[hsl(var(--cwg-orange))] text-xl" />
            </div>
            <h4 className="text-xl font-orbitron font-semibold neon-text-orange">Play-to-Earn</h4>
            <p className="mt-2 text-sm text-[hsl(var(--cwg-muted))]">
              Turn your gaming skills into real income through blockchain-based rewards and assets.
            </p>
          </div>
          
          <div className="web3-chip card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-blue))]/20 neon-border-blue group hover:scale-105 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mb-4 blue-glow group-hover:animate-pulse-glow">
              <Coins className="text-[hsl(var(--cwg-blue))] text-xl" />
            </div>
            <h4 className="text-xl font-orbitron font-semibold neon-text-blue">NFT Assets</h4>
            <p className="mt-2 text-sm text-[hsl(var(--cwg-muted))]">
              Own, trade, and monetize your in-game items as non-fungible tokens on the blockchain.
            </p>
          </div>
          
          <div className="web3-chip card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-orange))]/20 neon-border-orange group hover:scale-105 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mb-4 neon-glow group-hover:animate-pulse-glow">
              <Trophy className="text-[hsl(var(--cwg-orange))] text-xl" />
            </div>
            <h4 className="text-xl font-orbitron font-semibold neon-text-orange">Guild Benefits</h4>
            <p className="mt-2 text-sm text-[hsl(var(--cwg-muted))]">
              Access exclusive games, scholarships, and tournaments as a ClockWork Gamers member.
            </p>
          </div>
        </div>
        
        {/* Join CTA */}
        <div className="mt-16 web3-gradient rounded-xl p-6 md:p-8 border-2 border-[hsl(var(--cwg-orange))]/50 animate-cyber-scan relative overflow-hidden">
          <div className="absolute inset-0 bg-web3-dots"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3">
              <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">
                Ready to join <span className="neon-text-orange">ClockWork Gamers</span>?
              </h3>
              <p className="mt-4 text-[hsl(var(--cwg-muted))]">
                Become part of our Web3 gaming community today and start earning while playing your favorite games.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/auth">
                  <Button className="neon-border-orange px-6 py-3 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange-dark))] text-white rounded-lg font-orbitron btn-hover web3-hover transition-all duration-300">
                    <Users className="mr-2" /> Join Our Guild
                  </Button>
                </Link>
                <a href="https://discord.gg/qC3wMKXYQb" target="_blank" rel="noopener noreferrer">
                  <Button className="neon-border-blue px-6 py-3 bg-gradient-to-r from-[hsl(var(--cwg-blue))] to-[hsl(var(--cwg-blue-dark))] text-white rounded-lg font-orbitron btn-hover-blue web3-hover transition-all duration-300">
                    <Users className="mr-2" /> Discord Community
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-8 md:mt-0 md:w-1/3 flex justify-center">
              <div className="w-48 h-48 relative animate-float">
                <div className="w-full h-full hexagon bg-gradient-to-br from-[hsl(var(--cwg-orange))]/30 to-[hsl(var(--cwg-blue))]/30 border-2 border-[hsl(var(--cwg-orange))]/70 flex items-center justify-center neon-glow">
                  <svg viewBox="0 0 120 120" className="w-32 h-32 animate-cyber-scan">
                    <polygon points="60,10 110,40 110,90 60,120 10,90 10,40" fill="none" stroke="#FF6B00" strokeWidth="2" />
                    <text x="60" y="65" textAnchor="middle" fontFamily="Orbitron" fontSize="16" fill="#FFFFFF" className="neon-text-orange">NFT</text>
                    <text x="60" y="85" textAnchor="middle" fontFamily="Inter" fontSize="12" fill="#9B9BAD">ASSET</text>
                    
                    {/* Animated circuit lines */}
                    <path className="circuit-line animate-pulse-glow" d="M60,10 L40,20" stroke="#FF6B00" strokeWidth="1" fill="none" />
                    <path className="circuit-line animate-pulse-glow" d="M110,40 L90,40" stroke="#FF6B00" strokeWidth="1" fill="none" style={{ animationDelay: '0.5s' }} />
                    <path className="circuit-line animate-pulse-glow" d="M110,90 L90,90" stroke="#00A3FF" strokeWidth="1" fill="none" style={{ animationDelay: '1s' }} />
                    <path className="circuit-line animate-pulse-glow" d="M60,120 L40,100" stroke="#00A3FF" strokeWidth="1" fill="none" style={{ animationDelay: '1.5s' }} />
                    <path className="circuit-line animate-pulse-glow" d="M10,90 L30,90" stroke="#FF6B00" strokeWidth="1" fill="none" style={{ animationDelay: '2s' }} />
                    <path className="circuit-line animate-pulse-glow" d="M10,40 L30,40" stroke="#00A3FF" strokeWidth="1" fill="none" style={{ animationDelay: '2.5s' }} />
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

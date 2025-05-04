import { Link } from "wouter";
import { Box, Users, Gamepad } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-mesh py-16 md:py-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-20 -left-20 bg-[hsl(var(--cwg-orange))]/10 rounded-full blur-3xl"></div>
        <div className="absolute w-96 h-96 bottom-10 right-10 bg-[hsl(var(--cwg-blue))]/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          {/* Hero content */}
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold text-white leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80">ClockWork Gamers</span>
            </h1>
            <p className="mt-4 md:mt-6 text-xl text-[hsl(var(--cwg-muted))] max-w-2xl">
              Join the premier Web3 gaming guild where players earn, compete, and thrive in the blockchain gaming revolution.
            </p>
            
            <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
              <a 
                href="https://openloot.com/ambassador/link?code=FROSTIIGOBLIN" 
                className="btn-hover flex items-center justify-center px-6 py-3 border-2 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))]/80 rounded-lg font-orbitron text-lg transition-all duration-300"
              >
                <Box className="mr-2" /> Open Loot
              </a>
              <a 
                href="https://discord.gg/qC3wMKXYQb" 
                className="btn-hover flex items-center justify-center px-6 py-3 border-2 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] bg-[hsl(var(--cwg-dark))]/80 rounded-lg font-orbitron text-lg transition-all duration-300"
              >
                <Users className="mr-2" /> Community
              </a>
              <a 
                href="https://economy.bossfighters.game/register?ref=9f15935b" 
                className="btn-hover flex items-center justify-center px-6 py-3 border-2 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))]/80 rounded-lg font-orbitron text-lg transition-all duration-300"
              >
                <Gamepad className="mr-2" /> Boss Fighters
              </a>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="mt-10 md:mt-0 md:w-1/2">
            <div className="relative rounded-xl overflow-hidden border-2 border-[hsl(var(--cwg-dark-blue))] neon-glow">
              <svg 
                viewBox="0 0 1200 800" 
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 107, 0, 0.4))' }}
              >
                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(30, 30, 47, 0)" />
                    <stop offset="100%" stopColor="rgba(18, 18, 18, 1)" />
                  </linearGradient>
                </defs>
                <rect width="1200" height="800" fill="#1E1E2F" />
                <g>
                  <path d="M600,350 L750,250 L900,350 L750,450 Z" fill="#FF6B00" fillOpacity="0.3" />
                  <path d="M600,350 L450,250 L300,350 L450,450 Z" fill="#00A3FF" fillOpacity="0.3" />
                  <path d="M600,350 L750,450 L600,550 L450,450 Z" fill="#FF6B00" fillOpacity="0.3" />
                  <path d="M600,350 L750,250 L600,150 L450,250 Z" fill="#00A3FF" fillOpacity="0.3" />
                </g>
                <rect width="1200" height="800" fill="url(#heroGradient)" />
                
                {/* Web3 gaming elements */}
                <text x="600" y="400" fontFamily="Orbitron" fontSize="60" fill="#FFFFFF" textAnchor="middle">WEB3 GAMING</text>
                <text x="600" y="450" fontFamily="Inter" fontSize="24" fill="#9B9BAD" textAnchor="middle">EARN • COMPETE • OWN</text>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--cwg-dark))] to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

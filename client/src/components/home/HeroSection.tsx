import { Link } from "wouter";
import { Box, Users, Gamepad, Zap, ChevronsUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Animation effect for the web3 circuit lines
  useEffect(() => {
    const interval = setInterval(() => {
      if (svgRef.current) {
        const lines = svgRef.current.querySelectorAll('.circuit-line');
        lines.forEach(line => {
          const randomDelay = Math.random() * 2;
          line.setAttribute('style', `animation-delay: ${randomDelay}s`);
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="relative bg-mesh py-16 md:py-24 overflow-hidden bg-web3-circuit">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-20 -left-20 bg-[hsl(var(--cwg-orange))]/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute w-96 h-96 bottom-10 right-10 bg-[hsl(var(--cwg-blue))]/20 rounded-full blur-3xl animate-pulse-glow"></div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 diamond bg-[hsl(var(--cwg-orange))]/20 animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 hexagon bg-[hsl(var(--cwg-blue))]/20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full bg-[hsl(var(--web3-neon-green))]/30 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-5 h-5 diamond bg-[hsl(var(--web3-cyber-pink))]/20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          {/* Hero content */}
          <div className="md:w-1/2 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold leading-tight">
              Welcome to <span className="neon-text-orange animate-cyber-scan">ClockWork Gamers</span>
            </h1>
            <p className="mt-4 md:mt-6 text-xl text-[hsl(var(--cwg-muted))] max-w-2xl">
              Join the premier Web3 gaming guild where players earn, compete, and thrive in the blockchain gaming revolution.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <div className="flex items-center web3-chip neon-border-orange p-2 px-3 rounded-lg">
                <Zap className="text-[hsl(var(--cwg-orange))] mr-2" size={20} />
                <span className="text-[hsl(var(--cwg-text))] font-orbitron text-sm">Play-to-Earn</span>
              </div>
              
              <div className="flex items-center web3-chip neon-border-blue p-2 px-3 rounded-lg">
                <ChevronsUp className="text-[hsl(var(--cwg-blue))] mr-2" size={20} />
                <span className="text-[hsl(var(--cwg-text))] font-orbitron text-sm">Skill-to-Earn</span>
              </div>
              
              <div className="flex items-center web3-chip neon-border-orange p-2 px-3 rounded-lg">
                <Coins className="text-[hsl(var(--cwg-orange))] mr-2" size={20} />
                <span className="text-[hsl(var(--cwg-text))] font-orbitron text-sm">NFT Assets</span>
              </div>
            </div>
            
            <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
              <a 
                href="https://openloot.com/ambassador/link?code=FROSTIIGOBLIN" 
                className="neon-border-orange flex items-center justify-center px-6 py-3 border-2 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))]/80 rounded-lg font-orbitron text-lg transition-all duration-300 btn-hover web3-hover"
              >
                <Box className="mr-2" /> Open Loot
              </a>
              <a 
                href="https://discord.gg/qC3wMKXYQb" 
                className="neon-border-blue flex items-center justify-center px-6 py-3 border-2 border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] bg-[hsl(var(--cwg-dark))]/80 rounded-lg font-orbitron text-lg transition-all duration-300 btn-hover-blue web3-hover"
              >
                <Users className="mr-2" /> Community
              </a>
              <a 
                href="https://economy.bossfighters.game/register?ref=9f15935b" 
                className="neon-border-orange flex items-center justify-center px-6 py-3 border-2 border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))]/80 rounded-lg font-orbitron text-lg transition-all duration-300 btn-hover web3-hover"
              >
                <Gamepad className="mr-2" /> Boss Fighters
              </a>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="mt-10 md:mt-0 md:w-1/2 z-10">
            <div className="relative rounded-xl overflow-hidden border-2 border-[hsl(var(--cwg-dark-blue))] neon-glow web3-chip">
              <svg 
                ref={svgRef}
                viewBox="0 0 1200 800" 
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 107, 0, 0.5))' }}
              >
                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(30, 30, 47, 0)" />
                    <stop offset="100%" stopColor="rgba(18, 18, 18, 1)" />
                  </linearGradient>
                  
                  {/* Glowing effect for the orange */}
                  <filter id="orangeGlow">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  {/* Glowing effect for the blue */}
                  <filter id="blueGlow">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Background */}
                <rect width="1200" height="800" fill="#1a1a2e" />
                
                {/* Circuit pattern background */}
                <g opacity="0.2">
                  <path className="circuit-line animate-pulse-glow" d="M0,200 L400,200 L400,600 L800,600" stroke="#00A3FF" strokeWidth="2" fill="none" />
                  <path className="circuit-line animate-pulse-glow" d="M1200,600 L800,600 L800,200 L400,200" stroke="#FF6B00" strokeWidth="2" fill="none" />
                  <path className="circuit-line animate-pulse-glow" d="M0,400 L600,400 L600,0" stroke="#00A3FF" strokeWidth="2" fill="none" />
                  <path className="circuit-line animate-pulse-glow" d="M1200,400 L600,400 L600,800" stroke="#FF6B00" strokeWidth="2" fill="none" />
                  <circle cx="400" cy="200" r="8" fill="#00A3FF" className="animate-pulse-glow" />
                  <circle cx="800" cy="600" r="8" fill="#FF6B00" className="animate-pulse-glow" />
                  <circle cx="600" cy="400" r="12" fill="#FFFFFF" className="animate-pulse-glow" />
                </g>
                
                {/* Hexagonal geometric Web3 elements */}
                <g>
                  <path d="M600,350 L750,250 L900,350 L750,450 Z" fill="#FF6B00" fillOpacity="0.4" filter="url(#orangeGlow)" />
                  <path d="M600,350 L450,250 L300,350 L450,450 Z" fill="#00A3FF" fillOpacity="0.4" filter="url(#blueGlow)" />
                  <path d="M600,350 L750,450 L600,550 L450,450 Z" fill="#FF6B00" fillOpacity="0.4" filter="url(#orangeGlow)" />
                  <path d="M600,350 L750,250 L600,150 L450,250 Z" fill="#00A3FF" fillOpacity="0.4" filter="url(#blueGlow)" />
                </g>
                
                <rect width="1200" height="800" fill="url(#heroGradient)" />
                
                {/* Web3 gaming elements with glow */}
                <text x="600" y="380" fontFamily="Orbitron" fontSize="60" fill="#FFFFFF" textAnchor="middle" className="animate-cyber-scan">
                  <tspan className="neon-text-orange">WEB3</tspan> <tspan className="neon-text-blue">GAMING</tspan>
                </text>
                <text x="600" y="450" fontFamily="Inter" fontSize="24" fill="#9B9BAD" textAnchor="middle">EARN • COMPETE • OWN</text>
                
                {/* Digital particles */}
                <g>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <circle 
                      key={i}
                      cx={Math.random() * 1200} 
                      cy={Math.random() * 800} 
                      r={Math.random() * 2 + 1} 
                      fill={Math.random() > 0.5 ? "#FF6B00" : "#00A3FF"} 
                      opacity={Math.random() * 0.5 + 0.3}
                      className="animate-pulse-glow"
                    />
                  ))}
                </g>
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

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import AuthForm from "@/components/auth/AuthForm";
import { Gamepad, Coins, Trophy, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // Redirect to home if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="relative bg-mesh py-12 px-4 flex-grow">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-20 -left-20 bg-[hsl(var(--cwg-orange))]/10 rounded-full blur-3xl"></div>
          <div className="absolute w-96 h-96 bottom-10 right-10 bg-[hsl(var(--cwg-blue))]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Auth Form */}
            <div className="w-full max-w-md mx-auto">
              <AuthForm />
            </div>
            
            {/* Hero/Info Section */}
            <div className="hidden md:block">
              <h1 className="text-4xl font-orbitron font-bold text-white leading-tight mb-6">
                The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80">Web3 Gaming</span>
              </h1>
              <p className="text-xl text-[hsl(var(--cwg-muted))] mb-8">
                Join ClockWork Gamers and become part of the blockchain gaming revolution. Own your assets, earn rewards, and connect with other players.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-lg bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mr-4">
                    <Gamepad className="text-[hsl(var(--cwg-orange))] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Play-to-Earn Games</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">Access premium games where your skills earn real rewards</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-lg bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mr-4">
                    <Trophy className="text-[hsl(var(--cwg-blue))] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Competitive Tournaments</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">Participate in guild events with exclusive prizes</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-lg bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mr-4">
                    <Coins className="text-[hsl(var(--cwg-orange))] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Asset Ownership</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">Own and trade your in-game items as NFTs</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-lg bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mr-4">
                    <Users className="text-[hsl(var(--cwg-blue))] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Community</h3>
                    <p className="text-[hsl(var(--cwg-muted))]">Connect with like-minded gamers globally</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

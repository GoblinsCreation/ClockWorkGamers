import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import GuildAchievements from "@/components/home/GuildAchievements";
import LatestNews from "@/components/home/LatestNews";
import LiveStreamers from "@/components/home/LiveStreamers";
import Web3CryptoSection from "@/components/home/Web3CryptoSection";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  // Check if this is the user's first visit (for registration modal)
  useEffect(() => {
    const hasVisited = localStorage.getItem('cwg_visited');
    if (!hasVisited && !user) {
      setIsFirstVisit(true);
      localStorage.setItem('cwg_visited', 'true');
    }
  }, [user]);
  
  const { data: isAuthenticated } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ['/api/check-auth'],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: 'include' });
      return await res.json();
    },
  });
  
  const closeRegistrationModal = () => {
    setIsFirstVisit(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Registration Modal (on first visit) */}
      {isFirstVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--cwg-dark-blue))] rounded-xl p-6 max-w-lg w-full mx-4 border border-[hsl(var(--cwg-blue))] blue-glow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-blue))]">Join ClockWork Gamers</h2>
              <button 
                className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-text))]"
                onClick={closeRegistrationModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <p className="text-[hsl(var(--cwg-muted))] mb-6">
              Join the premier Web3 gaming guild to access exclusive features, earn while playing, and connect with other players!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white py-3 rounded-lg font-orbitron font-medium btn-hover transition-all duration-300">
                  Create Account
                </Button>
              </Link>
              <Button 
                onClick={closeRegistrationModal}
                className="w-full bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] py-3 rounded-lg font-orbitron font-medium transition-all duration-300"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <HeroSection />
      <GuildAchievements />
      <LatestNews />
      <LiveStreamers />
      <Web3CryptoSection />
      <Footer />
    </div>
  );
}

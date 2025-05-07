import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Gift, ChevronDown, Trophy } from "lucide-react";
import { WalletConnect } from "@/components/web3/WalletConnect";
import NotificationBell from "@/components/notifications/NotificationBell";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Streamers", path: "/streamers" },
    { name: "Rentals", path: "/rentals" },
    { name: "Courses", path: "/courses" },
    { name: "Games", path: "/games" },
    { name: "Investments", path: "/investments" },
    { name: "CWG NFTs", path: "/nft-marketplace" },
    { name: "Guild Tokens", path: "/token-dashboard" },
    { name: "Showcase", path: "/showcase" },
    { name: "Achievements", path: "/achievements" },
    { name: "Calculators", path: "/calculators" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className="bg-[hsl(var(--cwg-dark))]/90 backdrop-blur-sm border-b border-[hsl(var(--cwg-dark-blue))] sticky top-0 z-50 neon-border-blue shadow-lg">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Left side with logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer group">
                  <img src="/attached_assets/cwg.gif" alt="CWG Logo" className="h-10 mr-2 neon-glow-blue transition-all duration-300 group-hover:scale-110" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-10 w-10 bg-[hsl(var(--cwg-orange))] flex items-center justify-center neon-glow-orange';
                      fallback.innerHTML = '<span class="text-white font-orbitron font-bold text-xs">CWG</span>';
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                  <span className="font-orbitron font-bold text-xl md:text-2xl group-hover:scale-105 transition-all duration-300">
                    <span className="neon-text-orange">Clock</span>
                    <span className="neon-text-blue">Work</span>{" "}
                    <span className="neon-text-purple">Gamers</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Center navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-6">
            <div className="flex space-x-4 xl:space-x-6 overflow-x-auto px-4 py-2 scrollbar-hide">
              {navLinks.map((link, index) => {
                // Alternate colors for a cyberpunk effect
                const colors = ["orange", "blue", "purple", "green"];
                const colorIndex = index % colors.length;
                const color = colors[colorIndex];
                
                return (
                  <Link key={link.path} href={link.path}>
                    <div className={`font-orbitron text-sm cursor-pointer whitespace-nowrap rounded-md ${
                      location === link.path 
                        ? `neon-text-${color} neon-border-${color} border-b-2 bg-[hsl(var(--cwg-dark-blue))]/30`
                        : `text-[hsl(var(--cwg-muted))] hover:neon-text-${color} hover:neon-glow-sm-${color}`
                      } px-3 py-1.5 transition-all duration-300 hover:scale-105`}>
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-1 sm:mr-3 w-12 sm:w-40">
              <WalletConnect />
            </div>
            
            {user && (
              <div className="mr-2">
                <NotificationBell />
              </div>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-[hsl(var(--cwg-dark-blue))]/70 neon-border-blue px-2 sm:px-4 py-2 rounded-lg font-orbitron text-xs sm:text-sm hover:neon-glow-blue transition-all duration-300"
                  >
                    <span className="hidden sm:inline neon-text-blue">{user.username}</span>
                    <User className="sm:hidden h-4 w-4 neon-text-blue" />
                    <ChevronDown className="ml-1 sm:ml-2 h-4 w-4 neon-text-blue" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-[hsl(var(--cwg-dark))]/95 backdrop-blur-sm neon-card-blue border-[hsl(var(--cwg-blue))] p-1"
                >
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer font-orbitron rounded-md my-1 focus:bg-[hsl(var(--cwg-dark-blue))]/70 focus:neon-text-blue">
                      <User className="mr-2 h-4 w-4 neon-text-blue" /> 
                      <span className="hover:neon-text-blue transition-colors duration-200">Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/achievements">
                    <DropdownMenuItem className="cursor-pointer font-orbitron rounded-md my-1 focus:bg-[hsl(var(--cwg-dark-blue))]/70 focus:neon-text-orange">
                      <Trophy className="mr-2 h-4 w-4 neon-text-orange" /> 
                      <span className="hover:neon-text-orange transition-colors duration-200">Achievements</span>
                    </DropdownMenuItem>
                  </Link>
                  {/* Chat is now available via floating widget */}
                  <Link href="/referrals">
                    <DropdownMenuItem className="cursor-pointer font-orbitron rounded-md my-1 focus:bg-[hsl(var(--cwg-dark-blue))]/70 focus:neon-text-green">
                      <Gift className="mr-2 h-4 w-4 neon-text-green" /> 
                      <span className="hover:neon-text-green transition-colors duration-200">Referrals</span>
                    </DropdownMenuItem>
                  </Link>
                  {(user?.isAdmin || user?.role === "Mod" || user?.role === "Admin" || user?.role === "Owner") && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer font-orbitron rounded-md my-1 focus:bg-[hsl(var(--cwg-dark-blue))]/70 focus:neon-text-purple">
                        <User className="mr-2 h-4 w-4 neon-text-purple" /> 
                        <span className="hover:neon-text-purple transition-colors duration-200">Admin</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator className="bg-[hsl(var(--cwg-blue))]/30 my-1.5" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer font-orbitron rounded-md my-1 focus:bg-[hsl(var(--cwg-dark-blue))]/70 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-400" /> 
                    <span className="hover:text-red-400 transition-colors duration-200">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  className="bg-[hsl(var(--cwg-dark-blue))]/70 neon-border-orange px-2 sm:px-4 py-2 rounded-lg font-orbitron text-xs sm:text-sm hover:neon-glow transition-all duration-300 group"
                >
                  <span className="hidden sm:inline neon-text-orange group-hover:scale-105 transition-transform duration-300">Sign In</span>
                  <User className="sm:hidden h-4 w-4 neon-text-orange group-hover:scale-110 transition-transform duration-300" />
                </Button>
              </Link>
            )}
            
            <div className="lg:hidden ml-2 sm:ml-4">
              <Button 
                variant="ghost" 
                className={`text-[hsl(var(--cwg-text))] hover:neon-text-purple transition-all duration-300 rounded-md ${mobileMenuOpen ? 'neon-text-purple neon-glow-sm-purple bg-[hsl(var(--cwg-dark-blue))]/30' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(var(--cwg-dark-blue))]/95 backdrop-blur-sm neon-border-blue shadow-lg">
          <div className="px-2 pt-3 pb-4 space-y-2 sm:px-4 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link, index) => {
              // Alternate colors for a cyberpunk effect
              const colors = ["orange", "blue", "purple", "green"];
              const colorIndex = index % colors.length;
              const color = colors[colorIndex];
              
              return (
                <Link key={link.path} href={link.path}>
                  <div 
                    className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer transition-all duration-300 ${
                      location === link.path 
                        ? `neon-text-${color} bg-[hsl(var(--cwg-dark))]/50 neon-glow-sm-${color}` 
                        : `text-[hsl(var(--cwg-muted))] hover:neon-text-${color} hover:translate-x-1`
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </div>
                </Link>
              );
            })}
            
            {user && (
              <>
                <div className="h-px bg-[hsl(var(--cwg-blue))]/30 w-full my-3 neon-glow-sm-blue"></div>
                <Link href="/profile">
                  <div 
                    className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer transition-all duration-300 ${
                      location === '/profile' 
                        ? 'neon-text-blue bg-[hsl(var(--cwg-dark))]/50 neon-glow-sm-blue' 
                        : 'text-[hsl(var(--cwg-muted))] hover:neon-text-blue hover:translate-x-1'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="inline-block mr-2 h-4 w-4" /> Profile
                  </div>
                </Link>
                {/* Chat is now available via floating widget */}
                <Link href="/referrals">
                  <div 
                    className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer transition-all duration-300 ${
                      location === '/referrals' 
                        ? 'neon-text-orange bg-[hsl(var(--cwg-dark))]/50 neon-glow-sm' 
                        : 'text-[hsl(var(--cwg-muted))] hover:neon-text-orange hover:translate-x-1'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Gift className="inline-block mr-2 h-4 w-4" /> Referrals
                  </div>
                </Link>
                {(user?.isAdmin || user?.role === "Mod" || user?.role === "Admin" || user?.role === "Owner") && (
                  <Link href="/admin">
                    <div 
                      className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer transition-all duration-300 ${
                        location === '/admin' 
                          ? 'neon-text-purple bg-[hsl(var(--cwg-dark))]/50 neon-glow-sm-purple' 
                          : 'text-[hsl(var(--cwg-muted))] hover:neon-text-purple hover:translate-x-1'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="inline-block mr-2 h-4 w-4" /> Admin
                    </div>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

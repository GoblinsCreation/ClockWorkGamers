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
import { Menu, LogOut, User, MessageSquare, Gift, ChevronDown, Trophy } from "lucide-react";
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
    { name: "Achievements", path: "/achievements" },
    { name: "Calculators", path: "/calculators" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className="bg-[hsl(var(--cwg-dark))] border-b border-[hsl(var(--cwg-dark-blue))] sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Left side with logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <img src="/attached_assets/cwg.gif" alt="CWG Logo" className="h-10 mr-2" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-10 w-10 bg-[hsl(var(--cwg-orange))] flex items-center justify-center';
                      fallback.innerHTML = '<span class="text-white font-orbitron font-bold text-xs">CWG</span>';
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                  <span className="text-[hsl(var(--cwg-orange))] font-orbitron font-bold text-xl md:text-2xl">
                    ClockWork Gamers
                  </span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Center navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-6">
            <div className="flex space-x-4 xl:space-x-6 overflow-x-auto px-4 py-2 scrollbar-hide">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div className={`font-orbitron text-sm cursor-pointer whitespace-nowrap ${location === link.path ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'} px-2 py-1 transition-colors duration-200`}>
                    {link.name}
                  </div>
                </Link>
              ))}
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
                  <Button variant="outline" className="bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-blue))] border border-[hsl(var(--cwg-blue))] px-2 sm:px-4 py-2 rounded-lg font-orbitron text-xs sm:text-sm btn-hover transition-all duration-300">
                    <span className="hidden sm:inline">{user.username}</span>
                    <User className="sm:hidden h-4 w-4" />
                    <ChevronDown className="ml-1 sm:ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/achievements">
                    <DropdownMenuItem className="cursor-pointer">
                      <Trophy className="mr-2 h-4 w-4" /> Achievements
                    </DropdownMenuItem>
                  </Link>
                  {/* Chat is now available via floating widget */}
                  <Link href="/referrals">
                    <DropdownMenuItem className="cursor-pointer">
                      <Gift className="mr-2 h-4 w-4" /> Referrals
                    </DropdownMenuItem>
                  </Link>
                  {(user?.isAdmin || user?.role === "Mod" || user?.role === "Admin" || user?.role === "Owner") && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> Admin
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="outline" className="bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-blue))] border border-[hsl(var(--cwg-blue))] px-2 sm:px-4 py-2 rounded-lg font-orbitron text-xs sm:text-sm btn-hover transition-all duration-300">
                  <span className="hidden sm:inline">Sign In</span>
                  <User className="sm:hidden h-4 w-4" />
                </Button>
              </Link>
            )}
            
            <div className="lg:hidden ml-2 sm:ml-4">
              <Button 
                variant="ghost" 
                className="text-[hsl(var(--cwg-text))] hover:text-[hsl(var(--cwg-orange))]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(var(--cwg-dark-blue))]">
          <div className="px-2 pt-3 pb-4 space-y-2 sm:px-4 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <div 
                  className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer ${location === link.path ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}
            
            {user && (
              <>
                <Link href="/profile">
                  <div 
                    className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer ${location === '/profile' ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </div>
                </Link>
                {/* Chat is now available via floating widget */}
                <Link href="/referrals">
                  <div 
                    className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium cursor-pointer ${location === '/referrals' ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Referrals
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

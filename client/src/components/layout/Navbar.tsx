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
import { Menu, LogOut, User, UserCircle, ChevronDown } from "lucide-react";
import { WalletConnect } from "@/components/web3/WalletConnect";

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
    { name: "Play-to-Earn", path: "/play-to-earn" },
    { name: "Pay-to-Earn", path: "/pay-to-earn" },
    { name: "CWG NFTs", path: "/nft-marketplace" },
    { name: "Guild Tokens", path: "/token-dashboard" },
    { name: "Calculators", path: "/calculators" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className="bg-[hsl(var(--cwg-dark))] border-b border-[hsl(var(--cwg-dark-blue))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  {/* Using the animated logo cwg.gif - path will need to be updated */}
                  <img src="/assets/cwg.gif" alt="CWG Logo" className="h-14 w-14 rounded-full" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-14 w-14 bg-[hsl(var(--cwg-orange))] rounded-full flex items-center justify-center';
                      fallback.innerHTML = '<span class="text-white font-orbitron font-bold">CWG</span>';
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                  <span className="ml-3 text-[hsl(var(--cwg-orange))] font-orbitron font-bold text-xl">ClockWork Gamers</span>
                </a>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center space-x-3">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={`font-orbitron text-sm whitespace-nowrap ${location === link.path ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'} px-1 transition-colors duration-200`}>
                  {link.name}
                </a>
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link href="/admin">
                <a className={`font-orbitron text-sm whitespace-nowrap ${location === '/admin' ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'} px-1 transition-colors duration-200`}>
                  Admin
                </a>
              </Link>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="mr-3 w-40">
              <WalletConnect />
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-blue))] border border-[hsl(var(--cwg-blue))] px-4 py-2 rounded-lg font-orbitron text-sm btn-hover transition-all duration-300">
                    {user.username} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="outline" className="bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-blue))] border border-[hsl(var(--cwg-blue))] px-4 py-2 rounded-lg font-orbitron text-sm btn-hover transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            )}
            
            <div className="lg:hidden ml-4">
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
                <a 
                  className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium ${location === link.path ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link href="/admin">
                <a 
                  className={`block px-4 py-2.5 rounded-md font-orbitron text-base font-medium ${location === '/admin' ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

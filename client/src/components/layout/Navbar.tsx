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
    { name: "Calculators", path: "/calculators" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className="bg-[hsl(var(--cwg-dark))] border-b border-[hsl(var(--cwg-dark-blue))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  {/* Logo can be replaced with your SVG or image */}
                  <div className="h-12 w-12 bg-[hsl(var(--cwg-orange))] rounded-full flex items-center justify-center">
                    <span className="text-white font-orbitron font-bold">CWG</span>
                  </div>
                  <span className="ml-3 text-[hsl(var(--cwg-orange))] font-orbitron font-bold text-xl">ClockWork Gamers</span>
                </a>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={`font-orbitron ${location === link.path ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'} px-1 transition-colors duration-200`}>
                  {link.name}
                </a>
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link href="/admin">
                <a className={`font-orbitron ${location === '/admin' ? 'text-[hsl(var(--cwg-orange))] border-b-2 border-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'} px-1 transition-colors duration-200`}>
                  Admin
                </a>
              </Link>
            )}
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="outline" 
              className="bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))/80] text-white px-4 py-2 rounded-lg font-orbitron font-medium text-sm btn-hover transition-all duration-300 mr-3"
            >
              Connect Wallet
            </Button>
            
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
            
            <div className="md:hidden ml-4">
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
        <div className="md:hidden bg-[hsl(var(--cwg-dark-blue))]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a 
                  className={`block px-3 py-2 rounded-md font-orbitron text-base font-medium ${location === link.path ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link href="/admin">
                <a 
                  className={`block px-3 py-2 rounded-md font-orbitron text-base font-medium ${location === '/admin' ? 'text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-dark))/50]' : 'text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]'}`}
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

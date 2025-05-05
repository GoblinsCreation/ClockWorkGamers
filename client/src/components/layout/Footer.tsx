import { Link } from "wouter";
import { 
  MessageCircleCode, 
  Twitter, 
  Twitch,
  Youtube,
  Mail,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--cwg-dark-blue))] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Social Links */}
          <div>
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-[hsl(var(--cwg-orange))] rounded-full flex items-center justify-center">
                <span className="text-white font-orbitron font-bold">CWG</span>
              </div>
              <span className="ml-3 text-[hsl(var(--cwg-orange))] font-orbitron font-bold text-lg">ClockWork Gamers</span>
            </div>
            <p className="text-[hsl(var(--cwg-muted))] mb-6">
              The premier Web3 gaming guild where players earn, compete, and thrive in the blockchain gaming revolution.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                <MessageCircleCode className="h-5 w-5" />
              </a>
              <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                <Twitch className="h-5 w-5" />
              </a>
              <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-[hsl(var(--cwg-orange))] font-orbitron font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/streamers">
                  <a className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">Streamers</a>
                </Link>
              </li>
              <li>
                <Link href="/rentals">
                  <a className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">Rentals</a>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <a className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">Courses</a>
                </Link>
              </li>
              <li>
                <Link href="/calculators">
                  <a className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">Calculators</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Games */}
          <div>
            <h3 className="text-[hsl(var(--cwg-orange))] font-orbitron font-semibold text-lg mb-4">Games</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://economy.bossfighters.game/register?ref=9f15935b" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  Boss Fighters
                </a>
              </li>
              <li>
                <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  KoKodi
                </a>
              </li>
              <li>
                <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  Nyan Heroes
                </a>
              </li>
              <li>
                <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  Big Time
                </a>
              </li>
              <li>
                <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  WorldShards
                </a>
              </li>

              <li>
                <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  Off The Grid
                </a>
              </li>
              <li>
                <a href="#" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200">
                  RavenQuest
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Us */}
          <div>
            <h3 className="text-[hsl(var(--cwg-orange))] font-orbitron font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="text-[hsl(var(--cwg-orange))] mt-1 mr-3 h-5 w-5" />
                <span className="text-[hsl(var(--cwg-muted))]">contact@clockworkgamers.net</span>
              </li>
              <li className="flex items-start">
                <MessageCircleCode className="text-[hsl(var(--cwg-orange))] mt-1 mr-3 h-5 w-5" />
                <span className="text-[hsl(var(--cwg-muted))]">discord.gg/qC3wMKXYQb</span>
              </li>
              <li>
                <Link href="/contact">
                  <Button className="mt-4 w-full bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] px-4 py-2 rounded-lg font-orbitron text-sm hover:bg-[hsl(var(--cwg-orange))] hover:text-[hsl(var(--cwg-dark))] transition-colors duration-200">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-[hsl(var(--cwg-dark-blue))/50] pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[hsl(var(--cwg-muted))] text-sm">&copy; {new Date().getFullYear()} ClockWork Gamers. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy-policy" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] text-sm transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] text-sm transition-colors duration-200">Terms of Service</Link>
            <Link href="/cookie-policy" className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] text-sm transition-colors duration-200">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

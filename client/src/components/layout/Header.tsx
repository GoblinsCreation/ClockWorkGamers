import { Link } from "wouter";

export function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              ClockWork Gamers
            </a>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <Link href="/">
            <a className="hover:text-orange-400 transition-colors">Home</a>
          </Link>
          <Link href="/streamers">
            <a className="hover:text-orange-400 transition-colors">Streamers</a>
          </Link>
          <Link href="/rentals">
            <a className="hover:text-orange-400 transition-colors">Rentals</a>
          </Link>
          <Link href="/courses">
            <a className="hover:text-orange-400 transition-colors">Courses</a>
          </Link>
          <Link href="/nft">
            <a className="hover:text-orange-400 transition-colors">NFT Gallery</a>
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <a className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors">
              Sign In
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gray-900 rounded-xl shadow-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-white">Welcome to </span>
          <span className="text-orange-500">ClockWork Gamers</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Join our Web3 gaming guild and unlock the future of gaming with blockchain technology, NFT rentals, and a vibrant community of gamers.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth">
            <a className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors shadow-md">
              Join the Guild
            </a>
          </Link>
          <Link href="/nft">
            <a className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-md">
              Explore NFTs
            </a>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-10">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">NFT Rentals</h3>
            <p className="text-gray-300">
              Rent in-game NFTs and assets to enhance your gaming experience without high upfront costs.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Live Streamers</h3>
            <p className="text-gray-300">
              Watch our guild streamers compete in top Web3 games and learn new strategies.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Gaming Courses</h3>
            <p className="text-gray-300">
              Access exclusive courses to master Web3 games and earn more while playing.
            </p>
          </div>
        </div>
      </section>

      {/* Live Streamers Section */}
      <section className="py-12 bg-gray-900 rounded-xl px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Featured Streamers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="h-40 bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400">Streamer Thumbnail</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-1">Streamer {i}</h3>
                <p className="text-sm text-gray-400 mb-3">Game Name</p>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                    Offline
                  </span>
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/streamers">
            <a className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              View All Streamers
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </Link>
        </div>
      </section>

      {/* Join CTA Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-orange-600 to-orange-800 rounded-xl shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Join the Guild?</h2>
        <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
          Become part of our community today and start earning while gaming with Web3 technology.
        </p>
        <Link href="/auth">
          <a className="px-8 py-4 bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg rounded-lg transition-colors shadow-md">
            Register Now
          </a>
        </Link>
      </section>
    </div>
  );
}
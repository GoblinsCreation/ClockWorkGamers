import React, { useState } from "react";
import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { MessageSquare, Bell, User, ChevronDown, Menu, X } from "lucide-react";

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <nav className="bg-gray-900 border-b border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-2xl font-bold tracking-wider text-orange-500 cursor-pointer">
                  ClockWork Gamers
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/streamers">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Streamers</span>
                </Link>
                <Link href="/rentals">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Rentals</span>
                </Link>
                <Link href="/courses">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Courses</span>
                </Link>
                <Link href="/nft-marketplace">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">NFT Marketplace</span>
                </Link>
                <Link href="/achievements">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Achievements</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <MessageSquare className="h-6 w-6" />
              </button>
              <button className="p-1 ml-3 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <Bell className="h-6 w-6" />
              </button>
              
              <div className="ml-3 relative">
                <div>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold">
                      U
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                </div>
                {showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Link href="/profile">
                      <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Your Profile</span>
                    </Link>
                    <Link href="/referrals">
                      <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Referrals</span>
                    </Link>
                    <Link href="/admin">
                      <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Admin Dashboard</span>
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/streamers">
              <span className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Streamers</span>
            </Link>
            <Link href="/rentals">
              <span className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Rentals</span>
            </Link>
            <Link href="/courses">
              <span className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Courses</span>
            </Link>
            <Link href="/nft-marketplace">
              <span className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">NFT Marketplace</span>
            </Link>
            <Link href="/achievements">
              <span className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Achievements</span>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold">
                  U
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">User Name</div>
                <div className="text-sm font-medium leading-none text-gray-400">user@example.com</div>
              </div>
              <button className="ml-auto p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <Bell className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link href="/profile">
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">Your Profile</span>
              </Link>
              <Link href="/referrals">
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">Referrals</span>
              </Link>
              <Link href="/admin">
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">Admin Dashboard</span>
              </Link>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Simple page components
const HomePage = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-6 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">ClockWork Gamers</h1>
        <p className="mb-6 text-lg">Welcome to the Web3 Gaming Guild platform. This is a simplified version of the website.</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-500 mb-3">Admin Dashboard</h3>
            <p className="text-gray-300 mb-4">Manage guild members, streamers, and analytics with advanced tools.</p>
            <Link href="/admin">
              <span className="inline-flex items-center text-blue-400 hover:text-blue-300 cursor-pointer">
                Access Admin Dashboard
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
          
          <div className="bg-gray-800 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-500 mb-3">Achievements</h3>
            <p className="text-gray-300 mb-4">Explore guild achievements and claim rewards for your contributions.</p>
            <Link href="/achievements">
              <span className="inline-flex items-center text-blue-400 hover:text-blue-300 cursor-pointer">
                View Achievements
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
          
          <div className="bg-gray-800 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-500 mb-3">NFT Marketplace</h3>
            <p className="text-gray-300 mb-4">Browse, buy and sell NFTs from various blockchain games and collections.</p>
            <Link href="/nft-marketplace">
              <span className="inline-flex items-center text-blue-400 hover:text-blue-300 cursor-pointer">
                Explore Marketplace
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Guild Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/streamers">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Streamers</h3>
              <p className="text-sm text-gray-400">Watch guild streamers</p>
            </div>
          </Link>
          
          <Link href="/rentals">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Rentals</h3>
              <p className="text-sm text-gray-400">Rent in-game assets</p>
            </div>
          </Link>
          
          <Link href="/courses">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Courses</h3>
              <p className="text-sm text-gray-400">Learn gaming skills</p>
            </div>
          </Link>
          
          <Link href="/calculators">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Calculators</h3>
              <p className="text-sm text-gray-400">Game economy tools</p>
            </div>
          </Link>
          
          <Link href="/play-to-earn">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Play-to-Earn</h3>
              <p className="text-sm text-gray-400">Earn rewards by playing</p>
            </div>
          </Link>
          
          <Link href="/token-dashboard">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Token Dashboard</h3>
              <p className="text-sm text-gray-400">Manage guild tokens</p>
            </div>
          </Link>
          
          <Link href="/news">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">News</h3>
              <p className="text-sm text-gray-400">Guild announcements</p>
            </div>
          </Link>
          
          <Link href="/referrals">
            <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <h3 className="font-medium text-orange-400">Referrals</h3>
              <p className="text-sm text-gray-400">Invite friends, earn rewards</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
    
    {/* Chat Widget Button */}
    <div className="fixed bottom-4 right-4 z-50">
      <button className="bg-orange-500 hover:bg-orange-600 text-black rounded-full p-3 shadow-lg flex items-center justify-center">
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  </div>
);

// Admin page with neon styling
const AdminPage = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-400">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black/60 rounded-lg p-4 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
          <h3 className="text-lg text-blue-400 font-semibold mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-white">2,457</p>
          <p className="text-sm text-green-400">↑ 12% from last month</p>
        </div>
        
        <div className="bg-black/60 rounded-lg p-4 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.5)]">
          <h3 className="text-lg text-orange-400 font-semibold mb-1">Active Streamers</h3>
          <p className="text-3xl font-bold text-white">38</p>
          <p className="text-sm text-green-400">↑ 8% from last month</p>
        </div>
        
        <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          <h3 className="text-lg text-purple-400 font-semibold mb-1">NFT Transactions</h3>
          <p className="text-3xl font-bold text-white">1,254</p>
          <p className="text-sm text-green-400">↑ 23% from last month</p>
        </div>
        
        <div className="bg-black/60 rounded-lg p-4 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          <h3 className="text-lg text-green-400 font-semibold mb-1">Revenue (USD)</h3>
          <p className="text-3xl font-bold text-white">$45,821</p>
          <p className="text-sm text-green-400">↑ 18% from last month</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="bg-blue-500 h-4 w-4 rounded-full mr-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              Member Activity
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 h-64 flex items-center justify-center">
              <p className="text-gray-400">Activity graph would appear here</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="bg-orange-500 h-4 w-4 rounded-full mr-2 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
              Games Played
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2/3">
                  <p className="text-gray-300">Axie Infinity</p>
                  <div className="h-2 bg-gray-700 rounded-full mt-1">
                    <div className="h-2 bg-orange-500 rounded-full w-4/5 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                  </div>
                </div>
                <p className="w-1/3 text-right text-gray-400">48%</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-2/3">
                  <p className="text-gray-300">The Sandbox</p>
                  <div className="h-2 bg-gray-700 rounded-full mt-1">
                    <div className="h-2 bg-blue-500 rounded-full w-3/5 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </div>
                </div>
                <p className="w-1/3 text-right text-gray-400">32%</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-2/3">
                  <p className="text-gray-300">Decentraland</p>
                  <div className="h-2 bg-gray-700 rounded-full mt-1">
                    <div className="h-2 bg-purple-500 rounded-full w-2/5 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                  </div>
                </div>
                <p className="w-1/3 text-right text-gray-400">22%</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-2/3">
                  <p className="text-gray-300">Gods Unchained</p>
                  <div className="h-2 bg-gray-700 rounded-full mt-1">
                    <div className="h-2 bg-green-500 rounded-full w-1/4 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>
                </div>
                <p className="w-1/3 text-right text-gray-400">14%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="bg-purple-500 h-4 w-4 rounded-full mr-2 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Game</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold mr-3">
                        C
                      </div>
                      <div className="text-sm text-white">CryptoUser</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">Axie Infinity</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-white font-medium">0.85 ETH</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">3 hours ago</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-black font-bold mr-3">
                        N
                      </div>
                      <div className="text-sm text-white">NFTmaster</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">The Sandbox</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-white font-medium">245 SAND</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">5 hours ago</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold mr-3">
                        G
                      </div>
                      <div className="text-sm text-white">GuildLeader</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">Decentraland</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-white font-medium">1,200 MANA</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">1 day ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/">
          <span className="inline-flex items-center text-blue-400 hover:text-blue-300 cursor-pointer">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  </div>
);

// Auth Page
const AuthPage = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <div className="grid md:grid-cols-2 h-screen">
      <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 overflow-y-auto">
        <div className="mb-8">
          <Link href="/">
            <span className="text-3xl font-bold text-orange-500 cursor-pointer">ClockWork Gamers</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Sign in to your account</h2>
          <p className="text-gray-400">Or register for a new account to join the guild</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-700"
                />
                <label className="ml-2 block text-sm text-gray-300">Remember me</label>
              </div>
              <a href="#" className="text-sm text-orange-400 hover:text-orange-300">Forgot password?</a>
            </div>
            <button 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold py-2 px-4 rounded-md shadow-[0_0_15px_rgba(249,115,22,0.5)]"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">New to ClockWork Gamers?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Referral Code (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter referral code if you have one"
                />
              </div>
              <button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden md:block relative bg-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-600/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex flex-col justify-center items-center h-full px-8 py-12 text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-400 mb-4">Join The Guild</h2>
          <p className="text-xl text-white max-w-md mb-8">Connect with gamers, streamers and crypto enthusiasts in our unique Web3 gaming community.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-orange-500/30">
              <h3 className="font-bold text-orange-400 mb-2">Play-to-Earn</h3>
              <p className="text-sm text-gray-300">Earn rewards while playing your favorite blockchain games</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30">
              <h3 className="font-bold text-blue-400 mb-2">NFT Access</h3>
              <p className="text-sm text-gray-300">Exclusive access to limited NFT drops and marketplaces</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30">
              <h3 className="font-bold text-blue-400 mb-2">Community</h3>
              <p className="text-sm text-gray-300">Connect with other gamers and share strategies</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-orange-500/30">
              <h3 className="font-bold text-orange-400 mb-2">Training</h3>
              <p className="text-sm text-gray-300">Access exclusive gaming courses and materials</p>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-gray-400 text-sm">© 2023 ClockWork Gamers. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Inner Pages - Simplified
const PageWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-900 text-white">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">{title}</h1>
      {children}
      <div className="mt-8 pt-6 border-t border-gray-700 text-center">
        <Link href="/">
          <span className="inline-flex items-center text-blue-400 hover:text-blue-300 cursor-pointer">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  </div>
);

// Streamers Page
const StreamersPage = () => (
  <PageWrapper title="Streamers">
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 mb-6">
      <p className="text-lg text-gray-300 mb-4">
        Watch your favorite ClockWork Gamers guild streamers playing the latest Web3 games.
      </p>
      <div className="flex flex-wrap gap-4">
        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full hover:bg-orange-500/30 transition-colors">
          All Streamers
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Live Now
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Axie Infinity
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          The Sandbox
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Decentraland
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg group hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">Stream Preview</p>
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
            LIVE
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            2.4K viewers
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start">
            <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold mr-3">
              C
            </div>
            <div>
              <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">CryptoGamer</h3>
              <p className="text-sm text-gray-400">Playing Axie Infinity</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-300">Grinding scholarships for the guild. Come hang out!</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg group hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">Stream Preview</p>
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
            ONLINE
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            Starts in 1 hour
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-black font-bold mr-3">
              N
            </div>
            <div>
              <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">NFTmaster</h3>
              <p className="text-sm text-gray-400">The Sandbox Land Development</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-300">Building a new game in The Sandbox. Join to get a free NFT!</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg group hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">Stream Preview</p>
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
            LIVE
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            876 viewers
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start">
            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold mr-3">
              G
            </div>
            <div>
              <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">GuildLeader</h3>
              <p className="text-sm text-gray-400">Gods Unchained Tournament</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-300">Competing in the weekly tournament. $500 prize pool!</p>
        </div>
      </div>
    </div>
  </PageWrapper>
);

// Rentals Page
const RentalsPage = () => (
  <PageWrapper title="NFT Rentals">
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 mb-6">
      <p className="text-lg text-gray-300 mb-4">
        Rent in-game assets from other guild members to boost your gameplay and earnings.
      </p>
      <div className="flex flex-wrap gap-4">
        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full hover:bg-orange-500/30 transition-colors">
          All Assets
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Axies
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Land Plots
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Characters
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Items
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-square bg-gray-900 flex items-center justify-center text-gray-600">
            NFT Image
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
            AXIE
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Mystic Axie #8273</h3>
            <span className="text-orange-400 font-bold">0.05 ETH/day</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Beast</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Attacker</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Pure</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">High-earning Axie with 4 Mystic parts. Great for Arena.</p>
          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold py-2 px-4 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            Rent Now
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-square bg-gray-900 flex items-center justify-center text-gray-600">
            NFT Image
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
            LAND
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Premium Sandbox Land</h3>
            <span className="text-orange-400 font-bold">0.2 ETH/week</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">3x3</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Center</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Premium</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">Prime location Sandbox land with structures and assets included.</p>
          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold py-2 px-4 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            Rent Now
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-square bg-gray-900 flex items-center justify-center text-gray-600">
            NFT Image
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
            CHARACTER
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Legendary Hero</h3>
            <span className="text-orange-400 font-bold">0.08 ETH/day</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Mage</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Level 87</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Legendary</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">Fully equipped max level character with rare cosmetics.</p>
          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold py-2 px-4 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  </PageWrapper>
);

// Courses Page
const CoursesPage = () => (
  <PageWrapper title="Gaming Courses">
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 mb-6">
      <p className="text-lg text-gray-300 mb-4">
        Learn from the best Web3 gamers and improve your skills with our exclusive courses.
      </p>
      <div className="flex flex-wrap gap-4">
        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full hover:bg-orange-500/30 transition-colors">
          All Courses
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Beginner
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Intermediate
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Advanced
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
          Free Courses
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-600">
            Course Thumbnail
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded">
            POPULAR
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Axie Infinity Mastery</h3>
            <span className="text-orange-400 font-bold">$49.99</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">8 Hours</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Intermediate</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Strategy</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">Learn advanced techniques to dominate in Axie Infinity Arena battles.</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-black text-xs font-bold mr-2">
                N
              </div>
              <span className="text-sm text-gray-400">NFTmaster</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-400 ml-1">4.8 (124)</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold py-2 px-4 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            Enroll Now
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-600">
            Course Thumbnail
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
            BEGINNER
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Intro to NFT Gaming</h3>
            <span className="text-orange-400 font-bold">FREE</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">2 Hours</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Beginner</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Web3</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">Learn the basics of play-to-earn gaming and how to get started.</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-black text-xs font-bold mr-2">
                G
              </div>
              <span className="text-sm text-gray-400">GuildLeader</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-400 ml-1">4.9 (382)</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            Start Learning
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:border-orange-500/50 transition-colors">
        <div className="relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-600">
            Course Thumbnail
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
            ADVANCED
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Gods Unchained Pro</h3>
            <span className="text-orange-400 font-bold">$79.99</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">12 Hours</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Advanced</span>
            <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">Cards</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">Master deck building and tournament strategies from top players.</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-black text-xs font-bold mr-2">
                C
              </div>
              <span className="text-sm text-gray-400">CryptoGamer</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-400 ml-1">4.7 (93)</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold py-2 px-4 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  </PageWrapper>
);

// Not Found Page
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="text-center max-w-md px-4">
      <h1 className="text-9xl font-bold text-orange-500">404</h1>
      <h2 className="text-3xl font-bold text-white mt-4 mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold rounded-md shadow-[0_0_15px_rgba(249,115,22,0.5)]">
          Return to Home
        </button>
      </Link>
    </div>
  </div>
);

// Simple router without protected routes
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/streamers" component={StreamersPage} />
      <Route path="/rentals" component={RentalsPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/achievements" component={({ params }) => <PageWrapper title="Achievements"><p className="text-gray-400">Achievements page with guild trophies and rewards</p></PageWrapper>} />
      <Route path="/nft-marketplace" component={({ params }) => <PageWrapper title="NFT Marketplace"><p className="text-gray-400">NFT marketplace with items from various games</p></PageWrapper>} />
      <Route path="/profile" component={({ params }) => <PageWrapper title="User Profile"><p className="text-gray-400">User profile with settings and statistics</p></PageWrapper>} />
      <Route path="/referrals" component={({ params }) => <PageWrapper title="Referrals"><p className="text-gray-400">Invite friends and earn rewards</p></PageWrapper>} />
      <Route path="/calculators" component={({ params }) => <PageWrapper title="Game Calculators"><p className="text-gray-400">Calculate earnings and ROI for different games</p></PageWrapper>} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

// Core app with minimal dependencies
function CoreApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default CoreApp;
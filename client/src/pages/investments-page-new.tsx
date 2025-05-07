import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { NeonCard } from "@/components/ui/animated-elements";

// Icons
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Info,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Layers,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Users,
  Shield,
  Search,
  Filter,
  Download,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Types
interface Investment {
  id: string;
  name: string;
  description: string;
  type: "guild" | "token" | "nft" | "game";
  risk: "low" | "medium" | "high";
  returnRate: number;
  raised: number;
  goal: number;
  investors: number;
  startDate: string;
  endDate: string;
  status: "open" | "closed" | "coming-soon";
  tags: string[];
}

interface UserInvestment {
  id: string;
  investmentId: string;
  amount: number;
  date: string;
  status: "active" | "completed" | "pending";
  returns: number;
  name: string;
}

interface HistoricalReturn {
  date: string;
  value: number;
}

// Sample data
const investments: Investment[] = [
  {
    id: "inv-1",
    name: "CWG Guild Expansion Fund",
    description: "Fund the expansion of ClockWork Gamers into new gaming territories and metaverse land acquisition.",
    type: "guild",
    risk: "medium",
    returnRate: 15,
    raised: 75000,
    goal: 100000,
    investors: 128,
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    status: "open",
    tags: ["Expansion", "Metaverse", "Land"]
  },
  {
    id: "inv-2",
    name: "eSports Team Sponsorship",
    description: "Investment in CWG's professional eSports team competing in major tournaments.",
    type: "guild",
    risk: "medium",
    returnRate: 18,
    raised: 35000,
    goal: 50000,
    investors: 87,
    startDate: "2025-03-15",
    endDate: "2025-05-15",
    status: "open",
    tags: ["eSports", "Team", "Competition"]
  },
  {
    id: "inv-3",
    name: "CWG Token Staking Pool",
    description: "Stake your CWG tokens to earn passive income and governance rights.",
    type: "token",
    risk: "low",
    returnRate: 8,
    raised: 250000,
    goal: 500000,
    investors: 345,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "open",
    tags: ["Staking", "Passive", "Governance"]
  },
  {
    id: "inv-4",
    name: "Founders NFT Series Investment",
    description: "Investment in limited edition Founders NFTs with revenue sharing benefits.",
    type: "nft",
    risk: "high",
    returnRate: 25,
    raised: 80000,
    goal: 100000,
    investors: 64,
    startDate: "2025-05-01",
    endDate: "2025-05-15",
    status: "coming-soon",
    tags: ["NFT", "Limited", "Exclusive"]
  },
  {
    id: "inv-5",
    name: "Play-to-Earn Game Development",
    description: "Fund the development of CWG's exclusive play-to-earn mobile game.",
    type: "game",
    risk: "high",
    returnRate: 30,
    raised: 120000,
    goal: 300000,
    investors: 156,
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    status: "closed",
    tags: ["Game", "Mobile", "Play-to-Earn"]
  }
];

const userInvestments: UserInvestment[] = [
  {
    id: "user-inv-1",
    investmentId: "inv-1",
    amount: 1000,
    date: "2025-04-15",
    status: "active",
    returns: 25.5,
    name: "CWG Guild Expansion Fund"
  },
  {
    id: "user-inv-3",
    investmentId: "inv-3",
    amount: 500,
    date: "2025-02-20",
    status: "active",
    returns: 12.8,
    name: "CWG Token Staking Pool"
  }
];

const portfolioPerformance: HistoricalReturn[] = [
  { date: "Jan 2025", value: 1500 },
  { date: "Feb 2025", value: 1580 },
  { date: "Mar 2025", value: 1620 },
  { date: "Apr 2025", value: 1750 },
  { date: "May 2025", value: 1820 }
];

export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  // Calculate portfolio statistics
  const totalInvested = userInvestments.reduce((acc, inv) => acc + inv.amount, 0);
  const totalReturns = userInvestments.reduce((acc, inv) => acc + inv.returns, 0);
  const roi = (totalReturns / totalInvested) * 100;
  
  // Filter investments based on search and filters
  const filteredInvestments = investments.filter(inv => {
    // Search filter
    if (searchQuery && !inv.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !inv.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (typeFilter && inv.type !== typeFilter) {
      return false;
    }
    
    // Risk filter
    if (riskFilter && inv.risk !== riskFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-orbitron font-bold neon-text-blue">
                Web3 Investments
              </h1>
              <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-3xl">
                Explore investment opportunities within the ClockWork Gamers ecosystem and manage your portfolio.
              </p>
            </motion.div>
          </div>
        </section>
        
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-8"
            >
              <TabsList className="bg-[hsl(var(--cwg-dark-blue))] p-1 rounded-lg w-full sm:w-auto">
                <TabsTrigger 
                  value="opportunities" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Investment Opportunities
                </TabsTrigger>
                <TabsTrigger 
                  value="portfolio" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  My Portfolio
                </TabsTrigger>
                <TabsTrigger 
                  value="education" 
                  className="rounded-md data-[state=active]:bg-[hsl(var(--cwg-blue))] data-[state=active]:text-white"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Education
                </TabsTrigger>
              </TabsList>
              
              {/* Investment Opportunities Tab */}
              <TabsContent value="opportunities" className="space-y-6">
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" size={18} />
                    <Input 
                      type="text"
                      placeholder="Search investments..." 
                      className="pl-10 bg-[hsl(var(--cwg-dark-blue))]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-border))] rounded-md px-3 py-2 text-sm"
                      value={typeFilter || ""}
                      onChange={(e) => setTypeFilter(e.target.value || null)}
                    >
                      <option value="">All Types</option>
                      <option value="guild">Guild</option>
                      <option value="token">Token</option>
                      <option value="nft">NFT</option>
                      <option value="game">Game</option>
                    </select>
                    
                    <select 
                      className="bg-[hsl(var(--cwg-dark-blue))] border border-[hsl(var(--cwg-border))] rounded-md px-3 py-2 text-sm"
                      value={riskFilter || ""}
                      onChange={(e) => setRiskFilter(e.target.value || null)}
                    >
                      <option value="">All Risk Levels</option>
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>
                </div>
                
                {/* Investment Opportunities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInvestments.map((investment) => (
                    <motion.div
                      key={investment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <NeonCard
                        color={
                          investment.type === 'guild' ? 'orange' : 
                          investment.type === 'token' ? 'blue' :
                          investment.type === 'nft' ? 'purple' : 'green'
                        }
                        className="h-full bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge
                                className={
                                  investment.status === 'open' ? 'bg-green-500 hover:bg-green-600' :
                                  investment.status === 'coming-soon' ? 'bg-blue-500 hover:bg-blue-600' :
                                  'bg-gray-500 hover:bg-gray-600'
                                }
                              >
                                {investment.status === 'open' ? 'Open for Investment' :
                                 investment.status === 'coming-soon' ? 'Coming Soon' : 'Closed'}
                              </Badge>
                              <CardTitle className="mt-2 text-lg">
                                {investment.name}
                              </CardTitle>
                            </div>
                            <Badge
                              className={
                                investment.risk === 'low' ? 'bg-green-700 hover:bg-green-800' :
                                investment.risk === 'medium' ? 'bg-yellow-700 hover:bg-yellow-800' :
                                'bg-red-700 hover:bg-red-800'
                              }
                            >
                              {investment.risk.charAt(0).toUpperCase() + investment.risk.slice(1)} Risk
                            </Badge>
                          </div>
                          <CardDescription className="mt-2 line-clamp-2">
                            {investment.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1 text-sm">
                                <span className="text-[hsl(var(--cwg-muted))]">Raised</span>
                                <span>${investment.raised.toLocaleString()} / ${investment.goal.toLocaleString()}</span>
                              </div>
                              <Progress value={(investment.raised / investment.goal) * 100} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-[hsl(var(--cwg-muted))]">Potential Return</p>
                                <p className="font-medium text-base">{investment.returnRate}% APY</p>
                              </div>
                              <div>
                                <p className="text-[hsl(var(--cwg-muted))]">Investors</p>
                                <p className="font-medium text-base">{investment.investors}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {investment.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="bg-[hsl(var(--cwg-dark))]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter>
                          <Button 
                            className="w-full"
                            disabled={investment.status !== 'open'}
                          >
                            {investment.status === 'open' ? 'Invest Now' :
                             investment.status === 'coming-soon' ? 'Coming Soon' : 'Closed'}
                          </Button>
                        </CardFooter>
                      </NeonCard>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Portfolio Summary */}
                  <div className="md:col-span-3">
                    <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader>
                        <CardTitle className="text-[hsl(var(--cwg-blue))]">Portfolio Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                            <p className="text-[hsl(var(--cwg-muted))] text-sm">Total Invested</p>
                            <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
                          </div>
                          
                          <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                            <p className="text-[hsl(var(--cwg-muted))] text-sm">Total Returns</p>
                            <p className="text-2xl font-bold">${totalReturns.toLocaleString()}</p>
                          </div>
                          
                          <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                            <p className="text-[hsl(var(--cwg-muted))] text-sm">Return on Investment</p>
                            <p className="text-2xl font-bold">{roi.toFixed(2)}%</p>
                            <div className="flex items-center mt-1 text-green-500 text-sm">
                              <ArrowUp className="h-4 w-4 mr-1" />
                              <span>+2.4% this month</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                          <h3 className="mb-4 font-medium">Portfolio Performance</h3>
                          <div className="h-64 bg-[hsl(var(--cwg-dark))] rounded-lg p-4 relative">
                            {/* Mock Chart - Replace with actual chart component */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-40 flex items-end justify-around">
                                {portfolioPerformance.map((item, index) => (
                                  <div key={index} className="flex flex-col items-center">
                                    <div 
                                      className="w-12 bg-gradient-to-t from-[hsl(var(--cwg-blue))/30] to-[hsl(var(--cwg-blue))]" 
                                      style={{ 
                                        height: `${(item.value / 2000) * 100}%`, 
                                        maxHeight: '100%',
                                        borderTopLeftRadius: '4px',
                                        borderTopRightRadius: '4px'
                                      }}
                                    ></div>
                                    <span className="text-xs mt-2 text-[hsl(var(--cwg-muted))]">{item.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </NeonCard>
                  </div>
                  
                  {/* Active Investments */}
                  <div className="md:col-span-3">
                    <NeonCard color="orange" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader>
                        <CardTitle className="text-[hsl(var(--cwg-orange))]">My Active Investments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userInvestments.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Investment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Returns</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userInvestments.map((investment) => (
                                <TableRow key={investment.id}>
                                  <TableCell className="font-medium">{investment.name}</TableCell>
                                  <TableCell>{new Date(investment.date).toLocaleDateString()}</TableCell>
                                  <TableCell>${investment.amount.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center text-green-500">
                                      <ArrowUp className="h-4 w-4 mr-1" />
                                      ${investment.returns.toLocaleString()}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        investment.status === 'active' ? 'bg-green-700 hover:bg-green-800' :
                                        investment.status === 'pending' ? 'bg-yellow-700 hover:bg-yellow-800' :
                                        'bg-blue-700 hover:bg-blue-800'
                                      }
                                    >
                                      {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="outline" size="sm">Manage</Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-[hsl(var(--cwg-muted))]">You don't have any active investments.</p>
                            <Button
                              onClick={() => setActiveTab("opportunities")}
                              className="mt-4"
                            >
                              Explore Opportunities
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </NeonCard>
                  </div>
                </div>
              </TabsContent>
              
              {/* Education Tab */}
              <TabsContent value="education" className="space-y-8">
                <NeonCard color="purple" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-purple))]">Investment Education</CardTitle>
                    <CardDescription>
                      Learn about Web3 investments and how to make informed decisions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How do Guild Investments work?</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p>Guild investments allow you to invest directly in the growth and expansion of ClockWork Gamers. Your investment is used to fund guild activities, acquire assets, and expand operations.</p>
                            <p>Returns are generated from:</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Revenue sharing from guild operations</li>
                              <li>Appreciation of guild-owned assets</li>
                              <li>Tournament winnings and sponsorships</li>
                            </ul>
                            <p>Investors receive regular payments based on the performance of the guild, proportional to their investment amount.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-2">
                        <AccordionTrigger>What are Token Staking Investments?</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p>Token staking involves locking up your CWG tokens in a staking contract for a specified period. During this time, your tokens help secure the network and provide liquidity.</p>
                            <p>Benefits of token staking include:</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Regular staking rewards (usually paid in CWG tokens)</li>
                              <li>Voting rights for governance decisions</li>
                              <li>Special access to certain platform features</li>
                            </ul>
                            <p>Staking is generally considered lower risk compared to other investment types, but returns may also be more modest.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-3">
                        <AccordionTrigger>How do NFT Investments work?</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p>NFT investments at ClockWork Gamers typically involve purchasing limited edition NFTs that provide both collectible value and utility within the ecosystem.</p>
                            <p>Returns from NFT investments can come from:</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>NFT appreciation and secondary market sales</li>
                              <li>Revenue sharing tied to specific NFT collections</li>
                              <li>Exclusive access and opportunities only available to NFT holders</li>
                            </ul>
                            <p>NFT investments are typically higher risk but can offer significant returns if the collection gains popularity or provides valuable utility.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-4">
                        <AccordionTrigger>What are Game Development Investments?</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p>Game development investments allow you to fund the creation of new play-to-earn games associated with ClockWork Gamers. These are typically the highest risk investments but can offer the largest returns.</p>
                            <p>Returns from game investments can include:</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Revenue sharing from game profits</li>
                              <li>Early access and in-game advantages</li>
                              <li>Exclusive in-game assets</li>
                              <li>Potential for significant returns if the game is successful</li>
                            </ul>
                            <p>Due to the uncertain nature of game development and player adoption, these investments carry higher risk but potentially higher rewards.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-5">
                        <AccordionTrigger>Understanding Investment Risk Levels</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="border border-green-700 rounded-lg p-4 bg-green-900/20">
                                <h4 className="font-medium flex items-center mb-2 text-green-500">
                                  <Shield className="h-4 w-4 mr-2" />
                                  Low Risk
                                </h4>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                  <li>Token staking</li>
                                  <li>Established guild operations</li>
                                  <li>Lower, more predictable returns</li>
                                  <li>Typically 5-10% APY</li>
                                </ul>
                              </div>
                              
                              <div className="border border-yellow-700 rounded-lg p-4 bg-yellow-900/20">
                                <h4 className="font-medium flex items-center mb-2 text-yellow-500">
                                  <Shield className="h-4 w-4 mr-2" />
                                  Medium Risk
                                </h4>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                  <li>Guild expansion projects</li>
                                  <li>Established NFT collections</li>
                                  <li>Balance of risk and reward</li>
                                  <li>Typically 10-20% APY</li>
                                </ul>
                              </div>
                              
                              <div className="border border-red-700 rounded-lg p-4 bg-red-900/20">
                                <h4 className="font-medium flex items-center mb-2 text-red-500">
                                  <Shield className="h-4 w-4 mr-2" />
                                  High Risk
                                </h4>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                  <li>New game development</li>
                                  <li>Experimental projects</li>
                                  <li>New NFT launches</li>
                                  <li>Potentially 20%+ APY</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="mt-4 border-t pt-4">
                              <p className="flex items-start">
                                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <span>Remember that all investments carry risk, and past performance is not indicative of future results. Never invest more than you can afford to lose.</span>
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </NeonCard>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NeonCard color="blue" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(var(--cwg-blue))]">
                        <div className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2" />
                          Investment Guides
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                          <div className="bg-[hsl(var(--cwg-blue))] p-2 rounded mr-4">
                            <BookIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">Beginner's Guide to Web3 Investing</h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))] my-1">Learn the fundamentals of Web3 investments and how to get started.</p>
                            <Button variant="link" className="px-0 text-[hsl(var(--cwg-blue))]">Read Guide</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-start bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                          <div className="bg-[hsl(var(--cwg-blue))] p-2 rounded mr-4">
                            <BookIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">Understanding Tokenomics</h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))] my-1">Learn how to evaluate token projects and understand tokenomics.</p>
                            <Button variant="link" className="px-0 text-[hsl(var(--cwg-blue))]">Read Guide</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-start bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                          <div className="bg-[hsl(var(--cwg-blue))] p-2 rounded mr-4">
                            <BookIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">NFT Investment Strategies</h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))] my-1">Discover strategies for investing in NFTs and evaluating projects.</p>
                            <Button variant="link" className="px-0 text-[hsl(var(--cwg-blue))]">Read Guide</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </NeonCard>
                  
                  <NeonCard color="green" className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                    <CardHeader>
                      <CardTitle className="text-green-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          Upcoming Events
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                          <div className="bg-green-700 p-2 rounded mr-4 text-center">
                            <div className="text-xs text-white">MAY</div>
                            <div className="text-lg font-bold text-white">15</div>
                          </div>
                          <div>
                            <h3 className="font-medium">Investor Q&A Session</h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))] my-1">Live session with the CWG investment team to answer your questions.</p>
                            <Button variant="link" className="px-0 text-green-500">Register</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-start bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                          <div className="bg-green-700 p-2 rounded mr-4 text-center">
                            <div className="text-xs text-white">MAY</div>
                            <div className="text-lg font-bold text-white">20</div>
                          </div>
                          <div>
                            <h3 className="font-medium">New Project Announcement</h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))] my-1">Unveiling our newest investment opportunity with early access.</p>
                            <Button variant="link" className="px-0 text-green-500">Add to Calendar</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-start bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                          <div className="bg-green-700 p-2 rounded mr-4 text-center">
                            <div className="text-xs text-white">JUN</div>
                            <div className="text-lg font-bold text-white">01</div>
                          </div>
                          <div>
                            <h3 className="font-medium">Investment Workshop</h3>
                            <p className="text-sm text-[hsl(var(--cwg-muted))] my-1">Learn practical strategies for building your Web3 investment portfolio.</p>
                            <Button variant="link" className="px-0 text-green-500">Register</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </NeonCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

// Custom Icons
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
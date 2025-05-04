import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWeb3 } from "@/hooks/use-web3";
import { formatEthereumAddress } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { ProtectedRoute } from "@/lib/protected-route";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

// Temporary token data
const SAMPLE_TOKEN_DATA = {
  symbol: "CWG",
  name: "ClockWork Token",
  balance: 2500,
  usdValue: 0.15, // Example USD value per token
  lockedAmount: 750,
  stakingRewards: 35.5,
  stakingApy: 12.5,
  pendingRewards: 15.2,
  level: 3,
  levelProgress: 65,
  nextLevelRequirement: 5000,
};

// Temporary transaction data
const SAMPLE_TRANSACTIONS = [
  { 
    id: "tx1", 
    type: "earn", 
    amount: 150, 
    description: "Tournament reward", 
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    status: "completed"
  },
  { 
    id: "tx2", 
    type: "spend", 
    amount: 75, 
    description: "NFT purchase", 
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    status: "completed"
  },
  { 
    id: "tx3", 
    type: "stake", 
    amount: 200, 
    description: "Staking deposit", 
    timestamp: Date.now() - 3600000 * 48, // 2 days ago
    status: "completed"
  },
  { 
    id: "tx4", 
    type: "earn", 
    amount: 25, 
    description: "Daily quest completion", 
    timestamp: Date.now() - 3600000 * 72, // 3 days ago
    status: "completed"
  },
  { 
    id: "tx5", 
    type: "transfer", 
    amount: 50, 
    description: "Transfer to guild member", 
    timestamp: Date.now() - 3600000 * 120, // 5 days ago
    status: "completed"
  }
];

// Temporary quests data
const SAMPLE_QUESTS = [
  {
    id: "quest1",
    title: "Complete 3 Ranked Matches",
    reward: 50,
    game: "Crypto Legends",
    difficulty: "Easy",
    timeEstimate: "30 mins",
    completed: true
  },
  {
    id: "quest2",
    title: "Win a Tournament Match",
    reward: 150,
    game: "Boss Fighters",
    difficulty: "Medium", 
    timeEstimate: "1 hour",
    completed: false
  },
  {
    id: "quest3",
    title: "Reach Level 10 in Campaign",
    reward: 100,
    game: "Galaxy Raiders",
    difficulty: "Medium",
    timeEstimate: "2 hours", 
    completed: false
  },
  {
    id: "quest4",
    title: "Refer a Friend",
    reward: 200,
    game: "Guild Activity",
    difficulty: "Easy",
    timeEstimate: "5 mins",
    completed: false
  },
  {
    id: "quest5",
    title: "Stream for 2 Hours",
    reward: 250,
    game: "Any Game",
    difficulty: "Hard",
    timeEstimate: "2 hours",
    completed: false
  }
];

// Guild levels and benefits
const GUILD_LEVELS = [
  {
    level: 1,
    requirement: 0,
    benefits: ["Basic Guild Access", "Marketplace Access", "Basic Quests"]
  },
  {
    level: 2,
    requirement: 1000,
    benefits: ["5% Marketplace Discount", "Daily Quests", "Basic NFT Access"]
  },
  {
    level: 3, 
    requirement: 2500,
    benefits: ["10% Marketplace Discount", "Weekly Tournaments", "Rare NFT Access"]
  },
  {
    level: 4,
    requirement: 5000,
    benefits: ["15% Marketplace Discount", "Premium Quests", "Epic NFT Access"]
  },
  {
    level: 5,
    requirement: 10000,
    benefits: ["20% Marketplace Discount", "Exclusive Tournaments", "Legendary NFT Access"]
  }
];

export function TokenDashboardPage() {
  const { user } = useAuth();
  const { connected, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [tokenData, setTokenData] = useState(SAMPLE_TOKEN_DATA);
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [quests, setQuests] = useState(SAMPLE_QUESTS);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format timestamp to readable format
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Calculate time since transaction in human readable format
  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = seconds / 31536000; // seconds in a year
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    
    interval = seconds / 2592000; // seconds in a month
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    
    interval = seconds / 86400; // seconds in a day
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    
    interval = seconds / 3600; // seconds in an hour
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    
    interval = seconds / 60; // seconds in a minute
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
  };
  
  // Format transaction type to be more readable
  const formatTxType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earn":
        return <ArrowDownRight className="text-green-500" />;
      case "spend":
        return <ArrowUpRight className="text-red-500" />;
      case "stake":
        return <TrendingUp className="text-blue-500" />;
      case "transfer":
        return <ArrowRight className="text-yellow-500" />;
      default:
        return <RefreshCw />;
    }
  };
  
  // Complete a quest (example functionality)
  const completeQuest = (questId: string) => {
    setQuests(quests.map(quest => 
      quest.id === questId ? { ...quest, completed: true } : quest
    ));
    
    // Add transaction for completed quest
    const completedQuest = quests.find(q => q.id === questId);
    if (completedQuest) {
      const newTransaction = {
        id: `tx-${Date.now()}`,
        type: "earn",
        amount: completedQuest.reward,
        description: `Completed quest: ${completedQuest.title}`,
        timestamp: Date.now(),
        status: "completed"
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Update token balance
      setTokenData({
        ...tokenData,
        balance: tokenData.balance + completedQuest.reward
      });
    }
  };
  
  // Get current level info
  const getCurrentLevelInfo = () => {
    return GUILD_LEVELS.find(level => level.level === tokenData.level) || GUILD_LEVELS[0];
  };
  
  // Get next level info
  const getNextLevelInfo = () => {
    return GUILD_LEVELS.find(level => level.level === tokenData.level + 1);
  };
  
  if (!connected || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold font-orbitron text-[hsl(var(--cwg-text))]">Token Dashboard</h1>
            <p className="mt-4 text-[hsl(var(--cwg-muted))]">You need to connect your wallet and be logged in to access the token dashboard.</p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))]">
                  <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </Button>
              </Link>
              
              <Link href="/auth">
                <Button variant="outline" className="border-[hsl(var(--cwg-muted))] text-[hsl(var(--cwg-muted))]">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[hsl(var(--cwg-blue))]/20 to-[hsl(var(--cwg-orange))]/20 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold font-orbitron tracking-tight text-[hsl(var(--cwg-text))]">
                  Token Dashboard
                </h1>
                <p className="mt-2 text-[hsl(var(--cwg-muted))]">
                  Manage your ClockWork Guild tokens and activities
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-sm text-[hsl(var(--cwg-muted))]">Connected as</div>
                <div className="text-[hsl(var(--cwg-blue))] font-orbitron">
                  {formatEthereumAddress(account || '')}
                </div>
                <div className="mt-2 font-orbitron text-lg text-[hsl(var(--cwg-orange))]">
                  Level {tokenData.level} Guild Member
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="py-3">Activity</TabsTrigger>
              <TabsTrigger value="quests" className="py-3">Quests</TabsTrigger>
              <TabsTrigger value="staking" className="py-3">Staking</TabsTrigger>
              <TabsTrigger value="benefits" className="py-3 hidden lg:flex">Benefits</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Token Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Token Balance</CardTitle>
                    <CardDescription>Your available ClockWork tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mb-4">
                        <Wallet className="text-[hsl(var(--cwg-blue))] h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-4xl font-orbitron text-[hsl(var(--cwg-blue))]">
                      {tokenData.balance.toLocaleString()}
                    </div>
                    <div className="text-[hsl(var(--cwg-muted))] mt-1">
                      {tokenData.symbol} ≈ ${(tokenData.balance * tokenData.usdValue).toFixed(2)}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 justify-center">
                    <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                      Transfer Tokens
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Staking Card */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Staking Rewards</CardTitle>
                    <CardDescription>Earn passive income from your tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mb-4">
                        <TrendingUp className="text-[hsl(var(--cwg-orange))] h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-3xl font-orbitron text-[hsl(var(--cwg-orange))]">
                      {tokenData.stakingRewards.toLocaleString()} {tokenData.symbol}
                    </div>
                    <div className="text-[hsl(var(--cwg-muted))] mt-1">
                      {tokenData.lockedAmount.toLocaleString()} {tokenData.symbol} staked
                    </div>
                    <div className="text-green-500 text-sm mt-2">
                      APY: {tokenData.stakingApy}%
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 justify-center">
                    <Button variant="outline" className="border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
                      Claim Rewards
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Guild Level Card */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Guild Level</CardTitle>
                    <CardDescription>Your membership status and benefits</CardDescription>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mb-4">
                        <Award className="text-[hsl(var(--cwg-blue))] h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-3xl font-orbitron text-center text-[hsl(var(--cwg-blue))]">
                      Level {tokenData.level}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--cwg-muted))]">Progress to Level {tokenData.level + 1}</span>
                        <span className="text-[hsl(var(--cwg-text))]">{tokenData.levelProgress}%</span>
                      </div>
                      <Progress value={tokenData.levelProgress} className="h-2" />
                      <div className="text-xs text-[hsl(var(--cwg-muted))]">
                        {tokenData.balance.toLocaleString()} / {tokenData.nextLevelRequirement.toLocaleString()} {tokenData.symbol}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 justify-center">
                    <Button variant="outline" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                      View Benefits
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-[hsl(var(--cwg-dark-blue))]/30 rounded-lg border border-[hsl(var(--cwg-dark-blue))] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))]">Recent Activity</h3>
                  <Button variant="link" className="text-[hsl(var(--cwg-blue))]" onClick={() => setSelectedTab("transactions")}>
                    View All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[hsl(var(--cwg-dark-blue))]">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center mr-4">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-medium text-[hsl(var(--cwg-text))]">{tx.description}</div>
                          <div className="text-sm text-[hsl(var(--cwg-muted))]">{timeSince(tx.timestamp)}</div>
                        </div>
                      </div>
                      <div className={`text-lg font-orbitron ${tx.type === 'earn' ? 'text-green-500' : tx.type === 'spend' ? 'text-red-500' : 'text-[hsl(var(--cwg-blue))]'}`}>
                        {tx.type === 'earn' ? '+' : tx.type === 'spend' ? '-' : ''}{tx.amount} {tokenData.symbol}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Active Quests */}
              <div className="bg-[hsl(var(--cwg-dark-blue))]/30 rounded-lg border border-[hsl(var(--cwg-dark-blue))] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))]">Active Quests</h3>
                  <Button variant="link" className="text-[hsl(var(--cwg-blue))]" onClick={() => setSelectedTab("quests")}>
                    View All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quests.filter(q => !q.completed).slice(0, 3).map((quest) => (
                    <Card key={quest.id} className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                      <CardHeader className="pb-2">
                        <div className="text-xs text-[hsl(var(--cwg-muted))]">{quest.game}</div>
                        <CardTitle className="text-[hsl(var(--cwg-text))] text-base">{quest.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--cwg-muted))]">Reward:</span>
                          <span className="text-[hsl(var(--cwg-orange))]">{quest.reward} {tokenData.symbol}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-[hsl(var(--cwg-muted))]">Difficulty:</span>
                          <span className="text-[hsl(var(--cwg-text))]">{quest.difficulty}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-[hsl(var(--cwg-muted))]">Est. Time:</span>
                          <span className="text-[hsl(var(--cwg-text))]">{quest.timeEstimate}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button 
                          variant="outline" 
                          className="w-full border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]"
                          onClick={() => completeQuest(quest.id)}
                        >
                          Complete Quest
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--cwg-text))]">Token Activity</CardTitle>
                  <CardDescription>Your complete transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[hsl(var(--cwg-dark-blue))]">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center mr-4">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <div className="font-medium text-[hsl(var(--cwg-text))]">{tx.description}</div>
                            <div className="text-xs text-[hsl(var(--cwg-muted))]">
                              <span className="mr-2">{formatTxType(tx.type)}</span>
                              <span>{formatTimestamp(tx.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`text-lg font-orbitron ${tx.type === 'earn' ? 'text-green-500' : tx.type === 'spend' ? 'text-red-500' : 'text-[hsl(var(--cwg-blue))]'}`}>
                            {tx.type === 'earn' ? '+' : tx.type === 'spend' ? '-' : ''}{tx.amount} {tokenData.symbol}
                          </div>
                          <div className="text-xs flex items-center">
                            {tx.status === 'completed' ? 
                              <><CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Completed</> : 
                              <><Clock className="h-3 w-3 text-yellow-500 mr-1" /> Pending</>
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Quests Tab */}
            <TabsContent value="quests" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Quests */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Active Quests</CardTitle>
                    <CardDescription>Complete quests to earn tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quests.filter(q => !q.completed).map((quest) => (
                        <Card key={quest.id} className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                          <CardHeader className="pb-2">
                            <div className="text-xs text-[hsl(var(--cwg-muted))]">{quest.game}</div>
                            <CardTitle className="text-[hsl(var(--cwg-text))] text-base">{quest.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[hsl(var(--cwg-muted))]">Reward:</span>
                              <span className="text-[hsl(var(--cwg-orange))]">{quest.reward} {tokenData.symbol}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-[hsl(var(--cwg-muted))]">Difficulty:</span>
                              <span className="text-[hsl(var(--cwg-text))]">{quest.difficulty}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-[hsl(var(--cwg-muted))]">Est. Time:</span>
                              <span className="text-[hsl(var(--cwg-text))]">{quest.timeEstimate}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button 
                              variant="outline" 
                              className="w-full border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]"
                              onClick={() => completeQuest(quest.id)}
                            >
                              Complete Quest
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Completed Quests */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Completed Quests</CardTitle>
                    <CardDescription>Your quest achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quests.filter(q => q.completed).map((quest) => (
                        <Card key={quest.id} className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                          <CardHeader className="pb-2">
                            <div className="text-xs text-[hsl(var(--cwg-muted))]">{quest.game}</div>
                            <CardTitle className="text-[hsl(var(--cwg-text))] text-base">{quest.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[hsl(var(--cwg-muted))]">Reward:</span>
                              <span className="text-[hsl(var(--cwg-orange))]">{quest.reward} {tokenData.symbol}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-[hsl(var(--cwg-muted))]">Status:</span>
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Completed
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {quests.filter(q => q.completed).length === 0 && (
                        <div className="text-center py-6 text-[hsl(var(--cwg-muted))]">
                          No completed quests yet. Start earning tokens!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Staking Tab */}
            <TabsContent value="staking" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Staking Stats */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Staking Stats</CardTitle>
                    <CardDescription>Earn passive income from staking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">Total Staked</div>
                        <div className="text-2xl font-orbitron text-[hsl(var(--cwg-blue))]">
                          {tokenData.lockedAmount.toLocaleString()} {tokenData.symbol}
                        </div>
                        <div className="text-xs text-[hsl(var(--cwg-muted))] mt-1">
                          ≈ ${(tokenData.lockedAmount * tokenData.usdValue).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">Current APY</div>
                        <div className="text-2xl font-orbitron text-green-500">
                          {tokenData.stakingApy}%
                        </div>
                        <div className="text-xs text-[hsl(var(--cwg-muted))] mt-1">
                          Rates updated daily
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">Earned Rewards</div>
                        <div className="text-2xl font-orbitron text-[hsl(var(--cwg-orange))]">
                          {tokenData.stakingRewards.toLocaleString()} {tokenData.symbol}
                        </div>
                        <div className="text-xs text-[hsl(var(--cwg-muted))] mt-1">
                          ≈ ${(tokenData.stakingRewards * tokenData.usdValue).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg border border-[hsl(var(--cwg-dark-blue))]">
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">Next Reward</div>
                        <div className="text-2xl font-orbitron text-[hsl(var(--cwg-blue))]">
                          23:59:14
                        </div>
                        <div className="text-xs text-[hsl(var(--cwg-muted))] mt-1">
                          Rewards distributed daily
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                      <Button className="w-full md:w-auto bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))]">
                        Stake More Tokens
                      </Button>
                      <Button className="w-full md:w-auto bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))]">
                        Claim Rewards
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto border-[hsl(var(--cwg-muted))] text-[hsl(var(--cwg-muted))]">
                        Unstake Tokens
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Staking Tiers */}
                <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-[hsl(var(--cwg-text))]">Staking Tiers</CardTitle>
                    <CardDescription>Boost your rewards with higher tiers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className={`p-3 rounded-lg border ${tokenData.lockedAmount >= 5000 ? 'bg-[hsl(var(--cwg-blue))]/20 border-[hsl(var(--cwg-blue))]' : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]'}`}>
                        <div className="font-orbitron text-[hsl(var(--cwg-text))]">Diamond</div>
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">5,000+ {tokenData.symbol}</div>
                        <div className="text-sm text-green-500 mt-1">20% APY</div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${tokenData.lockedAmount >= 2500 && tokenData.lockedAmount < 5000 ? 'bg-[hsl(var(--cwg-blue))]/20 border-[hsl(var(--cwg-blue))]' : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]'}`}>
                        <div className="font-orbitron text-[hsl(var(--cwg-text))]">Platinum</div>
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">2,500+ {tokenData.symbol}</div>
                        <div className="text-sm text-green-500 mt-1">15% APY</div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${tokenData.lockedAmount >= 1000 && tokenData.lockedAmount < 2500 ? 'bg-[hsl(var(--cwg-blue))]/20 border-[hsl(var(--cwg-blue))]' : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]'}`}>
                        <div className="font-orbitron text-[hsl(var(--cwg-text))]">Gold</div>
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">1,000+ {tokenData.symbol}</div>
                        <div className="text-sm text-green-500 mt-1">12.5% APY</div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${tokenData.lockedAmount >= 500 && tokenData.lockedAmount < 1000 ? 'bg-[hsl(var(--cwg-blue))]/20 border-[hsl(var(--cwg-blue))]' : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]'}`}>
                        <div className="font-orbitron text-[hsl(var(--cwg-text))]">Silver</div>
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">500+ {tokenData.symbol}</div>
                        <div className="text-sm text-green-500 mt-1">10% APY</div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${tokenData.lockedAmount > 0 && tokenData.lockedAmount < 500 ? 'bg-[hsl(var(--cwg-blue))]/20 border-[hsl(var(--cwg-blue))]' : 'bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]'}`}>
                        <div className="font-orbitron text-[hsl(var(--cwg-text))]">Bronze</div>
                        <div className="text-sm text-[hsl(var(--cwg-muted))]">1+ {tokenData.symbol}</div>
                        <div className="text-sm text-green-500 mt-1">7.5% APY</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-6">
              <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--cwg-text))]">Guild Member Benefits</CardTitle>
                  <CardDescription>Perks and rewards for token holders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Level */}
                    <div>
                      <h3 className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] mb-4">
                        Your Current Level: {tokenData.level}
                      </h3>
                      
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg border border-[hsl(var(--cwg-blue))]">
                        <div className="text-sm font-medium text-[hsl(var(--cwg-text))]">
                          Level {tokenData.level} Benefits
                        </div>
                        <ul className="mt-2 space-y-2">
                          {getCurrentLevelInfo()?.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center text-sm text-[hsl(var(--cwg-muted))]">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {getNextLevelInfo() && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-[hsl(var(--cwg-muted))] mb-2">
                            Progress to Level {tokenData.level + 1}
                          </h4>
                          <Progress value={tokenData.levelProgress} className="h-2" />
                          <div className="flex justify-between text-xs text-[hsl(var(--cwg-muted))] mt-1">
                            <span>{tokenData.balance.toLocaleString()} {tokenData.symbol}</span>
                            <span>{tokenData.nextLevelRequirement.toLocaleString()} {tokenData.symbol}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Next Level */}
                    {getNextLevelInfo() && (
                      <div>
                        <h3 className="text-lg font-orbitron text-[hsl(var(--cwg-orange))] mb-4">
                          Next Level: {tokenData.level + 1}
                        </h3>
                        
                        <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg border border-[hsl(var(--cwg-orange))]">
                          <div className="text-sm font-medium text-[hsl(var(--cwg-text))]">
                            Level {tokenData.level + 1} Benefits
                          </div>
                          <ul className="mt-2 space-y-2">
                            {getNextLevelInfo()?.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center text-sm text-[hsl(var(--cwg-muted))]">
                                {getCurrentLevelInfo()?.benefits.includes(benefit) ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 text-[hsl(var(--cwg-orange))] mr-2" />
                                )}
                                {benefit}
                                {!getCurrentLevelInfo()?.benefits.includes(benefit) && (
                                  <span className="ml-2 text-xs text-[hsl(var(--cwg-orange))]">New!</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-4 text-sm text-[hsl(var(--cwg-muted))]">
                          You need <span className="font-orbitron text-[hsl(var(--cwg-orange))]">{(tokenData.nextLevelRequirement - tokenData.balance).toLocaleString()} {tokenData.symbol}</span> more to reach Level {tokenData.level + 1}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* All Levels */}
                  <div className="mt-8">
                    <h3 className="text-lg font-orbitron text-[hsl(var(--cwg-text))] mb-4">
                      All Guild Levels
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[hsl(var(--cwg-dark-blue))]">
                            <th className="px-4 py-2 text-left text-[hsl(var(--cwg-muted))]">Level</th>
                            <th className="px-4 py-2 text-left text-[hsl(var(--cwg-muted))]">Required Tokens</th>
                            <th className="px-4 py-2 text-left text-[hsl(var(--cwg-muted))]">Benefits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {GUILD_LEVELS.map((level) => (
                            <tr 
                              key={level.level} 
                              className={`border-b border-[hsl(var(--cwg-dark-blue))] ${level.level === tokenData.level ? 'bg-[hsl(var(--cwg-blue))]/10' : ''}`}
                            >
                              <td className="px-4 py-3 text-[hsl(var(--cwg-text))]">
                                {level.level === tokenData.level ? (
                                  <span className="flex items-center">
                                    {level.level} <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                  </span>
                                ) : level.level}
                              </td>
                              <td className="px-4 py-3 text-[hsl(var(--cwg-muted))]">
                                {level.requirement.toLocaleString()} {tokenData.symbol}
                              </td>
                              <td className="px-4 py-3 text-[hsl(var(--cwg-muted))]">
                                <ul className="list-disc list-inside">
                                  {level.benefits.map((benefit, index) => (
                                    <li key={index} className="text-sm">{benefit}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function TokenDashboardPageWrapper() {
  return (
    <ProtectedRoute
      path="/token-dashboard"
      component={TokenDashboardPage}
    />
  );
}
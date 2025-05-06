import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Search, 
  Medal, 
  Award, 
  Star, 
  Gift,
  TrendingUp
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { motion } from 'framer-motion';

interface LeaderboardMember {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
  rank: number;
  previousRank: number;
  points: number;
  level: number;
  achievements: number;
  activity: 'high' | 'medium' | 'low';
  role: string;
  badges: string[];
  joinDate: string;
}

interface LeaderboardState {
  timeframe: 'weekly' | 'monthly' | 'alltime';
  category: 'points' | 'achievements' | 'referrals' | 'activity';
  searchQuery: string;
  highlightUser: boolean;
}

const badgeIcons: Record<string, React.ReactNode> = {
  'diamond': <span className="text-blue-400">♦</span>,
  'gold': <span className="text-yellow-400">★</span>,
  'silver': <span className="text-gray-400">☆</span>,
  'bronze': <span className="text-amber-700">●</span>,
  'event': <span className="text-purple-500">⚔</span>,
  'founder': <span className="text-emerald-500">♕</span>,
  'verified': <span className="text-sky-500">✓</span>,
};

export function MemberLeaderboard() {
  // Current user info
  const { user } = useAuth();

  // Leaderboard settings from localStorage
  const [settings, setSettings] = useLocalStorage<LeaderboardState>('cwg-leaderboard-settings', {
    timeframe: 'weekly',
    category: 'points',
    searchQuery: '',
    highlightUser: true
  });
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(settings.searchQuery);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [visibleMembers, setVisibleMembers] = useState<LeaderboardMember[]>([]);
  const [activeTab, setActiveTab] = useState<string>('leaderboard');
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoadingMembers(true);
      try {
        const response = await apiRequest(
          "GET", 
          `/api/leaderboard?timeframe=${settings.timeframe}&category=${settings.category}`
        );
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setMembers(data);
          applyFilters(data, searchQuery);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        // Use demo data in case of error
        setMembers(demoLeaderboardData);
        applyFilters(demoLeaderboardData, searchQuery);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    fetchLeaderboardData();
  }, [settings.timeframe, settings.category]);
  
  // Apply filters when search query changes
  useEffect(() => {
    applyFilters(members, searchQuery);
  }, [searchQuery, members, settings.highlightUser]);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    setSettings({
      ...settings,
      searchQuery
    });
  }, [searchQuery, settings.timeframe, settings.category, settings.highlightUser]);
  
  // Apply filters to members list
  const applyFilters = (membersList: LeaderboardMember[], query: string) => {
    let filtered = [...membersList];
    
    // Apply search filter if query exists
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        member => member.username.toLowerCase().includes(lowerQuery) || 
                  (member.displayName && member.displayName.toLowerCase().includes(lowerQuery))
      );
    }
    
    setVisibleMembers(filtered);
  };
  
  // Get rank change indicator
  const getRankChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return <Badge variant="outline">New</Badge>;
    
    const diff = previous - current;
    if (diff > 0) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
          <ArrowUp className="h-3 w-3 mr-1" /> {diff}
        </Badge>
      );
    } else if (diff < 0) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
          <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(diff)}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <Minus className="h-3 w-3" />
        </Badge>
      );
    }
  };
  
  // Handle setting changes
  const handleTimeframeChange = (value: string) => {
    setSettings({
      ...settings, 
      timeframe: value as 'weekly' | 'monthly' | 'alltime'
    });
  };
  
  const handleCategoryChange = (value: string) => {
    setSettings({
      ...settings, 
      category: value as 'points' | 'achievements' | 'referrals' | 'activity'
    });
  };
  
  const handleToggleHighlight = () => {
    setSettings({
      ...settings,
      highlightUser: !settings.highlightUser
    });
  };
  
  // Get medal for top ranks
  const getMedal = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return rank;
  };
  
  // Get CSS class for highlight current user
  const getUserRowClass = (memberId: number) => {
    return settings.highlightUser && user && user.id === memberId
      ? 'bg-primary/5 border-l-4 border-primary'
      : '';
  };
  
  // Get category label
  const getCategoryLabel = () => {
    switch (settings.category) {
      case 'points': return 'Points';
      case 'achievements': return 'Achievements';
      case 'referrals': return 'Referrals';
      case 'activity': return 'Activity Score';
      default: return 'Points';
    }
  };
  
  // Render badges for a member
  const renderBadges = (badges: string[]) => {
    return (
      <div className="flex gap-1 flex-wrap">
        {badges.map((badge, index) => (
          <Badge key={index} variant="outline" className="flex items-center gap-1 py-0 h-5">
            {badgeIcons[badge.toLowerCase()] || <Star className="h-3 w-3" />}
            <span className="text-xs capitalize">{badge}</span>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="h-5 w-5 text-primary" />
          Guild Leaderboard
        </CardTitle>
        <CardDescription>
          See who's leading the Web3 gaming community
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="leaderboard" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
            <TabsTrigger value="rewards">Level Rewards</TabsTrigger>
            <TabsTrigger value="badges">Badge Guide</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="leaderboard" className="m-0">
          <div className="px-6 pb-2 pt-4 flex flex-wrap gap-3 justify-between">
            <div className="flex flex-wrap gap-2">
              <Select
                value={settings.timeframe}
                onValueChange={handleTimeframeChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="alltime">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={settings.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="referrals">Referrals</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[340px] rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Level</TableHead>
                    <TableHead className="text-right">{getCategoryLabel()}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingMembers ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-[300px] text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading leaderboard data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : visibleMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-[120px] text-center">
                        <p className="text-muted-foreground">No results found</p>
                        {searchQuery && (
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => setSearchQuery('')}
                          >
                            Clear search
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleMembers.map((member) => (
                      <TableRow key={member.id} className={getUserRowClass(member.id)}>
                        <TableCell className="font-medium text-center">
                          {getMedal(member.rank)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {member.avatar ? (
                                <AvatarImage src={member.avatar} alt={member.username} />
                              ) : (
                                <AvatarFallback>
                                  {member.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.displayName || member.username}</div>
                              <div className="text-xs text-muted-foreground">@{member.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {getRankChangeIndicator(member.rank, member.previousRank)}
                        </TableCell>
                        <TableCell className="font-medium text-right">
                          {member.level}
                        </TableCell>
                        <TableCell className="font-medium text-right">
                          <motion.div
                            key={`${member.id}-${settings.category}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {settings.category === 'points' && member.points}
                            {settings.category === 'achievements' && member.achievements}
                            {settings.category === 'referrals' && member.achievements}
                            {settings.category === 'activity' && (
                              <Badge
                                variant={
                                  member.activity === 'high' ? 'default' :
                                  member.activity === 'medium' ? 'secondary' : 'outline'
                                }
                              >
                                {member.activity}
                              </Badge>
                            )}
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t px-6 py-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={handleToggleHighlight}
              >
                {settings.highlightUser ? 'Disable' : 'Enable'} highlighting
              </Button>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              View Full Leaderboard
            </Button>
          </CardFooter>
        </TabsContent>

        <TabsContent value="rewards" className="m-0">
          <CardContent className="pt-4">
            <ScrollArea className="h-[340px]">
              <div className="space-y-4">
                {levelRewards.map((reward) => (
                  <div key={reward.level} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="text-lg font-bold">{reward.level}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{reward.title}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Gift className="h-3.5 w-3.5" />
                        <span>{reward.type}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-sm text-muted-foreground">
              Earn points by participating in guild activities, completing achievements, and referring new members.
            </div>
          </CardFooter>
        </TabsContent>

        <TabsContent value="badges" className="m-0">
          <CardContent className="pt-4">
            <ScrollArea className="h-[340px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badgesList.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {badgeIcons[badge.id] || <Star className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-sm text-muted-foreground">
              Badges are displayed on your profile and next to your name in guild activities.
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

// Demo data for testing
const demoLeaderboardData: LeaderboardMember[] = [
  {
    id: 1,
    username: "FrostiiGoblin",
    displayName: "Frostii",
    avatar: "/images/avatars/user-1.png",
    rank: 1,
    previousRank: 2,
    points: 12750,
    level: 42,
    achievements: 28,
    activity: "high",
    role: "Owner",
    badges: ["Founder", "Diamond", "Verified"],
    joinDate: "2023-01-15"
  },
  {
    id: 2,
    username: "CryptoSlayer",
    displayName: "Crypto Slayer",
    avatar: "/images/avatars/user-2.png",
    rank: 2,
    previousRank: 1,
    points: 11200,
    level: 38,
    achievements: 24,
    activity: "high",
    role: "Admin",
    badges: ["Gold", "Event"],
    joinDate: "2023-02-20"
  },
  {
    id: 3,
    username: "BlockchainWizard",
    displayName: "BCW",
    avatar: "/images/avatars/user-3.png",
    rank: 3,
    previousRank: 3,
    points: 9800,
    level: 35,
    achievements: 22,
    activity: "high",
    role: "Mod",
    badges: ["Silver", "Verified"],
    joinDate: "2023-03-10"
  },
  {
    id: 4,
    username: "NFTHunter",
    displayName: "NFT Hunter",
    avatar: "/images/avatars/user-4.png",
    rank: 4,
    previousRank: 6,
    points: 8500,
    level: 31,
    achievements: 19,
    activity: "medium",
    role: "Member",
    badges: ["Bronze"],
    joinDate: "2023-03-18"
  },
  {
    id: 5,
    username: "MetaGamer99",
    displayName: "Meta Gamer",
    avatar: "/images/avatars/user-5.png",
    rank: 5,
    previousRank: 4,
    points: 7200,
    level: 28,
    achievements: 17,
    activity: "medium",
    role: "Member",
    badges: ["Bronze"],
    joinDate: "2023-04-05"
  },
  {
    id: 6,
    username: "SolanaQueen",
    displayName: "Solana Queen",
    avatar: "/images/avatars/user-6.png",
    rank: 6,
    previousRank: 5,
    points: 6800,
    level: 26,
    achievements: 15,
    activity: "medium",
    role: "Member",
    badges: ["Bronze"],
    joinDate: "2023-04-12"
  },
  {
    id: 7,
    username: "EthereumKnight",
    displayName: "ETH Knight",
    avatar: "/images/avatars/user-7.png",
    rank: 7,
    previousRank: 8,
    points: 5500,
    level: 22,
    achievements: 13,
    activity: "medium",
    role: "Member",
    badges: [],
    joinDate: "2023-05-01"
  },
  {
    id: 8,
    username: "GameFiWarrior",
    displayName: "GameFi Warrior",
    avatar: "/images/avatars/user-8.png",
    rank: 8,
    previousRank: 7,
    points: 4800,
    level: 19,
    achievements: 11,
    activity: "medium",
    role: "Member",
    badges: [],
    joinDate: "2023-05-15"
  },
  {
    id: 9,
    username: "AvalancheNinja",
    displayName: "Avalanche Ninja",
    rank: 9,
    previousRank: 10,
    points: 3900,
    level: 16,
    achievements: 9,
    activity: "low",
    role: "Member",
    badges: [],
    joinDate: "2023-05-28"
  },
  {
    id: 10,
    username: "PolygonRanger",
    displayName: "Polygon Ranger",
    avatar: "/images/avatars/user-10.png",
    rank: 10,
    previousRank: 9,
    points: 3200,
    level: 14,
    achievements: 7,
    activity: "low",
    role: "Member",
    badges: [],
    joinDate: "2023-06-10"
  },
  {
    id: 11,
    username: "CardanoMaster",
    displayName: "Cardano Master",
    rank: 11,
    previousRank: 12,
    points: 2800,
    level: 12,
    achievements: 6,
    activity: "low",
    role: "Member",
    badges: [],
    joinDate: "2023-06-22"
  },
  {
    id: 12,
    username: "NearExplorer",
    displayName: "Near Explorer",
    avatar: "/images/avatars/user-12.png",
    rank: 12,
    previousRank: 11,
    points: 2400,
    level: 10,
    achievements: 5,
    activity: "low",
    role: "Member",
    badges: [],
    joinDate: "2023-07-05"
  }
];

// Level rewards data
const levelRewards = [
  {
    level: 5,
    title: "Bronze Badge",
    description: "Earn your first badge to display on your profile",
    type: "Badge"
  },
  {
    level: 10,
    title: "Extra Daily Rewards",
    description: "+10% boost to daily login rewards",
    type: "Bonus"
  },
  {
    level: 15,
    title: "Silver Badge",
    description: "Upgrade your profile badge to silver tier",
    type: "Badge"
  },
  {
    level: 20,
    title: "Guild NFT",
    description: "Exclusive ClockWork Gamers NFT for your wallet",
    type: "NFT"
  },
  {
    level: 25,
    title: "Custom Profile Banner",
    description: "Unlock custom profile banners for your profile",
    type: "Cosmetic"
  },
  {
    level: 30,
    title: "Gold Badge",
    description: "Upgrade your profile badge to gold tier",
    type: "Badge"
  },
  {
    level: 40,
    title: "Diamond Badge",
    description: "Upgrade your profile badge to diamond tier",
    type: "Badge"
  },
  {
    level: 50,
    title: "Premium NFT",
    description: "Rare ClockWork Gamers NFT with utility features",
    type: "NFT"
  }
];

// Badge information
const badgesList = [
  {
    id: "founder",
    name: "Founder",
    description: "Original founding member of ClockWork Gamers"
  },
  {
    id: "diamond",
    name: "Diamond",
    description: "Reached level 40+ with exceptional contributions"
  },
  {
    id: "gold",
    name: "Gold",
    description: "Reached level 30+ and made significant contributions"
  },
  {
    id: "silver",
    name: "Silver",
    description: "Reached level 15+ and been active in the community"
  },
  {
    id: "bronze",
    name: "Bronze",
    description: "Reached level 5+ and participated in community activities"
  },
  {
    id: "verified",
    name: "Verified",
    description: "Identity verified through KYC process"
  },
  {
    id: "event",
    name: "Event Champion",
    description: "Won a guild event or tournament"
  }
];
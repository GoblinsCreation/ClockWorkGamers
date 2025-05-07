import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, Trophy, Star, Clock, Check, Gift, Shield, Share2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { AchievementShareModal, AchievementData } from './AchievementShareModal';
import { 
  getTierById, 
  getTierColor, 
  getTierClass, 
  formatReward,
  getNextTier,
  TIERS,
  TIER_NAMES
} from '@shared/achievement-tiers';

// Typing for achievements data
type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirementType: string;
  requirementValue: number;
  rewardType: string;
  rewardValue: number;
  createdAt: string;
  tier?: number;         // The tier level (1-6)
  seriesId?: number;     // The series this achievement belongs to
  baseRequirement?: number; // The base requirement value before tier multiplier
};

type UserAchievementProgress = {
  userId: number;
  achievementId: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  rewardClaimed: boolean;
  nextTierUnlocked?: boolean; // Whether the next tier is unlocked
};

type UserAchievement = Achievement & {
  progress: UserAchievementProgress | null;
  nextTierAvailable?: boolean; // Whether a next tier is available to unlock
};

const AchievementsTracker: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [animatedAchievementId, setAnimatedAchievementId] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
  
  // Handler for opening the share modal
  const handleShareClick = (achievement: AchievementData) => {
    setSelectedAchievement(achievement);
    setShareModalOpen(true);
  };

  // Fetch all achievements with user's progress
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/user/achievements'],
  });
  
  // Fetch user's series progress
  const { data: seriesProgress, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['/api/user/series-progress'],
  });

  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: number) => {
      const response = await apiRequest('POST', `/api/user/achievements/${achievementId}/claim`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements'] });
      toast({
        title: 'Reward claimed!',
        description: 'Your achievement reward has been claimed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to claim reward',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // For testing - increment achievement progress
  const incrementProgressMutation = useMutation({
    mutationFn: async ({ achievementId, increment }: { achievementId: number; increment: number }) => {
      const response = await apiRequest('POST', `/api/user/achievements/${achievementId}/progress`, {
        increment,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements'] });
      if (data.isCompleted && !data.rewardClaimed) {
        setAnimatedAchievementId(data.achievementId);
        setTimeout(() => setAnimatedAchievementId(null), 3000);
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to update progress',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get distinct categories
  const categories = achievements && Array.isArray(achievements)
    ? ['all', ...Array.from(new Set(achievements.map((a: any) => a.category)))]
    : ['all'];

  // Filter achievements by selected category and completion status
  const filteredAchievements = achievements && Array.isArray(achievements)
    ? achievements.filter((achievement: any) => {
        const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
        const matchesCompletion = !showOnlyCompleted || (achievement.progress && achievement.progress.isCompleted);
        return matchesCategory && matchesCompletion;
      })
    : [];

  // Get appropriate icon for an achievement
  const getAchievementIcon = (iconName: string, tier?: number) => {
    // If tier is provided and it's a trophy, use tier-specific styling
    if (tier && iconName.includes('trophy')) {
      const tierInfo = getTierById(tier);
      const tierColor = getTierColor(tier);
      return <Trophy className={`h-6 w-6`} style={{ color: tierColor }} />;
    }
    
    // Default icon handling
    switch (iconName) {
      case 'trophy':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'star':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'clock':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'shield':
        return <Shield className="h-6 w-6 text-purple-500" />;
      default:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (achievement: UserAchievement) => {
    if (!achievement.progress) return 0;
    if (achievement.progress.isCompleted) return 100;
    return Math.min(
      Math.round((achievement.progress.currentValue / achievement.requirementValue) * 100),
      99
    );
  };
  
  // Next tier unlock mutation
  const unlockNextTierMutation = useMutation({
    mutationFn: async (achievementId: number) => {
      const response = await apiRequest('POST', `/api/user/achievements/${achievementId}/next-tier`);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements'] });
      toast({
        title: '🏆 Next tier unlocked!',
        description: 'You\'ve unlocked the next achievement tier. Keep up the great work!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to unlock next tier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get tier display name
  const getTierDisplayName = (tier?: number) => {
    if (!tier) return '';
    const tierInfo = getTierById(tier);
    return tierInfo.name;
  };

  if (isLoading || isSeriesLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter series by completion and tier progress
  const activeSeries = seriesProgress && Array.isArray(seriesProgress)
    ? seriesProgress.filter(series => series.currentTier > 0)
    : [];
  
  const completedSeries = seriesProgress && Array.isArray(seriesProgress)
    ? seriesProgress.filter(series => series.isCompleted)
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Achievement Share Modal */}
      <AchievementShareModal 
        achievement={selectedAchievement}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
      
      {/* Series Progress Section */}
      {activeSeries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">Achievement Series Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSeries.map((series) => (
              <Card key={series.id} className="border-2 border-primary/20 overflow-hidden">
                <CardHeader className="pb-2 relative">
                  <div 
                    className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-500 to-orange-500" 
                    style={{ 
                      transform: `translateX(${(series.currentTier / 6) * 100 - 100}%)`,
                      transition: 'transform 1s ease-out'
                    }}
                  />
                  <div className="relative">
                    <CardTitle className="text-lg">
                      {series.name} 
                      {series.isCompleted && <span className="ml-2 text-sm">✅</span>}
                    </CardTitle>
                    <CardDescription>{series.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tier Progress</span>
                    <span className="text-sm font-medium">
                      {series.currentTier} / 6 ({getTierDisplayName(series.currentTier)})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-blue-600" 
                      style={{ width: `${(series.currentTier / 6) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Guild Achievements</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOnlyCompleted(!showOnlyCompleted)}
            className={showOnlyCompleted ? 'bg-primary/20' : ''}
          >
            {showOnlyCompleted ? 'Show All' : 'Show Completed'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory || 'all'} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: animatedAchievementId === achievement.id ? 1.05 : 1,
                    boxShadow: animatedAchievementId === achievement.id 
                      ? '0 0 20px rgba(255, 165, 0, 0.6)' 
                      : 'none'
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "relative",
                    animatedAchievementId === achievement.id && "z-10"
                  )}
                >
                  <Card className={cn(
                    "border-2",
                    achievement.progress?.isCompleted
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-muted-foreground/20"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getAchievementIcon(achievement.icon, achievement.tier)}
                          <div>
                            <CardTitle className="text-md">{achievement.name}</CardTitle>
                            {achievement.tier && (
                              <span 
                                className="text-xs font-medium" 
                                style={{ color: getTierColor(achievement.tier) }}
                              >
                                {getTierDisplayName(achievement.tier)} Tier
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={achievement.progress?.isCompleted ? 'default' : 'outline'}>
                          {achievement.category}
                        </Badge>
                      </div>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress?.currentValue || 0} / {achievement.requirementValue}
                          </span>
                        </div>
                        <Progress value={getProgressPercentage(achievement)} className="h-2" />
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span>Reward: </span>
                          <span className="font-medium">
                            {achievement.rewardValue} {achievement.rewardType}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full flex flex-col gap-2">
                        {achievement.progress?.isCompleted && !achievement.progress?.rewardClaimed && (
                          <Button
                            className="w-full"
                            onClick={() => claimRewardMutation.mutate(achievement.id)}
                            disabled={claimRewardMutation.isPending}
                          >
                            <Gift className="mr-2 h-4 w-4" /> Claim Reward
                          </Button>
                        )}
                        {achievement.progress?.isCompleted && achievement.progress?.rewardClaimed && (
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" disabled>
                              <Check className="mr-2 h-4 w-4" /> Reward Claimed
                            </Button>
                            <Button 
                              variant="secondary" 
                              className="flex-none aspect-square p-2" 
                              onClick={() => handleShareClick(achievement as AchievementData)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Next Tier Button - Only show for tiered achievements */}
                        {achievement.tier && 
                         achievement.seriesId && 
                         achievement.progress?.isCompleted && 
                         achievement.progress?.rewardClaimed && 
                         !achievement.progress?.nextTierUnlocked && 
                         achievement.tier < 6 && (
                          <Button
                            variant="default"
                            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
                            onClick={() => unlockNextTierMutation.mutate(achievement.id)}
                            disabled={unlockNextTierMutation.isPending}
                          >
                            <ArrowUp className="mr-2 h-4 w-4" /> Unlock {getTierDisplayName(achievement.tier + 1)} Tier
                          </Button>
                        )}
                        {/* Share button for completed achievements without reward */}
                        {achievement.progress?.isCompleted && !achievement.progress?.rewardClaimed && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="w-full mt-2" 
                            onClick={() => handleShareClick(achievement as AchievementData)}
                          >
                            <Share2 className="mr-2 h-4 w-4" /> Share Achievement
                          </Button>
                        )}
                        {/* Test button - for development only */}
                        {!achievement.progress?.isCompleted && import.meta.env.DEV && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              incrementProgressMutation.mutate({
                                achievementId: achievement.id,
                                increment: Math.ceil(achievement.requirementValue / 4),
                              })
                            }
                            disabled={incrementProgressMutation.isPending}
                          >
                            Test Progress +25%
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsTracker;
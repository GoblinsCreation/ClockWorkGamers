import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Clock, Check, Gift, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

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
};

type UserAchievementProgress = {
  userId: number;
  achievementId: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  rewardClaimed: boolean;
};

type UserAchievement = Achievement & {
  progress: UserAchievementProgress | null;
};

const AchievementsTracker: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [animatedAchievementId, setAnimatedAchievementId] = useState<number | null>(null);

  // Fetch all achievements with user's progress
  const { data: achievements, isLoading } = useQuery<UserAchievement[]>({
    queryKey: ['/api/user/achievements'],
    onError: (error) => {
      toast({
        title: 'Error fetching achievements',
        description: error.message,
        variant: 'destructive',
      });
    },
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
  const categories = achievements
    ? ['all', ...new Set(achievements.map((a) => a.category))]
    : ['all'];

  // Filter achievements by selected category and completion status
  const filteredAchievements = achievements
    ? achievements.filter((achievement) => {
        const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
        const matchesCompletion = !showOnlyCompleted || (achievement.progress && achievement.progress.isCompleted);
        return matchesCategory && matchesCompletion;
      })
    : [];

  // Get appropriate icon for an achievement
  const getAchievementIcon = (iconName: string) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
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
                          {getAchievementIcon(achievement.icon)}
                          <CardTitle className="text-md">{achievement.name}</CardTitle>
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
                          <Button variant="outline" className="w-full" disabled>
                            <Check className="mr-2 h-4 w-4" /> Reward Claimed
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
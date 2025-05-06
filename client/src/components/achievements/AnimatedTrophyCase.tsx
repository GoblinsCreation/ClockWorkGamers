import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GlitchText, NeonEffect, FadeInElement } from "@/components/ui/animated-elements";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Award, Star, Sparkles, Medal, Gamepad } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Map requirement types to icons
const iconMap = {
  trophy: Trophy,
  award: Award,
  star: Star,
  medal: Medal,
  sparkle: Sparkles,
  gamepad: Gamepad
};

// Define achievement interface
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirementType: string;
  requirementValue: number;
  rewardType: string;
  rewardValue: number;
  tier: number;
  isGlobal: boolean;
  progress?: {
    id: number;
    userId: number;
    achievementId: number;
    currentValue: number;
    completed: boolean;
    completedAt: string | null;
    rewardClaimed: boolean;
    rewardClaimedAt: string | null;
  } | null;
}

interface AnimatedTrophyCaseProps {
  userId?: number; // If provided, shows another user's achievements
  showBenefits?: boolean;
}

export function AnimatedTrophyCase({ userId, showBenefits = true }: AnimatedTrophyCaseProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Fetch user achievements
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['/api/user/achievements', userId],
    queryFn: async () => {
      const url = userId 
        ? `/api/user/achievements?userId=${userId}` 
        : '/api/user/achievements';
      const res = await apiRequest('GET', url);
      return res.json();
    }
  });

  // Claim achievement reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: number) => {
      const res = await apiRequest('POST', `/api/user/achievements/${achievementId}/claim`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reward Claimed!",
        description: `You've successfully claimed your reward for ${selectedAchievement?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements/completed'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to claim reward",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  // Group achievements by tier
  const tierGroups = achievements.reduce((groups: {[key: number]: Achievement[]}, achievement: Achievement) => {
    const tier = achievement.tier || 1;
    if (!groups[tier]) {
      groups[tier] = [];
    }
    groups[tier].push(achievement);
    return groups;
  }, {});

  // Count completed achievements
  const completedCount = achievements.filter(
    (a: Achievement) => a.progress && a.progress.completed
  ).length;

  const handleClaimReward = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    claimRewardMutation.mutate(achievement.id);
  };

  // Render the icon for an achievement
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Trophy;
    return <IconComponent className="h-6 w-6" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="mt-2 text-muted-foreground">Loading achievements...</span>
      </div>
    );
  }

  // Show message if no achievements
  if (achievements.length === 0) {
    return (
      <Card className="border-2 border-muted bg-background/50 w-full">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Trophy className="h-16 w-16 mb-4 text-muted-foreground" />
          <CardTitle className="text-center mb-2">No Achievements Found</CardTitle>
          <CardDescription className="text-center">
            {userId ? "This user hasn't unlocked any achievements yet." : "Start participating in guild activities to earn achievements!"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Achievement Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-background to-background/80 shadow-lg border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle>
              <GlitchText>Guild Standing</GlitchText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                <NeonEffect>{completedCount}</NeonEffect>
                <span className="text-sm text-muted-foreground ml-1">/ {achievements.length}</span>
              </span>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
            <Progress 
              className="mt-2 h-2" 
              value={(completedCount / achievements.length) * 100} 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 shadow-lg border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle>
              <GlitchText>Tier Progress</GlitchText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {Object.keys(tierGroups).map((tier) => {
                const tierAchievements = tierGroups[Number(tier)];
                const completedInTier = tierAchievements.filter(
                  (a: Achievement) => a.progress && a.progress.completed
                ).length;
                
                return (
                  <div key={tier} className="mb-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tier {tier}</span>
                      <span>{completedInTier} / {tierAchievements.length}</span>
                    </div>
                    <Progress 
                      className="h-1.5" 
                      value={(completedInTier / tierAchievements.length) * 100} 
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 shadow-lg border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle>
              <GlitchText>Rewards Earned</GlitchText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                <NeonEffect>
                  {achievements.filter((a: Achievement) => 
                    a.progress && a.progress.rewardClaimed
                  ).length}
                </NeonEffect>
              </span>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                {achievements.filter((a: Achievement) => 
                  a.progress && a.progress.completed && !a.progress.rewardClaimed
                ).length} rewards available to claim
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits section (optional) */}
      {showBenefits && (
        <FadeInElement>
          <Card className="border border-primary/20 bg-background/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Achievement Benefits
              </CardTitle>
              <CardDescription>Unlock special rewards and privileges by completing achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Guild Tokens</h4>
                    <p className="text-sm text-muted-foreground">Earn CWG tokens for each achievement completed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Status Badges</h4>
                    <p className="text-sm text-muted-foreground">Unlock profile badges to show off your accomplishments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Special Access</h4>
                    <p className="text-sm text-muted-foreground">Gain access to exclusive events and servers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <Medal className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Leaderboard Position</h4>
                    <p className="text-sm text-muted-foreground">Boost your position in the guild leaderboards</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInElement>
      )}

      {/* Achievement Tiers */}
      {Object.keys(tierGroups).map((tier) => (
        <div key={tier} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Tier {tier} Achievements</h3>
            <div className="h-px flex-1 bg-muted"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tierGroups[Number(tier)].map((achievement: Achievement) => {
              const isCompleted = achievement.progress && achievement.progress.completed;
              const isRewardClaimed = achievement.progress && achievement.progress.rewardClaimed;
              const progress = achievement.progress ? 
                (achievement.progress.currentValue / achievement.requirementValue) * 100 : 0;
              
              return (
                <FadeInElement key={achievement.id} delay={achievement.id * 0.1}>
                  <Card 
                    className={`border-2 h-full transition-all duration-300 relative overflow-hidden ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-background to-primary/10 border-primary/40' 
                        : 'bg-background/50 border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute top-0 right-0">
                        <Badge 
                          className="m-2 bg-primary text-primary-foreground"
                          variant="default"
                        >
                          Completed
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {renderIcon(achievement.icon)}
                          </div>
                          <CardTitle className="text-base">{achievement.name}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="mt-1">{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress ? achievement.progress.currentValue : 0} / {achievement.requirementValue}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-sm">Reward:</span>
                          <Badge variant="outline" className="font-medium">
                            {achievement.rewardValue} {achievement.rewardType}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isCompleted && !isRewardClaimed && (
                        <Button 
                          onClick={() => handleClaimReward(achievement)}
                          disabled={claimRewardMutation.isPending}
                          className="w-full bg-primary hover:bg-primary/80"
                        >
                          {claimRewardMutation.isPending && selectedAchievement?.id === achievement.id ? (
                            <>
                              <span className="animate-spin mr-2">⭮</span>
                              Claiming...
                            </>
                          ) : (
                            'Claim Reward'
                          )}
                        </Button>
                      )}
                      {isCompleted && isRewardClaimed && (
                        <Button variant="outline" disabled className="w-full">
                          Reward Claimed
                        </Button>
                      )}
                      {!isCompleted && (
                        <Button variant="outline" className="w-full opacity-70">
                          In Progress
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </FadeInElement>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
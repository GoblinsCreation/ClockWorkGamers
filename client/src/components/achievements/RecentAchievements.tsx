import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
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
  progress: {
    userId: number;
    achievementId: number;
    currentValue: number;
    isCompleted: boolean;
    completedAt: string;
    rewardClaimed: boolean;
  };
};

const RecentAchievements: React.FC = () => {
  const { toast } = useToast();

  // Fetch recently completed achievements
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/user/achievements/completed'],
    queryFn: async () => {
      const response = await fetch('/api/user/achievements/completed?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch recent achievements');
      }
      return response.json();
    },
  });

  // Get appropriate icon for an achievement
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'star':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'clock':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'shield':
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
          <CardDescription>Complete guild achievements to see them here</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You haven't completed any achievements yet. Visit the achievements page to see what you can earn!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Achievements</CardTitle>
        <CardDescription>Your latest accomplishments</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px] pr-4">
          <div className="space-y-3">
            {achievements.map((achievement: any) => (
              <div
                key={achievement.id}
                className="flex items-start gap-3 p-2 rounded-md border border-muted hover:bg-muted/50 transition-colors"
              >
                <div className="bg-muted rounded-md p-2 flex-shrink-0">
                  {getAchievementIcon(achievement.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{achievement.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {achievement.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {achievement.progress?.completedAt
                      ? `Completed ${formatDistanceToNow(new Date(achievement.progress.completedAt), { addSuffix: true })}`
                      : 'Recently completed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentAchievements;
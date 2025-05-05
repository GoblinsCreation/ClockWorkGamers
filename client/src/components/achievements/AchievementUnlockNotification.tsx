import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Types
type CompletedAchievement = {
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

type NotificationProps = {
  achievement?: CompletedAchievement;
  onClose: () => void;
};

// Individual notification component
const AchievementNotification: React.FC<NotificationProps> = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 max-w-sm"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-2 border-yellow-500 bg-background shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardContent className="pt-6 pb-4 px-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center bg-yellow-500/10 p-3 rounded-full mr-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Achievement Unlocked!</h3>
                <Badge variant="outline" className="text-xs">
                  {achievement.category}
                </Badge>
              </div>
              <p className="font-semibold text-sm mt-1">{achievement.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Reward: {achievement.rewardValue} {achievement.rewardType}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Container component that checks for recently completed achievements
const AchievementUnlockNotification: React.FC = () => {
  const [visibleAchievement, setVisibleAchievement] = useState<CompletedAchievement | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());

  // Fetch recently completed achievements
  const { data: recentAchievements } = useQuery<CompletedAchievement[]>({
    queryKey: ['/api/user/achievements/completed'],
    queryFn: async () => {
      const response = await fetch('/api/user/achievements/completed?limit=1');
      if (!response.ok) {
        throw new Error('Failed to fetch recent achievements');
      }
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Show notification for newly completed achievements
  useEffect(() => {
    if (recentAchievements && recentAchievements.length > 0) {
      const mostRecent = recentAchievements[0];
      
      if (mostRecent && mostRecent.progress?.completedAt) {
        const completedAt = new Date(mostRecent.progress.completedAt);
        
        // Only show notification if achievement was completed after our last check
        if (completedAt > lastCheckedTime) {
          setVisibleAchievement(mostRecent);
          setLastCheckedTime(new Date());
          
          // Auto-hide the notification after 10 seconds
          const timer = setTimeout(() => {
            setVisibleAchievement(null);
          }, 10000);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [recentAchievements, lastCheckedTime]);

  const handleClose = () => {
    setVisibleAchievement(null);
  };

  return (
    <AnimatePresence>
      {visibleAchievement && (
        <AchievementNotification 
          achievement={visibleAchievement} 
          onClose={handleClose} 
        />
      )}
    </AnimatePresence>
  );
};

export default AchievementUnlockNotification;
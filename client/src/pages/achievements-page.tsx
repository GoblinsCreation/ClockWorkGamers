import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import AchievementsTracker from '@/components/achievements/AchievementsTracker';
import { Card } from '@/components/ui/card';

const AchievementsPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to view and track your guild achievements.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Guild Achievements</h1>
          <p className="text-xl text-muted-foreground">
            Track your progress and earn rewards for your contributions to the guild
          </p>
        </div>

        <AchievementsTracker />
      </div>
    </div>
  );
};

export default AchievementsPage;
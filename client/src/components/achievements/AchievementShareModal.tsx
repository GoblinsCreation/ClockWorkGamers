import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Trophy, Share2, Copy, Check, Twitter, Facebook, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AchievementData = {
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
  progress?: {
    userId: number;
    achievementId: number;
    currentValue: number;
    isCompleted: boolean;
    completedAt: string;
    rewardClaimed: boolean;
  };
};

interface AchievementShareModalProps {
  achievement: AchievementData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementShareModal({ achievement, isOpen, onClose }: AchievementShareModalProps) {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>('social');
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset states when the modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setSelectedTab('social');
    }
  }, [isOpen]);

  if (!achievement) return null;
  
  // Get appropriate icon for an achievement
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'star':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'clock':
        return <Trophy className="h-8 w-8 text-blue-500" />;
      case 'shield':
        return <Trophy className="h-8 w-8 text-purple-500" />;
      default:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
    }
  };

  // Format achievement for sharing
  const shareTitle = `I just unlocked the "${achievement.name}" achievement on ClockWork Gamers!`;
  const shareDescription = achievement.description;
  const shareUrl = window.location.origin + '/achievements?highlight=' + achievement.id;

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      triggerConfetti();
      toast({
        title: "Link copied!",
        description: "Share it with your friends",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    });
  };

  // Share on Twitter
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    triggerConfetti();
  };

  // Share on Facebook
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(facebookUrl, '_blank');
    triggerConfetti();
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 neon-text-orange">
            <Share2 className="h-5 w-5" />
            Share Your Achievement
          </DialogTitle>
          <DialogDescription>
            Let everyone know about your latest accomplishment!
          </DialogDescription>
        </DialogHeader>

        {/* Achievement card preview */}
        <div className="p-4 bg-card rounded-lg border-2 border-yellow-500 bg-yellow-500/10 mb-4">
          <div className="flex items-start space-x-3">
            <div className="bg-card p-2 rounded-full bg-yellow-500/20">
              {getAchievementIcon(achievement.icon)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{achievement.name}</h3>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
              <div className="mt-2">
                <span className="text-xs bg-yellow-500/20 text-yellow-500 font-medium py-1 px-2 rounded-full">
                  {achievement.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Social Media
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" /> Copy Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={shareOnTwitter}
                variant="outline"
                className="flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500"
              >
                <Twitter className="h-5 w-5" />
                Twitter
              </Button>
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                className="flex items-center gap-2 hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600"
              >
                <Facebook className="h-5 w-5" />
                Facebook
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link">
            <div className="flex space-x-2">
              <div className="grid flex-1 items-center gap-1.5">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  {shareUrl}
                </div>
              </div>
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                className={cn(
                  "transition-all duration-200",
                  copied && "bg-green-500/10 text-green-500 border-green-500"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-500 rounded-full"
                initial={{ 
                  top: "50%", 
                  left: "50%",
                  scale: 0,
                  opacity: 1
                }}
                animate={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  scale: Math.random() * 2 + 0.5,
                  opacity: 0
                }}
                transition={{ 
                  duration: 1.5,
                  delay: Math.random() * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
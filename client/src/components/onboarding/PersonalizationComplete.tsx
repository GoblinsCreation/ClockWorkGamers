import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Zap, Check } from "lucide-react";

// Animation CSS classes
const animationClasses = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  pulse: "animate-pulse",
  bounce: "animate-bounce"
};

interface PersonalizationCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: {
    preferredGames: string[];
    experienceLevel: string;
    web3Interests: string[];
  };
  username?: string;
}

export default function PersonalizationComplete({ 
  isOpen, 
  onClose, 
  preferences,
  username
}: PersonalizationCompleteProps) {
  const [showBadge, setShowBadge] = useState(false);

  // Simulate badge appearing with a slight delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowBadge(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] border-cwg-blue bg-cwg-dark-blue/90 shadow-glow">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 neon-text-orange">
            <Sparkles className="h-6 w-6" /> Personalization Complete!
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-8">
          <div className={`text-center space-y-2 ${animationClasses.fadeIn}`}>
            <h3 className="text-xl font-semibold">
              Welcome to ClockWork Gamers, {username || "Gamer"}!
            </h3>
            <p className="text-muted-foreground">
              Your Web3 gaming journey starts now. We've personalized your experience based on your preferences.
            </p>
          </div>

          {showBadge && (
            <div className="flex justify-center my-6">
              <div className={`relative ${animationClasses.pulse}`}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cwg-orange to-cwg-blue flex items-center justify-center">
                  <Trophy className="text-white h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 bg-cwg-orange text-black text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                  +1
                </div>
              </div>
            </div>
          )}

          <div className={`space-y-4 ${animationClasses.slideUp}`}>
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center text-cwg-blue">
                <Zap className="h-4 w-4 mr-1" /> PERSONALIZED FOR YOU
              </h4>
              <div className="flex flex-wrap gap-2">
                {preferences.preferredGames.slice(0, 3).map((game, i) => (
                  <Badge key={i} className="bg-cwg-blue/20 text-cwg-blue border-cwg-blue/40">
                    {game}
                  </Badge>
                ))}
                {preferences.web3Interests.slice(0, 2).map((interest, i) => (
                  <Badge key={i} className="bg-cwg-orange/20 text-cwg-orange border-cwg-orange/40">
                    {interest}
                  </Badge>
                ))}
                <Badge className="bg-gray-700/50 text-gray-300 border-gray-500/30">
                  {preferences.experienceLevel}
                </Badge>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center text-cwg-orange">
                <Check className="h-4 w-4 mr-1" /> UNLOCKED
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-4 py-3 rounded bg-gradient-to-br from-cwg-dark-blue to-cwg-dark border border-cwg-blue/30">
                  <div className="text-xs text-muted-foreground">Personalized</div>
                  <div className="font-medium">Game Recommendations</div>
                </div>
                <div className="px-4 py-3 rounded bg-gradient-to-br from-cwg-dark-blue to-cwg-dark border border-cwg-blue/30">
                  <div className="text-xs text-muted-foreground">First</div>
                  <div className="font-medium">Guild Achievement</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={onClose}
            className="bg-cwg-orange hover:bg-cwg-orange/90 text-black font-medium px-8"
          >
            Start Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
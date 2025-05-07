import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react';
import './OnboardingFlow.css';

// Game categories with icons
const GAME_CATEGORIES = [
  { id: 'fps', name: 'First-Person Shooters', icon: '🎯' },
  { id: 'strategy', name: 'Strategy Games', icon: '♟️' },
  { id: 'rpg', name: 'Role-Playing Games', icon: '🧙' },
  { id: 'moba', name: 'MOBAs', icon: '🏆' },
  { id: 'racing', name: 'Racing Games', icon: '🏎️' },
  { id: 'sports', name: 'Sports Games', icon: '⚽' },
  { id: 'cardgames', name: 'Card Games', icon: '🃏' },
  { id: 'simulation', name: 'Simulation Games', icon: '🌍' },
  { id: 'arcade', name: 'Arcade Games', icon: '👾' },
  { id: 'puzzle', name: 'Puzzle Games', icon: '🧩' },
];

// Experience levels
const EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'New to gaming or Web3' },
  { id: 'intermediate', name: 'Intermediate', description: 'Familiar with gaming, learning Web3' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced in gaming and Web3' },
  { id: 'expert', name: 'Expert', description: 'Professional gamer or Web3 expert' },
];

// Web3 interest areas
const WEB3_INTERESTS = [
  { id: 'nfts', name: 'NFTs', description: 'Collecting and trading digital assets' },
  { id: 'play2earn', name: 'Play-to-Earn', description: 'Games that reward with cryptocurrency' },
  { id: 'defi', name: 'DeFi Gaming', description: 'Decentralized finance in gaming' },
  { id: 'metaverse', name: 'Metaverse', description: 'Virtual worlds and experiences' },
  { id: 'dao', name: 'Gaming DAOs', description: 'Decentralized autonomous organizations' },
  { id: 'tokens', name: 'Game Tokens', description: 'Cryptocurrency tokens for games' },
  { id: 'not_sure', name: 'Not Sure Yet', description: 'Still exploring Web3 options' },
];

// Primary goals on the platform
const USER_GOALS = [
  { id: 'earn', name: 'Earn Cryptocurrency', description: 'Make money while gaming' },
  { id: 'learn', name: 'Learn Web3 Gaming', description: 'Education and skills development' },
  { id: 'connect', name: 'Connect with Others', description: 'Build community and network' },
  { id: 'compete', name: 'Compete in Tournaments', description: 'Test your skills against others' },
  { id: 'invest', name: 'Invest in Gaming', description: 'Find investment opportunities' },
  { id: 'create', name: 'Create Content', description: 'Stream, create videos, or write guides' },
];

interface OnboardingData {
  preferredGames: string[];
  experienceLevel: string;
  web3Interests: string[];
  primaryGoals: string[];
  bio: string;
  notifications: {
    email: boolean;
    browser: boolean;
    achievements: boolean;
    events: boolean;
  };
}

const defaultOnboardingData: OnboardingData = {
  preferredGames: [],
  experienceLevel: '',
  web3Interests: [],
  primaryGoals: [],
  bio: '',
  notifications: {
    email: true,
    browser: true,
    achievements: true,
    events: true,
  },
};

const OnboardingFlow = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const response = await apiRequest('GET', '/api/user/onboarding-status');
        const data = await response.json();
        
        if (data.needsOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  // Total number of steps in onboarding
  const totalSteps = 6;

  // Progress percentage
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Handle selection of game categories
  const toggleGameCategory = (categoryId: string) => {
    setOnboardingData(prev => {
      const isSelected = prev.preferredGames.includes(categoryId);
      return {
        ...prev,
        preferredGames: isSelected
          ? prev.preferredGames.filter(id => id !== categoryId)
          : [...prev.preferredGames, categoryId],
      };
    });
  };

  // Handle selection of experience level
  const setExperienceLevel = (level: string) => {
    setOnboardingData(prev => ({
      ...prev,
      experienceLevel: level,
    }));
  };

  // Handle selection of Web3 interests
  const toggleWeb3Interest = (interestId: string) => {
    setOnboardingData(prev => {
      const isSelected = prev.web3Interests.includes(interestId);
      return {
        ...prev,
        web3Interests: isSelected
          ? prev.web3Interests.filter(id => id !== interestId)
          : [...prev.web3Interests, interestId],
      };
    });
  };

  // Handle selection of primary goals
  const toggleGoal = (goalId: string) => {
    setOnboardingData(prev => {
      const isSelected = prev.primaryGoals.includes(goalId);
      return {
        ...prev,
        primaryGoals: isSelected
          ? prev.primaryGoals.filter(id => id !== goalId)
          : [...prev.primaryGoals, goalId],
      };
    });
  };

  // Handle bio input
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOnboardingData(prev => ({
      ...prev,
      bio: e.target.value,
    }));
  };

  // Handle notification preferences
  const toggleNotificationPreference = (key: keyof typeof onboardingData.notifications) => {
    setOnboardingData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  // Check if current step is valid and can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Game categories
        return onboardingData.preferredGames.length > 0;
      case 1: // Experience level
        return onboardingData.experienceLevel !== '';
      case 2: // Web3 interests
        return onboardingData.web3Interests.length > 0;
      case 3: // Primary goals
        return onboardingData.primaryGoals.length > 0;
      case 4: // Bio
        return onboardingData.bio.trim().length > 0;
      case 5: // Notification preferences
        return true; // Always valid, using defaults
      default:
        return false;
    }
  };

  // Go to next step
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Finalize and submit onboarding data
  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/user/complete-onboarding', onboardingData);
      
      // Update user profile data in client cache
      queryClient.invalidateQueries({
        queryKey: ['/api/user/profile']
      });
      
      // Close onboarding
      setShowOnboarding(false);
      
      // Show success message
      toast({
        title: 'Welcome to ClockWork Gamers!',
        description: 'Your profile has been personalized based on your preferences.',
        variant: 'default',
      });

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast({
        title: 'Onboarding Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip onboarding
  const skipOnboarding = async () => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/user/skip-onboarding');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <CardHeader>
              <CardTitle>What games do you enjoy?</CardTitle>
              <CardDescription>
                Select the categories of games you're interested in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="game-categories-grid">
                {GAME_CATEGORIES.map((category) => (
                  <div 
                    key={category.id}
                    className={`game-category-item ${onboardingData.preferredGames.includes(category.id) ? 'selected' : ''}`}
                    onClick={() => toggleGameCategory(category.id)}
                  >
                    <div className="game-category-icon">{category.icon}</div>
                    <div className="game-category-name">{category.name}</div>
                    {onboardingData.preferredGames.includes(category.id) && (
                      <div className="game-category-check">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        );
      
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Your Gaming Experience</CardTitle>
              <CardDescription>
                Tell us about your experience level with gaming and Web3.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={onboardingData.experienceLevel} 
                onValueChange={setExperienceLevel}
                className="experience-level-grid"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <div className="experience-level-item" key={level.id}>
                    <RadioGroupItem value={level.id} id={level.id} />
                    <Label htmlFor={level.id} className="experience-level-label">
                      <span className="font-medium">{level.name}</span>
                      <span className="text-sm text-muted-foreground">{level.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </>
        );
      
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Web3 Interests</CardTitle>
              <CardDescription>
                Which aspects of Web3 gaming are you most interested in exploring?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="web3-interests-grid">
                {WEB3_INTERESTS.map((interest) => (
                  <div 
                    key={interest.id}
                    className={`web3-interest-item ${onboardingData.web3Interests.includes(interest.id) ? 'selected' : ''}`}
                    onClick={() => toggleWeb3Interest(interest.id)}
                  >
                    <div className="web3-interest-content">
                      <div className="web3-interest-name">{interest.name}</div>
                      <div className="web3-interest-desc">{interest.description}</div>
                    </div>
                    <div className="web3-interest-check">
                      {onboardingData.web3Interests.includes(interest.id) && <Check size={16} />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        );
      
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Your Goals</CardTitle>
              <CardDescription>
                What do you hope to achieve on ClockWork Gamers?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="user-goals-grid">
                {USER_GOALS.map((goal) => (
                  <div 
                    key={goal.id}
                    className={`user-goal-item ${onboardingData.primaryGoals.includes(goal.id) ? 'selected' : ''}`}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <div className="user-goal-content">
                      <div className="user-goal-name">{goal.name}</div>
                      <div className="user-goal-desc">{goal.description}</div>
                    </div>
                    <div className="user-goal-check">
                      {onboardingData.primaryGoals.includes(goal.id) && <Check size={16} />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        );
      
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle>About You</CardTitle>
              <CardDescription>
                Tell the community a bit about yourself.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bio-container">
                <Textarea
                  value={onboardingData.bio}
                  onChange={handleBioChange}
                  placeholder="Share your gaming background, interests, achievements, or anything else you'd like other members to know about you."
                  className="bio-textarea"
                  rows={6}
                />
                <div className="bio-character-count">
                  <span className={onboardingData.bio.length > 500 ? 'text-red-500' : ''}>
                    {onboardingData.bio.length}/500
                  </span>
                </div>
              </div>
            </CardContent>
          </>
        );
      
      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you'd like to be notified about activity on ClockWork Gamers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="notification-preferences">
                <div className="notification-preference-item">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email-notifications" 
                      checked={onboardingData.notifications.email}
                      onCheckedChange={() => toggleNotificationPreference('email')}
                    />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Receive notifications about important updates via email
                  </div>
                </div>
                
                <div className="notification-preference-item">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="browser-notifications" 
                      checked={onboardingData.notifications.browser}
                      onCheckedChange={() => toggleNotificationPreference('browser')}
                    />
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Receive real-time notifications in your browser
                  </div>
                </div>
                
                <div className="notification-preference-item">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="achievement-notifications" 
                      checked={onboardingData.notifications.achievements}
                      onCheckedChange={() => toggleNotificationPreference('achievements')}
                    />
                    <Label htmlFor="achievement-notifications">Achievement Alerts</Label>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Get notified when you earn new achievements
                  </div>
                </div>
                
                <div className="notification-preference-item">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="event-notifications" 
                      checked={onboardingData.notifications.events}
                      onCheckedChange={() => toggleNotificationPreference('events')}
                    />
                    <Label htmlFor="event-notifications">Event Reminders</Label>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Receive reminders about upcoming tournaments and events
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className="onboarding-dialog sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to ClockWork Gamers</DialogTitle>
          <DialogDescription>
            Let's personalize your experience based on your preferences.
          </DialogDescription>
        </DialogHeader>
        
        <Progress value={progress} className="w-full my-2" />
        
        <Card className="border-none shadow-none">
          {renderStepContent()}
          
          <CardFooter className="flex justify-between pt-6">
            <div>
              {currentStep > 0 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={skipOnboarding}>
                  Skip for now
                </Button>
              )}
            </div>
            
            <Button 
              onClick={nextStep} 
              disabled={!canProceed() || isSubmitting}
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  {isSubmitting ? 'Saving...' : 'Complete'}
                  {!isSubmitting && <Check className="ml-1 h-4 w-4" />}
                </>
              ) : (
                <>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="onboarding-steps">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`onboarding-step ${currentStep === index ? 'active' : ''} ${
                currentStep > index ? 'completed' : ''
              }`}
              onClick={() => index < currentStep && setCurrentStep(index)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;
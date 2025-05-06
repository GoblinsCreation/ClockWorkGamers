import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedButton, AnimatedCard, GlowingElement, PulseWrapper } from '@/components/ui/animated-elements';
import { ChevronsUp, ChevronsRight, Sparkles, Zap, Award, RotateCw } from 'lucide-react';
import { animations } from '@/lib/animations';

export function MicroInteractionDemo() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 neon-text-orange">Micro-Interaction Showcase</h2>
      <p className="mb-6 text-muted-foreground">
        Interact with these elements to see the micro-animations in action.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card with hover effect */}
        <div className="hover-lift">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Hover Lift Effect</CardTitle>
              <CardDescription>Hover over this card to see it lift</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the hover-lift class to create a subtle elevation effect on hover.</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Button with click effect */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Button Click Effects</CardTitle>
            <CardDescription>Click for ripple effect</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Button className="btn-click-effect w-full">
              Click Me
            </Button>
            <Button className="btn-click-effect w-full" variant="secondary">
              Secondary Button
            </Button>
          </CardContent>
        </Card>
        
        {/* Web3 glow effects */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Web3 Glow Effects</CardTitle>
            <CardDescription>Cyberpunk-inspired glow effects</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="web3-glow bg-card w-16 h-16 rounded-lg flex items-center justify-center">
              <Sparkles className="text-amber-500" />
            </div>
            <div className="cyberblue-glow bg-card w-16 h-16 rounded-lg flex items-center justify-center">
              <Zap className="text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        {/* Framer Motion animations */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Appear/Disappear</CardTitle>
            <CardDescription>Framer Motion transitions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button onClick={toggleVisibility}>
              {isVisible ? 'Hide Element' : 'Show Element'}
            </Button>
            
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-secondary p-4 rounded-md w-full text-center"
              >
                <p>This element animates in and out!</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
        
        {/* Animated button from our custom components */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Interactive Buttons</CardTitle>
            <CardDescription>Micro-bounce animation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <AnimatedButton 
              animationVariant="microBounce"
              className="w-full"
            >
              <ChevronsUp className="mr-2 h-4 w-4" /> Bounce Effect
            </AnimatedButton>
            
            <AnimatedButton 
              animationVariant="microBounce"
              variant="secondary"
              className="w-full"
            >
              <ChevronsRight className="mr-2 h-4 w-4" /> Secondary Button
            </AnimatedButton>
          </CardContent>
        </Card>
        
        {/* Achievement unlock animation */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Achievement Animation</CardTitle>
            <CardDescription>Celebratory animations for achievements</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button onClick={triggerAnimation} className="w-full">
              Trigger Animation
            </Button>
            
            <div className="relative h-20 w-full flex items-center justify-center">
              {isAnimating && (
                <motion.div
                  className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-md flex items-center"
                  {...animations.achievementUnlock}
                >
                  <Award className="h-6 w-6 mr-2 text-white" />
                  <span className="text-white font-medium">Achievement Unlocked!</span>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Floating animation */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Floating Elements</CardTitle>
            <CardDescription>Subtle floating animation</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="float bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>
        
        {/* Pulsing effect */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Pulsing Elements</CardTitle>
            <CardDescription>Attention-grabbing pulse</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <PulseWrapper className="bg-green-500 p-4 rounded-lg text-white">
              <Award className="h-8 w-8" />
            </PulseWrapper>
          </CardContent>
        </Card>
        
        {/* Loading spinner */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Loading Animation</CardTitle>
            <CardDescription>Styled loading spinner</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="spinner"></div>
            <div className="flex items-center space-x-2">
              <RotateCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Processing...</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Shake animation */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Error Feedback</CardTitle>
            <CardDescription>Shake animation for errors</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button 
              onClick={(e) => {
                const target = e.currentTarget;
                target.classList.add('shake');
                setTimeout(() => target.classList.remove('shake'), 500);
              }}
              variant="destructive"
              className="w-full"
            >
              Trigger Error Shake
            </Button>
          </CardContent>
        </Card>
        
        {/* Text reveal animation */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Text Animations</CardTitle>
            <CardDescription>Animated text reveal effects</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={(e) => {
                const textWrapper = document.querySelector('.text-reveal-container');
                if (textWrapper) {
                  // Reset animation by cloning
                  const clone = textWrapper.cloneNode(true);
                  textWrapper.parentNode?.replaceChild(clone, textWrapper);
                }
              }}
              className="mb-4 w-full"
            >
              Replay Animation
            </Button>
            
            <div className="text-reveal-container">
              <p className="text-reveal">
                <span className="text-reveal-inner" style={{animationDelay: '0ms'}}>
                  Welcome
                </span>
              </p>
              <p className="text-reveal">
                <span className="text-reveal-inner" style={{animationDelay: '100ms'}}>
                  to ClockWork
                </span>
              </p>
              <p className="text-reveal">
                <span className="text-reveal-inner" style={{animationDelay: '200ms'}}>
                  Gamers!
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Web3 chip with gradient animation */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Web3 Chip</CardTitle>
            <CardDescription>Dynamic gradient animation</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="web3-chip bg-dark p-4 text-center">
              <GlowingElement className="font-bold text-lg text-white">
                Premium NFT Collection
              </GlowingElement>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
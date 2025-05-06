// Animation utilities for ClockWork Gamers platform
// Provides consistent animation variants for framer-motion
import { Transition } from "framer-motion";

/**
 * Common animation variants that can be reused across the application
 */
export const animations: Record<string, {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  exit?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  transition?: Transition;
}> = {
  // Fade in animation
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  // Slide and fade from bottom
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  
  // Slide and fade from right
  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  
  // Slide and fade from left
  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  
  // Scale up animation
  scaleUp: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  
  // Micro-bounce for buttons and interactive elements
  microBounce: {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  
  // Stagger children animations
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Glow effect for web3/crypto elements
  glow: {
    initial: { boxShadow: "0 0 0 rgba(252, 123, 30, 0)" },
    animate: { boxShadow: "0 0 15px rgba(252, 123, 30, 0.7)" },
    transition: { 
      duration: 1.5, 
      repeat: Infinity, 
      repeatType: "reverse" 
    }
  },
  
  // Pulse animation for notifications and alerts
  pulse: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        repeatType: "loop" 
      }
    }
  },
  
  // Special animation for achievements
  achievementUnlock: {
    initial: { scale: 0.5, rotate: -10, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    exit: { 
      scale: 1.2, 
      opacity: 0,
      transition: { duration: 0.3 } 
    }
  },
  
  // Animation for page transitions
  pageTransition: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  }
};

/**
 * Animation utilities
 */
export const animationUtils = {
  // Create a staggered delay based on index
  staggerDelay: (index: number, baseDelay: number = 0.1) => {
    return baseDelay * index;
  }
};
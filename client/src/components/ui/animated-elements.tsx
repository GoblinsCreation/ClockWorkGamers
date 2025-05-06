import { motion, Variant, Transition } from "framer-motion";
import { animations } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

// Fix typings for the animations
type AnimationVariant = {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  exit?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  transition?: Transition;
};

/**
 * Motion components for consistent animations across the app
 */

// Animated button with micro-interactions
interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
  animationVariant?: keyof typeof animations;
}

export const AnimatedButton = ({
  children,
  onClick,
  className,
  disabled,
  variant = "default",
  size = "default",
  type = "button",
  animationVariant = "microBounce"
}: AnimatedButtonProps) => {
  return (
    <motion.div
      {...animations[animationVariant]}
    >
      <Button
        onClick={onClick}
        className={className}
        disabled={disabled}
        variant={variant}
        size={size}
        type={type}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Animated card component
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  animationVariant?: keyof typeof animations;
}

export const AnimatedCard = ({
  children,
  className,
  animationVariant = "scaleUp"
}: AnimatedCardProps) => {
  return (
    <motion.div
      {...animations[animationVariant]}
    >
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  );
};

// Animated container for any content
interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  animationVariant?: keyof typeof animations;
  delay?: number;
}

export const AnimatedContainer = ({
  children,
  className,
  animationVariant = "fadeIn",
  delay = 0
}: AnimatedContainerProps) => {
  const animationProps = { ...animations[animationVariant] };
  
  if (delay) {
    animationProps.transition = {
      ...animationProps.transition,
      delay
    };
  }
  
  return (
    <motion.div
      {...animationProps}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// For staggered list items
interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export const AnimatedList = ({ 
  children,
  className
}: { 
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.ul
      className={className}
      variants={animations.staggerChildren}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.ul>
  );
};

export const AnimatedListItem = ({
  children,
  className,
  index = 0
}: AnimatedListItemProps) => {
  return (
    <motion.li
      className={className}
      variants={animations.slideRight}
      transition={{
        delay: index * 0.05,
        ...animations.slideRight.transition
      }}
    >
      {children}
    </motion.li>
  );
};

// Animated glow effect for Web3 elements
export const GlowingElement = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      {...animations.glow}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated badge for achievements, notifications, etc.
export const AnimatedBadge = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated page container for page transitions
export const AnimatedPage = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      {...animations.pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation wrapper
export const PulseWrapper = ({
  children,
  className,
  pulse = true
}: {
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}) => {
  return (
    <motion.div
      {...(pulse ? animations.pulse : {})}
      className={className}
    >
      {children}
    </motion.div>
  );
};
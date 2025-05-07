import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import React from "react";

// Define the CardProps ourselves since there's no export from the original file
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;

// Neon card that pulses with a specific color
interface NeonCardProps {
  color: "blue" | "orange" | "purple" | "green" | "red";
  className?: string;
  children: React.ReactNode;
}

export function NeonCard({ color, className, children, ...props }: NeonCardProps) {
  const borderColor = 
    color === "blue" ? "border-[hsl(var(--cwg-blue))]" :
    color === "orange" ? "border-[hsl(var(--cwg-orange))]" :
    color === "purple" ? "border-[hsl(var(--cwg-purple))]" :
    color === "green" ? "border-green-500" :
    "border-red-500";
  
  const shadowColor = 
    color === "blue" ? "shadow-[0_0_20px_rgba(0,120,255,0.3)]" :
    color === "orange" ? "shadow-[0_0_20px_rgba(255,120,0,0.3)]" :
    color === "purple" ? "shadow-[0_0_20px_rgba(180,0,255,0.3)]" :
    color === "green" ? "shadow-[0_0_20px_rgba(0,180,70,0.3)]" :
    "shadow-[0_0_20px_rgba(255,0,50,0.3)]";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={shadowColor}
    >
      <Card 
        className={cn(`border-2 ${borderColor} transition-shadow duration-300 hover:${shadowColor}`, className)} 
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

// Floating badge that animates
interface FloatingBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingBadge({ children, className }: FloatingBadgeProps) {
  return (
    <motion.div
      className={cn(
        "px-3 py-1 rounded-full text-sm text-white bg-[hsl(var(--cwg-blue))]",
        className
      )}
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -8, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulsing icon element
interface PulsingIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PulsingIcon({ children, className, ...props }: PulsingIconProps) {
  return (
    <motion.div
      className={cn("text-[hsl(var(--cwg-blue))]", className)}
      initial={{ scale: 1 }}
      animate={{ 
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Progress bar with animation
interface AnimatedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  color?: "blue" | "orange" | "purple" | "green" | "red";
}

export function AnimatedProgress({ 
  value, 
  max, 
  color = "blue", 
  className, 
  ...props 
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const barColor = 
    color === "blue" ? "bg-[hsl(var(--cwg-blue))]" :
    color === "orange" ? "bg-[hsl(var(--cwg-orange))]" :
    color === "purple" ? "bg-[hsl(var(--cwg-purple))]" :
    color === "green" ? "bg-green-500" :
    "bg-red-500";
  
  return (
    <div 
      className={cn("w-full h-2 bg-[hsl(var(--cwg-dark))] rounded-full overflow-hidden", className)}
      {...props}
    >
      <motion.div 
        className={`h-full ${barColor} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// Animated container that fades in elements
interface FadeInContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerChildren?: boolean;
  delay?: number;
}

export function FadeInContainer({ 
  children, 
  staggerChildren = false,
  delay = 0,
  className, 
  ...props 
}: FadeInContainerProps) {
  // Clone children and add animation props if staggering
  const renderChildren = () => {
    if (!staggerChildren) return children;
    
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      return React.cloneElement(child as React.ReactElement<any>, {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { 
          duration: 0.3,
          delay: delay + (index * 0.1) 
        }
      });
    });
  };
  
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {renderChildren()}
    </motion.div>
  );
}

// Animated text with glow effect
interface GlowingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: "blue" | "orange" | "purple" | "green" | "red";
}

export function GlowingText({ 
  children, 
  color = "blue", 
  className, 
  ...props 
}: GlowingTextProps) {
  const textColor = 
    color === "blue" ? "text-[hsl(var(--cwg-blue))]" :
    color === "orange" ? "text-[hsl(var(--cwg-orange))]" :
    color === "purple" ? "text-[hsl(var(--cwg-purple))]" :
    color === "green" ? "text-green-500" :
    "text-red-500";
  
  const textShadow = 
    color === "blue" ? "text-shadow-blue" :
    color === "orange" ? "text-shadow-orange" :
    color === "purple" ? "text-shadow-purple" :
    color === "green" ? "text-shadow-green" :
    "text-shadow-red";
  
  return (
    <motion.div
      className={cn(`${textColor} ${textShadow} font-bold`, className)}
      initial={{ textShadow: "0 0 0px rgba(0,0,0,0)" }}
      animate={{ 
        textShadow: [
          "0 0 4px rgba(120,180,255,0.7)",
          "0 0 8px rgba(120,180,255,0.9)",
          "0 0 4px rgba(120,180,255,0.7)",
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "loop"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
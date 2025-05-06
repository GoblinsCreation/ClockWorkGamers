import React, { ReactNode } from 'react';
import { motion, useAnimation, MotionProps, Variants, Transition } from 'framer-motion';

interface AnimatedElementProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

/**
 * GlowingBorder - Creates a container with an animated glowing border effect
 */
export const GlowingBorder: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <motion.div
      className={`relative rounded-lg border border-blue-500/30 overflow-hidden 
                bg-blue-950/20 backdrop-filter backdrop-blur-sm ${className}`}
      initial={{ boxShadow: '0 0 0 rgba(59, 130, 246, 0)' }}
      animate={{ 
        boxShadow: ['0 0 10px rgba(59, 130, 246, 0.2)', 
                    '0 0 15px rgba(59, 130, 246, 0.4)', 
                    '0 0 10px rgba(59, 130, 246, 0.2)'] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 2,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * NeonText - Creates text with a neon glow effect
 */
export const NeonText: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.h2
      className={`text-blue-400 ${className}`}
      initial={{ textShadow: '0 0 0px rgba(59, 130, 246, 0)' }}
      animate={{ 
        textShadow: [
          '0 0 5px rgba(59, 130, 246, 0.3)', 
          '0 0 8px rgba(59, 130, 246, 0.5)', 
          '0 0 5px rgba(59, 130, 246, 0.3)'
        ] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 2,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.h2>
  );
};

/**
 * FloatingElement - Creates a slightly floating element
 */
export const FloatingElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [0, -10, 0] 
      }}
      transition={{ 
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut", 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * PulseElement - Creates a pulsing element
 */
export const PulseElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{ 
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut", 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerChildren - Animates children with a staggered delay
 */
export const StaggerChildren: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  const variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * GlitchText - Creates text with a glitching effect
 * Note: This effect is more intensive, use sparingly
 */
interface GlitchTextProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ 
  children, 
  text,
  className = '',
  ...props 
}) => {
  // Use text prop if children not provided
  const content = children || text;
  const glitchVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      }
    },
    glitch: {
      opacity: 1,
      x: [0, -2, 2, -2, 0],
      y: [0, 1, -1, 0],
      color: [
        "rgb(59, 130, 246)", 
        "rgb(239, 68, 68)", 
        "rgb(34, 197, 94)",
        "rgb(59, 130, 246)"
      ]
    }
  };

  const controls = useAnimation();

  React.useEffect(() => {
    // Initial animation
    controls.start("visible");
    
    // Set up random interval for glitch effect
    const interval = setInterval(() => {
      controls.start("glitch").then(() => {
        controls.start("visible");
      });
    }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds
    
    return () => clearInterval(interval);
  }, [controls]);

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={glitchVariants}
      initial="hidden"
      animate={controls}
      {...props}
    >
      {content}
    </motion.span>
  );
};

/**
 * TypewriterText - Creates a typewriter effect for text
 */
export const TypewriterText: React.FC<AnimatedElementProps & { text: string }> = ({ 
  text,
  className = '',
  ...props 
}) => {
  const characters = Array.from(text);
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const characterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={characterVariants}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

/**
 * NeonEffect - Creates a wrapper with a subtle neon text glow
 */
export const NeonEffect: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.span
      className={`relative ${className}`}
      initial={{ textShadow: '0 0 0px rgba(234, 88, 12, 0)' }}
      animate={{ 
        textShadow: [
          '0 0 2px rgba(234, 88, 12, 0.3)',
          '0 0 4px rgba(234, 88, 12, 0.6)',
          '0 0 2px rgba(234, 88, 12, 0.3)'
        ]
      }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

/**
 * FadeInElement - Creates an element that fades in with optional delay
 */
export const FadeInElement: React.FC<AnimatedElementProps & { delay?: number }> = ({ 
  children, 
  className = '',
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
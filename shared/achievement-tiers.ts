/**
 * Achievement Tier System for ClockWork Gamers
 * 
 * This file defines the tier system for guild achievements.
 * Each achievement can have multiple tiers with increasing requirements and rewards.
 */

/**
 * Standard achievement tier names
 */
export const TIER_NAMES = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  DIAMOND: 'Diamond',
  MASTER: 'Master'
};

/**
 * Achievement tier information including visual elements and multipliers
 */
export const TIERS = [
  { 
    id: 1, 
    name: TIER_NAMES.BRONZE, 
    multiplier: 1, 
    color: '#cd7f32', 
    icon: 'trophy-bronze',
    xpReward: 50,
    description: 'First steps on your journey'
  },
  { 
    id: 2, 
    name: TIER_NAMES.SILVER, 
    multiplier: 2, 
    color: '#c0c0c0', 
    icon: 'trophy-silver',
    xpReward: 150,
    description: 'Rising through the ranks'
  },
  { 
    id: 3, 
    name: TIER_NAMES.GOLD, 
    multiplier: 4, 
    color: '#ffd700', 
    icon: 'trophy-gold',
    xpReward: 300,
    description: 'Becoming a notable member'
  },
  { 
    id: 4, 
    name: TIER_NAMES.PLATINUM, 
    multiplier: 8, 
    color: '#e5e4e2', 
    icon: 'trophy-platinum',
    xpReward: 500,
    description: 'Elite achievement status'
  },
  { 
    id: 5, 
    name: TIER_NAMES.DIAMOND, 
    multiplier: 12, 
    color: '#b9f2ff', 
    icon: 'trophy-diamond',
    xpReward: 1000,
    description: 'Master of Web3 gaming'
  },
  { 
    id: 6, 
    name: TIER_NAMES.MASTER, 
    multiplier: 18, 
    color: '#ff7700', 
    icon: 'trophy-master',
    xpReward: 2000,
    description: 'Legendary guild status'
  }
];

/**
 * Achievement categories with descriptions
 */
export const ACHIEVEMENT_CATEGORIES = {
  ONBOARDING: {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Getting started with ClockWork Gamers'
  },
  COMMUNITY: {
    id: 'community',
    name: 'Community',
    description: 'Engaging with the ClockWork community'
  },
  WEB3: {
    id: 'web3',
    name: 'Web3',
    description: 'Blockchain and cryptocurrency activities'
  },
  GAMING: {
    id: 'gaming',
    name: 'Gaming',
    description: 'Gaming achievements and milestones'
  },
  CONTENT: {
    id: 'content',
    name: 'Content',
    description: 'Creating and sharing content'
  },
  SPECIAL: {
    id: 'special',
    name: 'Special',
    description: 'Exclusive and limited-time achievements'
  }
};

/**
 * Get tier information by its ID
 */
export function getTierById(tierId: number) {
  return TIERS.find(tier => tier.id === tierId) || TIERS[0];
}

/**
 * Get the next tier information
 */
export function getNextTier(currentTierId: number) {
  const nextTierId = currentTierId + 1;
  return nextTierId <= TIERS.length ? getTierById(nextTierId) : null;
}

/**
 * Calculate the requirement value for a specific tier based on the base requirement
 */
export function calculateTierRequirement(baseRequirement: number, tierId: number) {
  const tier = getTierById(tierId);
  return Math.round(baseRequirement * tier.multiplier);
}

/**
 * Calculate the reward value for a specific tier based on the base reward
 */
export function calculateTierReward(baseReward: number, tierId: number) {
  const tier = getTierById(tierId);
  return Math.round(baseReward * tier.multiplier);
}

/**
 * Get the CSS class for achievement tier styling
 */
export function getTierClass(tierId: number) {
  const tier = getTierById(tierId);
  return `tier-${tier.name.toLowerCase()}`;
}

/**
 * Get a color for the tier (for styling)
 */
export function getTierColor(tierId: number) {
  const tier = getTierById(tierId);
  return tier.color;
}

/**
 * Get tier progress information
 */
export function getTierProgress(currentValue: number, targetValue: number) {
  const percentage = Math.min(100, Math.floor((currentValue / targetValue) * 100));
  return {
    percentage,
    current: currentValue,
    target: targetValue,
    remaining: Math.max(0, targetValue - currentValue)
  };
}

/**
 * Format the achievement reward for display
 */
export function formatReward(rewardType: string, rewardValue: number) {
  switch (rewardType) {
    case 'tokens':
      return `${rewardValue} CWG Tokens`;
    case 'xp':
      return `${rewardValue} XP`;
    case 'badge':
      return 'Special Badge';
    case 'discount':
      return `${rewardValue}% Discount`;
    default:
      return `${rewardValue} ${rewardType}`;
  }
}
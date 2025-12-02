/**
 * Reward Points Utilities
 * Calculate levels, progress, and manage reward points system
 */

export type RewardLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface RewardLevelConfig {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
  gradient: string[];
}

export const REWARD_LEVELS: Record<RewardLevel, RewardLevelConfig> = {
  bronze: {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 500,
    color: '#CD7F32', // Bronze color
    icon: 'medal',
    gradient: ['#CD7F32', '#B87333'],
  },
  silver: {
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1500,
    color: '#C0C0C0', // Silver color
    icon: 'trophy',
    gradient: ['#C0C0C0', '#A8A8A8'],
  },
  gold: {
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 5000,
    color: '#FFD700', // Gold color
    icon: 'star',
    gradient: ['#FFD700', '#FFA500'],
  },
  platinum: {
    name: 'Platinum',
    minPoints: 5000,
    maxPoints: Infinity,
    color: '#E5E4E2', // Platinum color
    icon: 'diamond',
    gradient: ['#E5E4E2', '#BCC6CC'],
  },
};

/**
 * Get reward level based on points
 */
export function getRewardLevel(points: number): RewardLevel {
  if (points >= REWARD_LEVELS.platinum.minPoints) return 'platinum';
  if (points >= REWARD_LEVELS.gold.minPoints) return 'gold';
  if (points >= REWARD_LEVELS.silver.minPoints) return 'silver';
  return 'bronze';
}

/**
 * Get level configuration
 */
export function getLevelConfig(points: number): RewardLevelConfig {
  const level = getRewardLevel(points);
  return REWARD_LEVELS[level];
}

/**
 * Calculate progress to next level (0-100)
 */
export function getProgressToNextLevel(points: number): number {
  const currentLevel = getRewardLevel(points);
  const currentConfig = REWARD_LEVELS[currentLevel];
  const nextLevel = getNextLevel(currentLevel);

  if (!nextLevel) {
    // Already at max level
    return 100;
  }

  const nextConfig = REWARD_LEVELS[nextLevel];
  const range = nextConfig.minPoints - currentConfig.minPoints;
  const progress = points - currentConfig.minPoints;
  const percentage = Math.min(100, Math.max(0, (progress / range) * 100));

  return percentage;
}

/**
 * Get next level
 */
export function getNextLevel(currentLevel: RewardLevel): RewardLevel | null {
  switch (currentLevel) {
    case 'bronze':
      return 'silver';
    case 'silver':
      return 'gold';
    case 'gold':
      return 'platinum';
    case 'platinum':
      return null; // Max level
    default:
      return 'silver';
  }
}

/**
 * Get points needed for next level
 */
export function getPointsForNextLevel(points: number): number {
  const currentLevel = getRewardLevel(points);
  const currentConfig = REWARD_LEVELS[currentLevel];
  const nextLevel = getNextLevel(currentLevel);

  if (!nextLevel) {
    return 0; // Already at max level
  }

  const nextConfig = REWARD_LEVELS[nextLevel];
  const needed = nextConfig.minPoints - points;
  return Math.max(0, needed);
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

/**
 * Get points breakdown by activity (mock data for MVP)
 */
export interface PointsBreakdown {
  category: string;
  points: number;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
}

export function getPointsBreakdown(totalPoints: number): PointsBreakdown[] {
  // Mock breakdown - in real app, this would come from backend
  return [
    {
      category: 'Reports Submitted',
      points: Math.floor(totalPoints * 0.4),
      icon: 'document-text',
      color: '#1E90FF',
    },
    {
      category: 'Events Attended',
      points: Math.floor(totalPoints * 0.3),
      icon: 'calendar',
      color: '#32CD32',
    },
    {
      category: 'Waste Detections',
      points: Math.floor(totalPoints * 0.2),
      icon: 'trash',
      color: '#FFCC00',
    },
    {
      category: 'Community Engagement',
      points: Math.floor(totalPoints * 0.1),
      icon: 'people',
      color: '#FF3B30',
    },
  ];
}


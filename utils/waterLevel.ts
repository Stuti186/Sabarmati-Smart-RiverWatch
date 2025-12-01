/**
 * Water Level Utilities
 * Mock data for water level and rainfall
 */

export interface WaterLevelData {
  currentLevel: number; // meters
  capacity: number; // meters
  lastUpdated: string;
}

export interface RainfallData {
  today: number; // mm
  yesterday: number; // mm
  weekTotal: number; // mm
  monthTotal: number; // mm
  lastUpdated: string;
}

/**
 * Generate mock water level data
 */
export function generateWaterLevelData(): WaterLevelData {
  return {
    currentLevel: 2.8, // meters
    capacity: 5.0, // meters
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate mock rainfall data
 */
export function generateRainfallData(): RainfallData {
  return {
    today: 12.5,
    yesterday: 8.3,
    weekTotal: 45.2,
    monthTotal: 156.8,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get water level status
 */
export function getWaterLevelStatus(
  level: number,
  capacity: number
): 'low' | 'normal' | 'high' | 'critical' {
  const percentage = (level / capacity) * 100;

  if (percentage >= 80) return 'critical';
  if (percentage >= 60) return 'high';
  if (percentage >= 20) return 'normal';
  return 'low';
}

/**
 * Get status color
 */
export function getStatusColor(
  status: 'low' | 'normal' | 'high' | 'critical'
): string {
  switch (status) {
    case 'critical':
      return '#FF3B30'; // Alert Red
    case 'high':
      return '#FFCC00'; // Warning Yellow
    case 'normal':
      return '#1E90FF'; // Primary Blue
    case 'low':
      return '#0057A7'; // Deep Blue
  }
}


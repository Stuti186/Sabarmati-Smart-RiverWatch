/**
 * Chart Data Utilities
 * Generate mock historical data for water quality parameters
 */

export type TimePeriod = '24h' | '7d' | '30d';

export interface ChartDataPoint {
  value: number;
  timestamp: Date;
  label: string;
}

/**
 * Generate labels for time period
 */
export function generateLabels(period: TimePeriod): string[] {
  const now = new Date();
  const labels: string[] = [];

  if (period === '24h') {
    // Every 2 hours
    for (let i = 23; i >= 0; i -= 2) {
      const date = new Date(now);
      date.setHours(date.getHours() - i);
      labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
  } else if (period === '7d') {
    // Daily
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
    }
  } else {
    // 30d - Weekly
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 7);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }

  return labels;
}

/**
 * Generate data points for a parameter
 */
export function generateDataPoints(
  period: TimePeriod,
  baseValue: number,
  variance: number = 0.1,
  trend: 'up' | 'down' | 'stable' = 'stable'
): number[] {
  const pointCount = period === '24h' ? 12 : period === '7d' ? 7 : 5;
  const data: number[] = [];
  const trendFactor = trend === 'up' ? 1 : trend === 'down' ? -1 : 0;

  for (let i = 0; i < pointCount; i++) {
    const progress = i / (pointCount - 1);
    const randomVariation = (Math.random() - 0.5) * variance * baseValue;
    const trendVariation = trendFactor * progress * variance * baseValue * 0.5;
    const value = baseValue + randomVariation + trendVariation;
    data.push(Math.max(0, value));
  }

  return data;
}

/**
 * Generate pH data
 */
export function generatepHData(period: TimePeriod): number[] {
  return generateDataPoints(period, 7.2, 0.15, 'stable');
}

/**
 * Generate DO data
 */
export function generateDOData(period: TimePeriod): number[] {
  return generateDataPoints(period, 8.5, 0.2, 'stable');
}

/**
 * Generate BOD data
 */
export function generateBODData(period: TimePeriod): number[] {
  return generateDataPoints(period, 2.1, 0.3, 'stable');
}

/**
 * Generate COD data
 */
export function generateCODData(period: TimePeriod): number[] {
  return generateDataPoints(period, 180, 0.25, 'stable');
}

/**
 * Generate TDS data
 */
export function generateTDSData(period: TimePeriod): number[] {
  return generateDataPoints(period, 320, 0.2, 'stable');
}

/**
 * Generate Turbidity data
 */
export function generateTurbidityData(period: TimePeriod): number[] {
  return generateDataPoints(period, 3.2, 0.3, 'stable');
}

/**
 * Generate Microbial Load data
 */
export function generateMicrobialLoadData(period: TimePeriod): number[] {
  return generateDataPoints(period, 150, 0.4, 'stable');
}


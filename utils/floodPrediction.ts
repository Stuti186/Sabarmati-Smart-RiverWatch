/**
 * Flood Prediction Utilities
 * Generate mock flood prediction data for 48-hour forecast
 */

export interface FloodForecastPoint {
  timestamp: string;
  label: string;
  riskLevel: number; // 0-100
  waterLevel: number; // meters
  rainfall: number; // mm
}

export interface FloodRiskData {
  currentRisk: number; // 0-100
  maxRisk: number; // Maximum risk in next 48 hours
  forecast: FloodForecastPoint[];
  status: 'low' | 'moderate' | 'high';
  lastUpdated: string;
}

/**
 * Get flood risk status from risk level
 */
export function getFloodRiskStatus(riskLevel: number): 'low' | 'moderate' | 'high' {
  if (riskLevel >= 70) return 'high';
  if (riskLevel >= 40) return 'moderate';
  return 'low';
}

/**
 * Get color for flood risk status
 */
export function getFloodRiskColor(status: 'low' | 'moderate' | 'high'): string {
  switch (status) {
    case 'high':
      return '#FF3B30'; // Alert Red
    case 'moderate':
      return '#FFCC00'; // Warning Yellow
    case 'low':
      return '#32CD32'; // Eco Green
  }
}

/**
 * Generate 48-hour flood forecast
 */
export function generateFloodForecast(): FloodRiskData {
  const now = new Date();
  const forecast: FloodForecastPoint[] = [];

  // Generate data points every 4 hours for 48 hours (12 points)
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() + i * 4);

    // Simulate varying risk levels
    const baseRisk = 25 + Math.sin(i * 0.5) * 20;
    const randomVariation = (Math.random() - 0.5) * 15;
    const riskLevel = Math.max(0, Math.min(100, baseRisk + randomVariation));

    // Water level correlates with risk
    const waterLevel = 2.0 + (riskLevel / 100) * 2.5;

    // Rainfall varies
    const rainfall = Math.random() * 20;

    let label: string;
    if (i === 0) {
      label = 'Now';
    } else if (i < 6) {
      label = `+${i * 4}h`;
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    forecast.push({
      timestamp: date.toISOString(),
      label,
      riskLevel: Math.round(riskLevel),
      waterLevel: Math.round(waterLevel * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
    });
  }

  const currentRisk = forecast[0].riskLevel;
  const maxRisk = Math.max(...forecast.map((f) => f.riskLevel));
  const status = getFloodRiskStatus(maxRisk);

  return {
    currentRisk,
    maxRisk,
    forecast,
    status,
    lastUpdated: now.toISOString(),
  };
}

/**
 * Get risk level description
 */
export function getRiskDescription(status: 'low' | 'moderate' | 'high'): string {
  switch (status) {
    case 'high':
      return 'High flood risk detected. Take necessary precautions.';
    case 'moderate':
      return 'Moderate flood risk. Monitor conditions closely.';
    case 'low':
      return 'Low flood risk. Conditions are normal.';
  }
}


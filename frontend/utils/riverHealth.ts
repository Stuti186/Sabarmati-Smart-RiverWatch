/**
 * River Health Calculation Helper
 * Calculates overall river health score from multiple data sources
 */

import { WATER_QUALITY_PARAMS } from '@/constants';
import { colors } from '@/theme';

// Type definitions
export interface WaterQualityData {
  pH?: number;
  DO?: number; // Dissolved Oxygen (mg/L)
  BOD?: number; // Biological Oxygen Demand (mg/L)
  COD?: number; // Chemical Oxygen Demand (mg/L)
  turbidity?: number; // NTU
  temperature?: number; // °C
  TDS?: number; // Total Dissolved Solids (mg/L)
}

export interface WasteData {
  detectionLevel?: number; // Percentage of waste detected (0-100)
  floatingWaste?: number; // Amount of floating waste
  plasticCount?: number; // Number of plastic items detected
}

export interface FloodData {
  riskLevel?: number; // Flood risk percentage (0-100)
  waterLevel?: number; // Current water level (meters)
  rainfall?: number; // Recent rainfall (mm)
}

export interface BiodiversityData {
  speciesCount?: number; // Number of species detected
  diversityIndex?: number; // Biodiversity index (0-1)
  aquaticLife?: number; // Aquatic life presence score (0-100)
}

export interface RiverHealthResult {
  score: number; // Overall health score (0-100)
  color: string; // Color code for UI
  status: string; // Status text (Excellent, Good, Fair, Poor, Critical)
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  breakdown: {
    waterQuality: number;
    waste: number;
    flood: number;
    biodiversity: number;
  };
}

/**
 * Calculate water quality score (0-100)
 */
function calculateWaterQualityScore(data: WaterQualityData): number {
  const params = WATER_QUALITY_PARAMS;
  let score = 0;
  let count = 0;

  // pH Score (0-20 points)
  if (data.pH !== undefined) {
    const pH = data.pH;
    if (pH >= params.pH.min && pH <= params.pH.max) {
      const optimal = (params.pH.min + params.pH.max) / 2;
      const distance = Math.abs(pH - optimal);
      const maxDistance = (params.pH.max - params.pH.min) / 2;
      score += 20 * (1 - distance / maxDistance);
    } else {
      score += 0;
    }
    count++;
  }

  // Dissolved Oxygen Score (0-20 points)
  if (data.DO !== undefined) {
    const DO = data.DO;
    if (DO >= params.DO.min) {
      score += Math.min(20, (DO / params.DO.max) * 20);
    } else {
      score += (DO / params.DO.min) * 10;
    }
    count++;
  }

  // BOD Score (0-15 points) - Lower is better
  if (data.BOD !== undefined) {
    const BOD = data.BOD;
    if (BOD <= params.BOD.max) {
      score += 15 * (1 - BOD / params.BOD.max);
    } else {
      score += 0;
    }
    count++;
  }

  // COD Score (0-15 points) - Lower is better
  if (data.COD !== undefined) {
    const COD = data.COD;
    if (COD <= params.COD.max) {
      score += 15 * (1 - COD / params.COD.max);
    } else {
      score += 0;
    }
    count++;
  }

  // Turbidity Score (0-10 points) - Lower is better
  if (data.turbidity !== undefined) {
    const turbidity = data.turbidity;
    if (turbidity <= params.TURBIDITY.max) {
      score += 10 * (1 - turbidity / params.TURBIDITY.max);
    } else {
      score += 0;
    }
    count++;
  }

  // Temperature Score (0-10 points)
  if (data.temperature !== undefined) {
    const temp = data.temperature;
    if (temp >= params.TEMPERATURE.min && temp <= params.TEMPERATURE.max) {
      const optimal = (params.TEMPERATURE.min + params.TEMPERATURE.max) / 2;
      const distance = Math.abs(temp - optimal);
      const maxDistance = (params.TEMPERATURE.max - params.TEMPERATURE.min) / 2;
      score += 10 * (1 - distance / maxDistance);
    } else {
      score += 0;
    }
    count++;
  }

  // TDS Score (0-10 points) - Lower is better
  if (data.TDS !== undefined) {
    const TDS = data.TDS;
    if (TDS <= params.TDS.max) {
      score += 10 * (1 - TDS / params.TDS.max);
    } else {
      score += 0;
    }
    count++;
  }

  // Return average score if we have data, otherwise return 50 (neutral)
  return count > 0 ? Math.round(score) : 50;
}

/**
 * Calculate waste score (0-100) - Higher waste = Lower score
 */
function calculateWasteScore(data: WasteData): number {
  let score = 100;

  // Waste detection level (0-50 points impact)
  if (data.detectionLevel !== undefined) {
    score -= (data.detectionLevel / 100) * 50;
  }

  // Floating waste impact (0-30 points impact)
  if (data.floatingWaste !== undefined) {
    const normalizedWaste = Math.min(100, (data.floatingWaste / 100) * 100);
    score -= (normalizedWaste / 100) * 30;
  }

  // Plastic count impact (0-20 points impact)
  if (data.plasticCount !== undefined) {
    const normalizedPlastic = Math.min(100, (data.plasticCount / 50) * 100);
    score -= (normalizedPlastic / 100) * 20;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Calculate flood risk score (0-100) - Higher risk = Lower score
 */
function calculateFloodScore(data: FloodData): number {
  let score = 100;

  // Risk level (0-60 points impact)
  if (data.riskLevel !== undefined) {
    score -= (data.riskLevel / 100) * 60;
  }

  // Water level impact (0-25 points impact)
  if (data.waterLevel !== undefined) {
    // Assuming normal level is around 2-3 meters
    const normalLevel = 2.5;
    const deviation = Math.abs(data.waterLevel - normalLevel);
    const impact = Math.min(25, (deviation / 2) * 25);
    score -= impact;
  }

  // Rainfall impact (0-15 points impact)
  if (data.rainfall !== undefined) {
    // Heavy rainfall (>50mm) significantly impacts
    const normalizedRainfall = Math.min(100, (data.rainfall / 50) * 100);
    score -= (normalizedRainfall / 100) * 15;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Calculate biodiversity score (0-100)
 */
function calculateBiodiversityScore(data: BiodiversityData): number {
  let score = 0;
  let count = 0;

  // Species count (0-40 points)
  if (data.speciesCount !== undefined) {
    // More species = better (assuming 20+ species is excellent)
    const normalized = Math.min(100, (data.speciesCount / 20) * 100);
    score += (normalized / 100) * 40;
    count++;
  }

  // Diversity index (0-40 points)
  if (data.diversityIndex !== undefined) {
    // Diversity index is typically 0-1, where 1 is maximum diversity
    score += data.diversityIndex * 40;
    count++;
  }

  // Aquatic life presence (0-20 points)
  if (data.aquaticLife !== undefined) {
    score += (data.aquaticLife / 100) * 20;
    count++;
  }

  // Return average if we have data, otherwise return 50 (neutral)
  return count > 0 ? Math.round(score) : 50;
}

/**
 * Get status information based on score
 */
function getStatusInfo(score: number): {
  status: string;
  color: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
} {
  if (score >= 80) {
    return {
      status: 'Excellent',
      color: colors.ecoGreen[500],
      rating: 'excellent',
    };
  } else if (score >= 60) {
    return {
      status: 'Good',
      color: colors.primary[500],
      rating: 'good',
    };
  } else if (score >= 40) {
    return {
      status: 'Fair',
      color: colors.warning[500],
      rating: 'fair',
    };
  } else if (score >= 20) {
    return {
      status: 'Poor',
      color: colors.alert[500],
      rating: 'poor',
    };
  } else {
    return {
      status: 'Critical',
      color: colors.alert[700],
      rating: 'critical',
    };
  }
}

/**
 * Calculate overall river health score
 * 
 * @param waterData - Water quality parameters
 * @param wasteData - Waste detection data
 * @param floodData - Flood risk data
 * @param biodiversityData - Biodiversity data
 * @returns RiverHealthResult with score, color, status, and breakdown
 */
export function calculateRiverHealth(
  waterData: WaterQualityData,
  wasteData: WasteData,
  floodData: FloodData,
  biodiversityData: BiodiversityData
): RiverHealthResult {
  // Calculate individual scores
  const waterQualityScore = calculateWaterQualityScore(waterData);
  const wasteScore = calculateWasteScore(wasteData);
  const floodScore = calculateFloodScore(floodData);
  const biodiversityScore = calculateBiodiversityScore(biodiversityData);

  // Weighted average (water quality is most important)
  const weights = {
    waterQuality: 0.40, // 40% weight
    waste: 0.25, // 25% weight
    flood: 0.20, // 20% weight
    biodiversity: 0.15, // 15% weight
  };

  const overallScore = Math.round(
    waterQualityScore * weights.waterQuality +
      wasteScore * weights.waste +
      floodScore * weights.flood +
      biodiversityScore * weights.biodiversity
  );

  const statusInfo = getStatusInfo(overallScore);

  return {
    score: Math.max(0, Math.min(100, overallScore)), // Clamp between 0-100
    color: statusInfo.color,
    status: statusInfo.status,
    rating: statusInfo.rating,
    breakdown: {
      waterQuality: waterQualityScore,
      waste: wasteScore,
      flood: floodScore,
      biodiversity: biodiversityScore,
    },
  };
}

/**
 * Helper to get status color for a given score
 */
export function getHealthStatusColor(score: number): string {
  return getStatusInfo(score).color;
}

/**
 * Helper to get status text for a given score
 */
export function getHealthStatusText(score: number): string {
  return getStatusInfo(score).status;
}

/**
 * Helper to get status rating for a given score
 */
export function getHealthStatusRating(
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  return getStatusInfo(score).rating;
}


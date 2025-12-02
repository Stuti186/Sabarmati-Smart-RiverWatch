/**
 * Water Quality Utilities
 * Helper functions for water quality parameter evaluation
 */

import { WATER_QUALITY_PARAMS } from '@/constants';
import { StatusType } from '@/components/ui/StatCard';

export interface WaterQualityReading {
  pH?: number;
  DO?: number;
  BOD?: number;
  COD?: number;
  TDS?: number;
  turbidity?: number;
  temperature?: number;
  microbialLoad?: number; // CFU/mL (Colony Forming Units per milliliter)
  timestamp?: string;
}

/**
 * Get status for pH value
 */
export function getpHStatus(pH: number): StatusType {
  const { min, max } = WATER_QUALITY_PARAMS.pH;
  const optimalMin = 7.0;
  const optimalMax = 7.5;

  if (pH >= optimalMin && pH <= optimalMax) return 'good';
  if (pH >= min && pH <= max) return 'moderate';
  return 'bad';
}

/**
 * Get status for Dissolved Oxygen (DO)
 */
export function getDOStatus(DO: number): StatusType {
  const { min, max } = WATER_QUALITY_PARAMS.DO;
  const goodMin = 8;

  if (DO >= goodMin) return 'good';
  if (DO >= min) return 'moderate';
  return 'bad';
}

/**
 * Get status for BOD (Biological Oxygen Demand) - Lower is better
 */
export function getBODStatus(BOD: number): StatusType {
  const { max } = WATER_QUALITY_PARAMS.BOD;
  const goodMax = 2;

  if (BOD <= goodMax) return 'good';
  if (BOD <= max) return 'moderate';
  return 'bad';
}

/**
 * Get status for COD (Chemical Oxygen Demand) - Lower is better
 */
export function getCODStatus(COD: number): StatusType {
  const { max } = WATER_QUALITY_PARAMS.COD;
  const goodMax = 150;

  if (COD <= goodMax) return 'good';
  if (COD <= max) return 'moderate';
  return 'bad';
}

/**
 * Get status for TDS (Total Dissolved Solids) - Lower is better
 */
export function getTDSStatus(TDS: number): StatusType {
  const { max } = WATER_QUALITY_PARAMS.TDS;
  const goodMax = 300;

  if (TDS <= goodMax) return 'good';
  if (TDS <= max) return 'moderate';
  return 'bad';
}

/**
 * Get status for Turbidity - Lower is better
 */
export function getTurbidityStatus(turbidity: number): StatusType {
  const { max } = WATER_QUALITY_PARAMS.TURBIDITY;
  const goodMax = 2;

  if (turbidity <= goodMax) return 'good';
  if (turbidity <= max) return 'moderate';
  return 'bad';
}

/**
 * Get status for Temperature
 */
export function getTemperatureStatus(temperature: number): StatusType {
  const { min, max } = WATER_QUALITY_PARAMS.TEMPERATURE;
  const optimalMin = 20;
  const optimalMax = 28;

  if (temperature >= optimalMin && temperature <= optimalMax) return 'good';
  if (temperature >= min && temperature <= max) return 'moderate';
  return 'bad';
}

/**
 * Get status for Microbial Load (CFU/mL)
 * Good: < 100 CFU/mL
 * Moderate: 100-500 CFU/mL
 * Bad: > 500 CFU/mL
 */
export function getMicrobialLoadStatus(microbialLoad: number): StatusType {
  if (microbialLoad < 100) return 'good';
  if (microbialLoad <= 500) return 'moderate';
  return 'bad';
}

/**
 * Get status for any water quality parameter
 */
export function getParameterStatus(
  parameter: keyof WaterQualityReading,
  value: number
): StatusType {
  switch (parameter) {
    case 'pH':
      return getpHStatus(value);
    case 'DO':
      return getDOStatus(value);
    case 'BOD':
      return getBODStatus(value);
    case 'COD':
      return getCODStatus(value);
    case 'TDS':
      return getTDSStatus(value);
    case 'turbidity':
      return getTurbidityStatus(value);
    case 'temperature':
      return getTemperatureStatus(value);
    case 'microbialLoad':
      return getMicrobialLoadStatus(value);
    default:
      return 'moderate';
  }
}

/**
 * Format value with appropriate precision
 */
export function formatValue(value: number, parameter: string): string {
  if (parameter === 'pH' || parameter === 'turbidity') {
    return value.toFixed(1);
  }
  if (parameter === 'temperature') {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
}


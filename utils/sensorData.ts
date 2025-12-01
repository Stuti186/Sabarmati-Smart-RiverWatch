/**
 * Sensor Data Utilities
 * Mock sensor locations and data for map visualization
 */

import { MAP_CONFIG } from '@/constants';
import { calculateRiverHealth } from './riverHealth';
import { getpHStatus, getDOStatus, getBODStatus, getCODStatus, getTDSStatus, getTurbidityStatus } from './waterQuality';

export interface SensorLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'water_quality' | 'waste' | 'flood' | 'biodiversity';
}

export interface SensorData {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  waterQuality: {
    pH: number;
    DO: number;
    BOD: number;
    COD: number;
    TDS: number;
    turbidity: number;
    temperature: number;
  };
  waste: {
    detectionLevel: number;
  };
  flood: {
    riskLevel: number;
  };
  biodiversity: {
    speciesCount: number;
    diversityIndex: number;
  };
  lastUpdated: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

/**
 * Get status from overall health score
 */
function getStatusFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'poor';
  return 'critical';
}

/**
 * Generate mock sensor data
 */
export function generateSensorData(): SensorData[] {
  const baseLat = MAP_CONFIG.DEFAULT_LATITUDE;
  const baseLng = MAP_CONFIG.DEFAULT_LONGITUDE;

  // Generate sensors along the riverfront
  const sensors: SensorData[] = [
    {
      id: 'sensor-001',
      name: 'Sabarmati North',
      location: {
        latitude: baseLat + 0.01,
        longitude: baseLng - 0.01,
      },
      waterQuality: {
        pH: 7.2,
        DO: 8.5,
        BOD: 2.1,
        COD: 180,
        TDS: 320,
        turbidity: 3.2,
        temperature: 24,
      },
      waste: { detectionLevel: 12 },
      flood: { riskLevel: 15 },
      biodiversity: { speciesCount: 18, diversityIndex: 0.75 },
      lastUpdated: new Date().toISOString(),
      status: 'good',
    },
    {
      id: 'sensor-002',
      name: 'River Center',
      location: {
        latitude: baseLat,
        longitude: baseLng,
      },
      waterQuality: {
        pH: 7.5,
        DO: 9.2,
        BOD: 1.8,
        COD: 150,
        TDS: 280,
        turbidity: 2.5,
        temperature: 23,
      },
      waste: { detectionLevel: 8 },
      flood: { riskLevel: 12 },
      biodiversity: { speciesCount: 22, diversityIndex: 0.82 },
      lastUpdated: new Date().toISOString(),
      status: 'excellent',
    },
    {
      id: 'sensor-003',
      name: 'Sabarmati South',
      location: {
        latitude: baseLat - 0.008,
        longitude: baseLng + 0.012,
      },
      waterQuality: {
        pH: 6.9,
        DO: 6.8,
        BOD: 2.8,
        COD: 220,
        TDS: 420,
        turbidity: 4.5,
        temperature: 26,
      },
      waste: { detectionLevel: 25 },
      flood: { riskLevel: 22 },
      biodiversity: { speciesCount: 12, diversityIndex: 0.58 },
      lastUpdated: new Date().toISOString(),
      status: 'fair',
    },
    {
      id: 'sensor-004',
      name: 'East Bank',
      location: {
        latitude: baseLat + 0.005,
        longitude: baseLng + 0.008,
      },
      waterQuality: {
        pH: 7.8,
        DO: 7.5,
        BOD: 2.5,
        COD: 200,
        TDS: 380,
        turbidity: 3.8,
        temperature: 25,
      },
      waste: { detectionLevel: 18 },
      flood: { riskLevel: 18 },
      biodiversity: { speciesCount: 15, diversityIndex: 0.65 },
      lastUpdated: new Date().toISOString(),
      status: 'good',
    },
    {
      id: 'sensor-005',
      name: 'West Bank',
      location: {
        latitude: baseLat - 0.006,
        longitude: baseLng - 0.009,
      },
      waterQuality: {
        pH: 6.7,
        DO: 5.5,
        BOD: 3.2,
        COD: 280,
        TDS: 520,
        turbidity: 5.2,
        temperature: 28,
      },
      waste: { detectionLevel: 35 },
      flood: { riskLevel: 28 },
      biodiversity: { speciesCount: 8, diversityIndex: 0.42 },
      lastUpdated: new Date().toISOString(),
      status: 'poor',
    },
  ];

  // Calculate status for each sensor
  return sensors.map((sensor) => {
    const health = calculateRiverHealth(
      sensor.waterQuality,
      sensor.waste,
      sensor.flood,
      sensor.biodiversity
    );
    return {
      ...sensor,
      status: getStatusFromScore(health.score),
    };
  });
}

/**
 * Get pin status color
 */
export function getPinStatus(status: SensorData['status']): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  return status;
}


/**
 * Fake Data Engine
 * Simulates real-time data updates for water sensors, waste, flood, biodiversity, safety alerts, and citizen reports
 */

import { generateSensorData, type SensorData } from '@/utils/sensorData';
import { generateWasteDetections, type WasteDetection } from '@/utils/wasteData';
import { generateFloodForecast, type FloodRiskData } from '@/utils/floodPrediction';
import { generateSafetyAlerts, type SafetyAlert } from '@/utils/safetyAlerts';
import { generateFloodAlerts, type FloodAlert } from '@/utils/floodAlerts';
import { generateUnsafeZones, type UnsafeZone } from '@/utils/unsafeZones';
import { generateWaterLevelData, type WaterLevelData } from '@/utils/waterLevel';
import { MAP_CONFIG } from '@/constants';

// Biodiversity data interface
export interface BiodiversityData {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  speciesCount: number;
  diversityIndex: number; // 0-1
  dominantSpecies: string[];
  lastUpdated: string;
}

// Citizen report interface (mock)
export interface MockCitizenReport {
  id: string;
  userId: string;
  userEmail: string;
  issueType: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

/**
 * Add random variation to a number (for simulating real-time changes)
 */
function addVariation(value: number, maxVariation: number): number {
  const variation = (Math.random() - 0.5) * 2 * maxVariation;
  return Math.max(0, value + variation);
}

/**
 * Generate biodiversity data
 */
function generateBiodiversityData(): BiodiversityData[] {
  const baseLat = MAP_CONFIG.DEFAULT_LATITUDE;
  const baseLng = MAP_CONFIG.DEFAULT_LONGITUDE;
  const now = new Date();

  const species = [
    ['Fish', 'Turtles', 'Birds'],
    ['Fish', 'Frogs', 'Insects'],
    ['Birds', 'Fish', 'Plants'],
    ['Turtles', 'Fish', 'Birds'],
    ['Insects', 'Fish', 'Plants'],
  ];

  return [
    {
      id: 'bio-001',
      location: {
        latitude: baseLat + 0.01,
        longitude: baseLng - 0.01,
      },
      speciesCount: Math.floor(15 + Math.random() * 10),
      diversityIndex: 0.6 + Math.random() * 0.3,
      dominantSpecies: species[0],
      lastUpdated: now.toISOString(),
    },
    {
      id: 'bio-002',
      location: {
        latitude: baseLat,
        longitude: baseLng,
      },
      speciesCount: Math.floor(20 + Math.random() * 15),
      diversityIndex: 0.7 + Math.random() * 0.2,
      dominantSpecies: species[1],
      lastUpdated: now.toISOString(),
    },
    {
      id: 'bio-003',
      location: {
        latitude: baseLat - 0.01,
        longitude: baseLng + 0.01,
      },
      speciesCount: Math.floor(12 + Math.random() * 8),
      diversityIndex: 0.5 + Math.random() * 0.3,
      dominantSpecies: species[2],
      lastUpdated: now.toISOString(),
    },
  ];
}

/**
 * Generate mock citizen reports
 */
function generateMockCitizenReports(): MockCitizenReport[] {
  const baseLat = MAP_CONFIG.DEFAULT_LATITUDE;
  const baseLng = MAP_CONFIG.DEFAULT_LONGITUDE;
  const now = new Date();

  const issueTypes = ['waste', 'pollution', 'safety', 'vandalism', 'other'];
  const statuses: Array<'pending' | 'reviewed' | 'resolved'> = [
    'pending',
    'reviewed',
    'resolved',
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `report-${String(i + 1).padStart(3, '0')}`,
    userId: `user-${Math.floor(Math.random() * 100)}`,
    userEmail: `user${i + 1}@example.com`,
    issueType: issueTypes[Math.floor(Math.random() * issueTypes.length)],
    description: `Report ${i + 1}: Issue reported by citizen`,
    location: {
      latitude: baseLat + (Math.random() - 0.5) * 0.02,
      longitude: baseLng + (Math.random() - 0.5) * 0.02,
    },
    timestamp: new Date(
      now.getTime() - Math.random() * 7 * 24 * 3600000
    ).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}

/**
 * Update sensor data with slight variations
 */
export function updateSensorData(previousData: SensorData[]): SensorData[] {
  return previousData.map((sensor) => ({
    ...sensor,
    waterQuality: {
      pH: Math.max(6.0, Math.min(8.5, addVariation(sensor.waterQuality.pH, 0.1))),
      DO: Math.max(3.0, Math.min(15.0, addVariation(sensor.waterQuality.DO, 0.3))),
      BOD: Math.max(0.5, Math.min(5.0, addVariation(sensor.waterQuality.BOD, 0.2))),
      COD: Math.max(50, Math.min(300, addVariation(sensor.waterQuality.COD, 10))),
      TDS: Math.max(100, Math.min(600, addVariation(sensor.waterQuality.TDS, 20))),
      turbidity: Math.max(1.0, Math.min(10.0, addVariation(sensor.waterQuality.turbidity, 0.3))),
      temperature: Math.max(15, Math.min(35, addVariation(sensor.waterQuality.temperature, 1))),
    },
    waste: {
      detectionLevel: Math.max(0, Math.min(100, addVariation(sensor.waste.detectionLevel, 2))),
    },
    flood: {
      riskLevel: Math.max(0, Math.min(100, addVariation(sensor.flood.riskLevel, 3))),
    },
    biodiversity: {
      speciesCount: Math.max(5, Math.min(30, Math.round(addVariation(sensor.biodiversity.speciesCount, 2)))),
      diversityIndex: Math.max(0.3, Math.min(1.0, addVariation(sensor.biodiversity.diversityIndex, 0.05))),
    },
    lastUpdated: new Date().toISOString(),
    status: sensor.status, // Status calculation would be done elsewhere
  }));
}

/**
 * Update waste detections (add new ones occasionally, update existing)
 */
export function updateWasteDetections(
  previousData: WasteDetection[]
): WasteDetection[] {
  const now = new Date();
  const updated = previousData.map((detection) => ({
    ...detection,
    confidence: detection.confidence
      ? Math.max(70, Math.min(100, addVariation(detection.confidence, 2)))
      : undefined,
  }));

  // Occasionally add a new detection (10% chance)
  if (Math.random() < 0.1) {
    const wasteTypes = [
      'Plastic Bottles',
      'Paper Waste',
      'Metal Cans',
      'Glass Bottles',
      'Plastic Bags',
      'Mixed Waste',
    ];
    const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const locations = [
      'Sabarmati North Bank',
      'River Center',
      'East Bank',
      'West Bank',
      'Sabarmati South',
    ];

    updated.unshift({
      id: `waste-${Date.now()}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
      timestamp: now.toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      confidence: 75 + Math.random() * 20,
    });
  }

  // Keep only last 20 detections
  return updated.slice(0, 20);
}

/**
 * Update flood forecast data
 */
export function updateFloodData(previousData: FloodRiskData): FloodRiskData {
  const updated = generateFloodForecast();
  // Add slight variation to current risk
  updated.currentRisk = Math.max(
    0,
    Math.min(100, addVariation(previousData.currentRisk, 5))
  );
  return updated;
}

/**
 * Update biodiversity data
 */
export function updateBiodiversityData(
  previousData: BiodiversityData[]
): BiodiversityData[] {
  return previousData.map((bio) => ({
    ...bio,
    speciesCount: Math.max(
      5,
      Math.min(30, Math.round(addVariation(bio.speciesCount, 1)))
    ),
    diversityIndex: Math.max(
      0.3,
      Math.min(1.0, addVariation(bio.diversityIndex, 0.03))
    ),
    lastUpdated: new Date().toISOString(),
  }));
}

/**
 * Update safety alerts (occasionally add new ones)
 */
export function updateSafetyAlerts(
  previousData: SafetyAlert[]
): SafetyAlert[] {
  const now = new Date();
  let updated = [...previousData];

  // Occasionally add a new alert (5% chance)
  if (Math.random() < 0.05) {
    const categories = [
      'Water Quality',
      'Infrastructure',
      'Public Safety',
      'Pollution',
      'Maintenance',
    ];
    const severities: Array<'critical' | 'high' | 'moderate' | 'low'> = [
      'critical',
      'high',
      'moderate',
      'low',
    ];
    const locations = [
      'Sabarmati North Bank',
      'River Center',
      'East Bank',
      'West Bank',
      'Sabarmati South',
    ];

    const newAlert: SafetyAlert = {
      id: `safety-${Date.now()}`,
      title: 'New Safety Alert',
      description: 'A new safety concern has been detected in the area.',
      severity: severities[Math.floor(Math.random() * severities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp: now.toISOString(),
    };

    updated.unshift(newAlert);
  }

  // Keep only last 15 alerts
  return updated.slice(0, 15);
}

/**
 * Update flood alerts
 */
export function updateFloodAlerts(previousData: FloodAlert[]): FloodAlert[] {
  const now = new Date();
  let updated = previousData.map((alert) => ({
    ...alert,
    riskLevel: Math.max(0, Math.min(100, addVariation(alert.riskLevel, 3))),
  }));

  // Occasionally add a new alert (8% chance)
  if (Math.random() < 0.08) {
    const locations = [
      'Sabarmati North Bank',
      'River Center',
      'Sabarmati South Bank',
      'East Bank Area',
      'West Bank Area',
    ];
    const severities: Array<'high' | 'moderate'> = ['high', 'moderate'];

    updated.unshift({
      id: `alert-${Date.now()}`,
      title: `Flood Risk - ${locations[Math.floor(Math.random() * locations.length)]}`,
      description: 'Water level rising. Monitor conditions closely.',
      severity: severities[Math.floor(Math.random() * severities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      riskLevel: 40 + Math.random() * 50,
      timestamp: now.toISOString(),
      waterLevel: 2.5 + Math.random() * 2.5,
      rainfall: 15 + Math.random() * 40,
    });
  }

  // Keep only last 10 alerts
  return updated.slice(0, 10);
}

/**
 * Update citizen reports (occasionally add new ones, update status)
 */
export function updateCitizenReports(
  previousData: MockCitizenReport[]
): MockCitizenReport[] {
  const now = new Date();
  let updated = previousData.map((report) => {
    // Occasionally update status (5% chance)
    if (Math.random() < 0.05 && report.status === 'pending') {
      return {
        ...report,
        status: Math.random() < 0.5 ? 'reviewed' : 'resolved',
      };
    }
    return report;
  });

  // Occasionally add a new report (3% chance)
  if (Math.random() < 0.03) {
    const baseLat = MAP_CONFIG.DEFAULT_LATITUDE;
    const baseLng = MAP_CONFIG.DEFAULT_LONGITUDE;
    const issueTypes = ['waste', 'pollution', 'safety', 'vandalism', 'other'];

    updated.unshift({
      id: `report-${Date.now()}`,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      userEmail: `user${Math.floor(Math.random() * 1000)}@example.com`,
      issueType: issueTypes[Math.floor(Math.random() * issueTypes.length)],
      description: 'New citizen report submitted',
      location: {
        latitude: baseLat + (Math.random() - 0.5) * 0.02,
        longitude: baseLng + (Math.random() - 0.5) * 0.02,
      },
      timestamp: now.toISOString(),
      status: 'pending',
    });
  }

  // Keep only last 20 reports
  return updated.slice(0, 20);
}

/**
 * Generate all initial fake data
 */
export function generateAllFakeData() {
  return {
    sensors: generateSensorData(),
    wasteDetections: generateWasteDetections(),
    floodData: generateFloodForecast(),
    floodAlerts: generateFloodAlerts(),
    biodiversity: generateBiodiversityData(),
    safetyAlerts: generateSafetyAlerts(),
    unsafeZones: generateUnsafeZones(),
    waterLevel: generateWaterLevelData(),
    citizenReports: generateMockCitizenReports(),
  };
}

/**
 * Update all fake data with variations
 */
export function updateAllFakeData(previousData: {
  sensors: SensorData[];
  wasteDetections: WasteDetection[];
  floodData: FloodRiskData;
  floodAlerts: FloodAlert[];
  biodiversity: BiodiversityData[];
  safetyAlerts: SafetyAlert[];
  unsafeZones: UnsafeZone[];
  waterLevel: WaterLevelData;
  citizenReports: MockCitizenReport[];
}) {
  return {
    sensors: updateSensorData(previousData.sensors),
    wasteDetections: updateWasteDetections(previousData.wasteDetections),
    floodData: updateFloodData(previousData.floodData),
    floodAlerts: updateFloodAlerts(previousData.floodAlerts),
    biodiversity: updateBiodiversityData(previousData.biodiversity),
    safetyAlerts: updateSafetyAlerts(previousData.safetyAlerts),
    unsafeZones: previousData.unsafeZones, // Unsafe zones change less frequently
    waterLevel: {
      ...previousData.waterLevel,
      level: Math.max(
        0,
        Math.min(
          previousData.waterLevel.capacity,
          addVariation(previousData.waterLevel.level, 0.1)
        )
      ),
      lastUpdated: new Date().toISOString(),
    },
    citizenReports: updateCitizenReports(previousData.citizenReports),
  };
}


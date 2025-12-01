/**
 * Waste Hotspot Utilities
 * Generate mock waste hotspot data for heatmap
 */

import { MAP_CONFIG } from '@/constants';

export interface WasteHotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  density: number; // 0-100, waste density score
  detectionCount: number; // Number of detections in this area
  wasteTypes: {
    plastic: number;
    paper: number;
    metal: number;
    glass: number;
    organic: number;
    other: number;
  };
  lastUpdated: string;
  radius?: number; // Radius in meters for heatmap circle
}

/**
 * Get density level from density score
 */
export function getDensityLevel(density: number): 'low' | 'medium' | 'high' | 'critical' {
  if (density >= 75) return 'critical';
  if (density >= 50) return 'high';
  if (density >= 25) return 'medium';
  return 'low';
}

/**
 * Get color for density level
 */
export function getDensityColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'critical':
      return '#8B0000'; // Dark Red
    case 'high':
      return '#FF3B30'; // Alert Red
    case 'medium':
      return '#FFCC00'; // Warning Yellow
    case 'low':
      return '#32CD32'; // Eco Green
  }
}

/**
 * Generate mock waste hotspots
 */
export function generateWasteHotspots(): WasteHotspot[] {
  const baseLat = MAP_CONFIG.DEFAULT_LATITUDE;
  const baseLng = MAP_CONFIG.DEFAULT_LONGITUDE;

  const hotspots: WasteHotspot[] = [
    {
      id: 'hotspot-001',
      name: 'North Bank Zone',
      latitude: baseLat + 0.012,
      longitude: baseLng - 0.008,
      density: 85,
      detectionCount: 42,
      wasteTypes: {
        plastic: 25,
        paper: 8,
        metal: 5,
        glass: 2,
        organic: 1,
        other: 1,
      },
      lastUpdated: new Date().toISOString(),
      radius: 500,
    },
    {
      id: 'hotspot-002',
      name: 'River Center',
      latitude: baseLat,
      longitude: baseLng,
      density: 45,
      detectionCount: 18,
      wasteTypes: {
        plastic: 10,
        paper: 4,
        metal: 2,
        glass: 1,
        organic: 1,
        other: 0,
      },
      lastUpdated: new Date().toISOString(),
      radius: 400,
    },
    {
      id: 'hotspot-003',
      name: 'South Bank Zone',
      latitude: baseLat - 0.01,
      longitude: baseLng + 0.015,
      density: 92,
      detectionCount: 58,
      wasteTypes: {
        plastic: 35,
        paper: 10,
        metal: 7,
        glass: 4,
        organic: 1,
        other: 1,
      },
      lastUpdated: new Date().toISOString(),
      radius: 600,
    },
    {
      id: 'hotspot-004',
      name: 'East Bank Area',
      latitude: baseLat + 0.006,
      longitude: baseLng + 0.01,
      density: 35,
      detectionCount: 12,
      wasteTypes: {
        plastic: 6,
        paper: 3,
        metal: 2,
        glass: 1,
        organic: 0,
        other: 0,
      },
      lastUpdated: new Date().toISOString(),
      radius: 300,
    },
    {
      id: 'hotspot-005',
      name: 'West Bank Area',
      latitude: baseLat - 0.008,
      longitude: baseLng - 0.012,
      density: 68,
      detectionCount: 28,
      wasteTypes: {
        plastic: 18,
        paper: 5,
        metal: 3,
        glass: 1,
        organic: 1,
        other: 0,
      },
      lastUpdated: new Date().toISOString(),
      radius: 450,
    },
    {
      id: 'hotspot-006',
      name: 'Confluence Point',
      latitude: baseLat - 0.005,
      longitude: baseLng - 0.005,
      density: 55,
      detectionCount: 22,
      wasteTypes: {
        plastic: 12,
        paper: 5,
        metal: 3,
        glass: 1,
        organic: 1,
        other: 0,
      },
      lastUpdated: new Date().toISOString(),
      radius: 350,
    },
  ];

  return hotspots;
}


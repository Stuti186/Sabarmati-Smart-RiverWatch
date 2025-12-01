/**
 * Unsafe Zones Utilities
 * Generate mock unsafe zone data for map
 */

import { MAP_CONFIG } from '@/constants';

export interface UnsafeZone {
  id: string;
  name: string;
  description: string;
  dangerType: string; // e.g., 'Water Quality', 'Infrastructure', 'Pollution'
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number; // meters
  severity: 'critical' | 'high' | 'moderate';
  timestamp: string;
  actionRequired?: string;
  reportedBy?: string;
}

/**
 * Get danger icon based on type
 */
export function getDangerIcon(
  dangerType: string
): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  const typeLower = dangerType.toLowerCase();
  if (typeLower.includes('water')) return 'water';
  if (typeLower.includes('infrastructure')) return 'construct';
  if (typeLower.includes('pollution')) return 'warning';
  if (typeLower.includes('safety')) return 'shield';
  return 'alert-circle';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: UnsafeZone['severity']): string {
  switch (severity) {
    case 'critical':
      return '#8B0000'; // Dark Red
    case 'high':
      return '#FF3B30'; // Alert Red
    case 'moderate':
      return '#FFCC00'; // Warning Yellow
  }
}

/**
 * Generate mock unsafe zones
 */
export function generateUnsafeZones(): UnsafeZone[] {
  const baseLat = MAP_CONFIG.DEFAULT_LATITUDE;
  const baseLng = MAP_CONFIG.DEFAULT_LONGITUDE;

  const zones: UnsafeZone[] = [
    {
      id: 'zone-001',
      name: 'Contaminated Water Area',
      description:
        'High levels of E. coli and heavy metals detected. Water is unsafe for any contact. Avoid swimming, fishing, or any recreational activities in this area.',
      dangerType: 'Water Quality',
      location: {
        latitude: baseLat + 0.012,
        longitude: baseLng - 0.008,
      },
      radius: 300,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      actionRequired:
        'Immediate action required. Area has been cordoned off. Water treatment in progress.',
      reportedBy: 'Water Quality Sensor #12',
    },
    {
      id: 'zone-002',
      name: 'Damaged Infrastructure',
      description:
        'Severe structural damage to walkway and railing. Risk of collapse. Multiple sections are unstable and pose significant safety hazard.',
      dangerType: 'Infrastructure',
      location: {
        latitude: baseLat,
        longitude: baseLng,
      },
      radius: 200,
      severity: 'high',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      actionRequired:
        'Area closed for repairs. Use alternative routes. Emergency repairs scheduled.',
      reportedBy: 'Infrastructure Inspection Team',
    },
    {
      id: 'zone-003',
      name: 'Chemical Spill Zone',
      description:
        'Suspected chemical discharge into river. Unusual discoloration and strong odor detected. Environmental contamination confirmed.',
      dangerType: 'Pollution',
      location: {
        latitude: baseLat - 0.01,
        longitude: baseLng + 0.015,
      },
      radius: 400,
      severity: 'critical',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      actionRequired:
        'Evacuate area immediately. Environmental cleanup in progress. Avoid all contact with water.',
      reportedBy: 'Environmental Monitoring',
    },
    {
      id: 'zone-004',
      name: 'Slippery Surface Hazard',
      description:
        'Extremely slippery conditions due to algae growth and wet surfaces. Multiple slip incidents reported.',
      dangerType: 'Safety',
      location: {
        latitude: baseLat + 0.006,
        longitude: baseLng + 0.01,
      },
      radius: 150,
      severity: 'moderate',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      actionRequired: 'Exercise extreme caution. Non-slip mats installed. Cleaning scheduled.',
      reportedBy: 'Safety Patrol',
    },
    {
      id: 'zone-005',
      name: 'High Bacterial Count',
      description:
        'Dangerously high bacterial levels. Water quality below safe standards for any recreational use.',
      dangerType: 'Water Quality',
      location: {
        latitude: baseLat - 0.008,
        longitude: baseLng - 0.012,
      },
      radius: 250,
      severity: 'high',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      actionRequired:
        'Swimming area closed. Water treatment required. Will reopen when safe.',
      reportedBy: 'Health Department',
    },
  ];

  // Sort by severity (critical first, then high, then moderate)
  const severityOrder: Record<UnsafeZone['severity'], number> = {
    critical: 0,
    high: 1,
    moderate: 2,
  };

  return zones.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}


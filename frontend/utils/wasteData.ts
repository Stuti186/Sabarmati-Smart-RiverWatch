/**
 * Waste Data Utilities
 * Mock waste detection data for feed
 */

export type WasteSeverity = 'low' | 'medium' | 'high';

export interface WasteDetection {
  id: string;
  imageUrl?: string;
  severity: WasteSeverity;
  wasteType: string;
  timestamp: string;
  location?: string;
  confidence?: number; // AI confidence score (0-100)
}

/**
 * Generate mock waste detections
 */
export function generateWasteDetections(): WasteDetection[] {
  const now = new Date();
  const detections: WasteDetection[] = [
    {
      id: 'waste-001',
      severity: 'high',
      wasteType: 'Plastic Bottles',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 mins ago
      location: 'Sabarmati North Bank',
      confidence: 92,
    },
    {
      id: 'waste-002',
      severity: 'medium',
      wasteType: 'Paper Waste',
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), // 45 mins ago
      location: 'River Center',
      confidence: 85,
    },
    {
      id: 'waste-003',
      severity: 'low',
      wasteType: 'Organic Matter',
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
      location: 'East Bank',
      confidence: 78,
    },
    {
      id: 'waste-004',
      severity: 'high',
      wasteType: 'Plastic Bags',
      timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), // 3 hours ago
      location: 'Sabarmati South',
      confidence: 95,
    },
    {
      id: 'waste-005',
      severity: 'medium',
      wasteType: 'Metal Cans',
      timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
      location: 'West Bank',
      confidence: 88,
    },
    {
      id: 'waste-006',
      severity: 'low',
      wasteType: 'Glass Bottles',
      timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), // 8 hours ago
      location: 'River Center',
      confidence: 82,
    },
    {
      id: 'waste-007',
      severity: 'high',
      wasteType: 'Mixed Waste',
      timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), // 12 hours ago
      location: 'Sabarmati North',
      confidence: 90,
    },
    {
      id: 'waste-008',
      severity: 'medium',
      wasteType: 'Styrofoam',
      timestamp: new Date(now.getTime() - 18 * 3600000).toISOString(), // 18 hours ago
      location: 'East Bank',
      confidence: 87,
    },
    {
      id: 'waste-009',
      severity: 'low',
      wasteType: 'Cardboard',
      timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), // 1 day ago
      location: 'West Bank',
      confidence: 75,
    },
    {
      id: 'waste-010',
      severity: 'high',
      wasteType: 'Plastic Containers',
      timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(), // 1.5 days ago
      location: 'Sabarmati South',
      confidence: 93,
    },
  ];

  return detections;
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: WasteSeverity): string {
  switch (severity) {
    case 'low':
      return '#32CD32'; // Eco Green
    case 'medium':
      return '#FFCC00'; // Warning Yellow
    case 'high':
      return '#FF3B30'; // Alert Red
    default:
      return '#1E90FF'; // Primary Blue
  }
}


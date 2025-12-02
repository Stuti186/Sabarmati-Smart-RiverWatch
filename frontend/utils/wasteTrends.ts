/**
 * Waste Trends Utilities
 * Generate mock data for waste trend charts
 */

export interface DailyDetection {
  date: string;
  label: string;
  count: number;
}

export interface WasteCategory {
  name: string;
  count: number;
  color: string;
}

/**
 * Generate daily detection data for the last 7 days
 */
export function generateDailyDetections(): DailyDetection[] {
  const detections: DailyDetection[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    // Generate random count between 5 and 25
    const count = Math.floor(Math.random() * 20) + 5;

    detections.push({
      date: date.toISOString(),
      label,
      count,
    });
  }

  return detections;
}

/**
 * Generate waste category distribution
 */
export function generateWasteCategories(): WasteCategory[] {
  return [
    {
      name: 'Plastic',
      count: 45,
      color: '#1E90FF', // Primary Blue
    },
    {
      name: 'Paper',
      count: 20,
      color: '#32CD32', // Eco Green
    },
    {
      name: 'Metal',
      count: 15,
      color: '#FFCC00', // Warning Yellow
    },
    {
      name: 'Glass',
      count: 10,
      color: '#0057A7', // Deep Blue
    },
    {
      name: 'Organic',
      count: 8,
      color: '#28A428', // Dark Green
    },
    {
      name: 'Other',
      count: 2,
      color: '#6B7280', // Gray
    },
  ];
}

/**
 * Get total detections
 */
export function getTotalDetections(categories: WasteCategory[]): number {
  return categories.reduce((sum, cat) => sum + cat.count, 0);
}


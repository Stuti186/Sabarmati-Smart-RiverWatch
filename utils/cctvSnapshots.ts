/**
 * CCTV Snapshots Utilities
 * Generate mock CCTV snapshot data
 */

export interface CCTVSnapshot {
  id: string;
  cameraName: string;
  location: string;
  timestamp: string;
  imageUrl?: string; // Optional - for real images
  status: 'active' | 'offline' | 'maintenance';
  description?: string;
}

/**
 * Generate mock CCTV snapshots
 */
export function generateCCTVSnapshots(): CCTVSnapshot[] {
  const now = new Date();
  const snapshots: CCTVSnapshot[] = [
    {
      id: 'cctv-001',
      cameraName: 'North Bank Camera 1',
      location: 'Sabarmati North Bank',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 mins ago
      status: 'active',
      description: 'Main entrance monitoring',
    },
    {
      id: 'cctv-002',
      cameraName: 'River Center Camera',
      location: 'River Center',
      timestamp: new Date(now.getTime() - 10 * 60000).toISOString(), // 10 mins ago
      status: 'active',
      description: 'Central monitoring point',
    },
    {
      id: 'cctv-003',
      cameraName: 'South Bank Camera 1',
      location: 'Sabarmati South Bank',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 mins ago
      status: 'active',
      description: 'South entrance area',
    },
    {
      id: 'cctv-004',
      cameraName: 'East Bank Camera',
      location: 'East Bank Walkway',
      timestamp: new Date(now.getTime() - 20 * 60000).toISOString(), // 20 mins ago
      status: 'active',
      description: 'Walkway surveillance',
    },
    {
      id: 'cctv-005',
      cameraName: 'West Bank Camera',
      location: 'West Bank Area',
      timestamp: new Date(now.getTime() - 25 * 60000).toISOString(), // 25 mins ago
      status: 'active',
      description: 'Parking area monitoring',
    },
    {
      id: 'cctv-006',
      cameraName: 'Confluence Point Camera',
      location: 'Confluence Point',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 mins ago
      status: 'active',
      description: 'Water confluence monitoring',
    },
    {
      id: 'cctv-007',
      cameraName: 'North Bank Camera 2',
      location: 'Sabarmati North Bank',
      timestamp: new Date(now.getTime() - 35 * 60000).toISOString(), // 35 mins ago
      status: 'maintenance',
      description: 'Under maintenance',
    },
    {
      id: 'cctv-008',
      cameraName: 'Bridge Camera',
      location: 'River Bridge',
      timestamp: new Date(now.getTime() - 40 * 60000).toISOString(), // 40 mins ago
      status: 'active',
      description: 'Bridge traffic monitoring',
    },
    {
      id: 'cctv-009',
      cameraName: 'South Bank Camera 2',
      location: 'Sabarmati South Bank',
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), // 45 mins ago
      status: 'active',
      description: 'Recreational area',
    },
  ];

  return snapshots;
}

/**
 * Format timestamp to relative time
 */
export function formatSnapshotTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get status color
 */
export function getStatusColor(status: CCTVSnapshot['status']): string {
  switch (status) {
    case 'active':
      return '#32CD32'; // Eco Green
    case 'offline':
      return '#FF3B30'; // Alert Red
    case 'maintenance':
      return '#FFCC00'; // Warning Yellow
  }
}


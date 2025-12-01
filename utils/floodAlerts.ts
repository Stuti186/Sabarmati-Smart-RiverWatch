/**
 * Flood Alerts Utilities
 * Generate mock flood alert data
 */

export type AlertSeverity = 'high' | 'moderate';

export interface FloodAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  location: string;
  riskLevel: number; // 0-100
  timestamp: string;
  waterLevel?: number; // meters
  rainfall?: number; // mm
  actionRequired?: string;
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'high':
      return '#FF3B30'; // Alert Red
    case 'moderate':
      return '#FFCC00'; // Warning Yellow
  }
}

/**
 * Get severity badge status for StatusChip
 */
export function getSeverityStatus(severity: AlertSeverity): 'danger' | 'warning' {
  return severity === 'high' ? 'danger' : 'warning';
}

/**
 * Generate mock flood alerts
 */
export function generateFloodAlerts(): FloodAlert[] {
  const now = new Date();
  const alerts: FloodAlert[] = [
    {
      id: 'alert-001',
      title: 'High Flood Risk - North Bank',
      description:
        'Water level rising rapidly. Risk of flooding in low-lying areas. Evacuation may be required.',
      severity: 'high',
      location: 'Sabarmati North Bank',
      riskLevel: 85,
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 mins ago
      waterLevel: 4.2,
      rainfall: 45.5,
      actionRequired: 'Immediate action required. Monitor closely.',
    },
    {
      id: 'alert-002',
      title: 'Moderate Risk - River Center',
      description:
        'Water levels above normal. Continue monitoring. Prepare for potential flooding.',
      severity: 'moderate',
      location: 'River Center',
      riskLevel: 55,
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), // 45 mins ago
      waterLevel: 3.1,
      rainfall: 28.3,
      actionRequired: 'Stay alert and monitor updates.',
    },
    {
      id: 'alert-003',
      title: 'High Flood Risk - South Bank',
      description:
        'Critical water levels detected. Flooding imminent. Take immediate precautions.',
      severity: 'high',
      location: 'Sabarmati South Bank',
      riskLevel: 92,
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
      waterLevel: 4.8,
      rainfall: 52.1,
      actionRequired: 'Evacuate if in low-lying areas. Emergency services notified.',
    },
    {
      id: 'alert-004',
      title: 'Moderate Risk - East Bank',
      description:
        'Elevated water levels observed. Risk of minor flooding in nearby areas.',
      severity: 'moderate',
      location: 'East Bank Area',
      riskLevel: 48,
      timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), // 3 hours ago
      waterLevel: 2.9,
      rainfall: 22.7,
      actionRequired: 'Monitor conditions and stay informed.',
    },
    {
      id: 'alert-005',
      title: 'High Flood Risk - Confluence Point',
      description:
        'Dangerous water levels at confluence. Multiple tributaries contributing to rise.',
      severity: 'high',
      location: 'Confluence Point',
      riskLevel: 78,
      timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
      waterLevel: 4.5,
      rainfall: 38.9,
      actionRequired: 'High alert. Prepare evacuation plan if necessary.',
    },
    {
      id: 'alert-006',
      title: 'Moderate Risk - West Bank',
      description:
        'Water levels increasing gradually. Monitor for further developments.',
      severity: 'moderate',
      location: 'West Bank Area',
      riskLevel: 42,
      timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), // 8 hours ago
      waterLevel: 2.7,
      rainfall: 18.5,
      actionRequired: 'Continue monitoring.',
    },
  ];

  // Sort by severity (high first) then by risk level (descending)
  return alerts.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'high' ? -1 : 1;
    }
    return b.riskLevel - a.riskLevel;
  });
}

/**
 * Format timestamp to relative time
 */
export function formatAlertTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


/**
 * Safety Alerts Utilities
 * Generate mock safety alert data
 */

export type SafetySeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: SafetySeverity;
  category: string; // e.g., 'Water Quality', 'Infrastructure', 'Public Safety'
  location?: string;
  timestamp: string;
  details?: string; // Additional details shown when expanded
  actionRequired?: string;
  reportedBy?: string;
}

/**
 * Get severity color
 */
export function getSafetySeverityColor(severity: SafetySeverity): string {
  switch (severity) {
    case 'critical':
      return '#8B0000'; // Dark Red
    case 'high':
      return '#FF3B30'; // Alert Red
    case 'moderate':
      return '#FFCC00'; // Warning Yellow
    case 'low':
      return '#32CD32'; // Eco Green
  }
}

/**
 * Get severity badge status for StatusChip
 */
export function getSafetySeverityStatus(
  severity: SafetySeverity
): 'danger' | 'warning' | 'success' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'danger';
    case 'moderate':
      return 'warning';
    case 'low':
      return 'success';
  }
}

/**
 * Get alert icon based on category
 */
export function getAlertIcon(
  category: string
): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('water')) return 'water';
  if (categoryLower.includes('infrastructure')) return 'construct';
  if (categoryLower.includes('public') || categoryLower.includes('safety'))
    return 'shield';
  if (categoryLower.includes('pollution')) return 'warning';
  if (categoryLower.includes('maintenance')) return 'build';
  return 'alert-circle';
}

/**
 * Generate mock safety alerts
 */
export function generateSafetyAlerts(): SafetyAlert[] {
  const now = new Date();
  const alerts: SafetyAlert[] = [
    {
      id: 'safety-001',
      title: 'Unsafe Water Quality Detected',
      description:
        'High levels of contaminants detected in river water. Avoid direct contact.',
      severity: 'critical',
      category: 'Water Quality',
      location: 'Sabarmati North Bank',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 mins ago
      details:
        'Laboratory analysis shows elevated levels of E. coli and heavy metals. Water treatment required immediately. Public advised to avoid swimming or fishing in affected area.',
      actionRequired: 'Immediate action required. Contact authorities.',
      reportedBy: 'Water Quality Sensor #12',
    },
    {
      id: 'safety-002',
      title: 'Damaged Walkway Railing',
      description:
        'Railing damage reported on riverside walkway. Risk of falling into water.',
      severity: 'high',
      category: 'Infrastructure',
      location: 'River Center Promenade',
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
      details:
        'Approximately 5 meters of railing is damaged or missing. Temporary barriers have been installed. Repair work scheduled for tomorrow.',
      actionRequired: 'Avoid affected area. Use alternative route.',
      reportedBy: 'Maintenance Team',
    },
    {
      id: 'safety-003',
      title: 'Slippery Surface Warning',
      description:
        'Wet and slippery conditions on walkway due to recent rainfall.',
      severity: 'moderate',
      category: 'Public Safety',
      location: 'East Bank Walkway',
      timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(), // 4 hours ago
      details:
        'Surface remains wet after heavy rainfall. Caution advised when walking. Non-slip mats have been placed in critical areas.',
      actionRequired: 'Exercise caution. Wear appropriate footwear.',
      reportedBy: 'Safety Patrol',
    },
    {
      id: 'safety-004',
      title: 'Pollution Incident Reported',
      description:
        'Suspected chemical discharge into river. Investigation underway.',
      severity: 'high',
      category: 'Pollution',
      location: 'Sabarmati South',
      timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(), // 6 hours ago
      details:
        'Unusual discoloration and odor detected. Environmental team dispatched. Water samples collected for analysis. Results expected within 24 hours.',
      actionRequired: 'Stay away from affected area. Updates will be provided.',
      reportedBy: 'Environmental Monitoring',
    },
    {
      id: 'safety-005',
      title: 'Low Visibility Conditions',
      description:
        'Fog and low visibility affecting riverside area. Reduced visibility for navigation.',
      severity: 'moderate',
      category: 'Public Safety',
      location: 'River Center',
      timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), // 8 hours ago
      details:
        'Visibility reduced to less than 50 meters. Boating activities suspended. Walkways remain open with caution.',
      actionRequired: 'Use caution when walking. Avoid boating activities.',
      reportedBy: 'Weather Station',
    },
    {
      id: 'safety-006',
      title: 'Maintenance Work Scheduled',
      description:
        'Scheduled maintenance work on water treatment facility. Minor service disruption expected.',
      severity: 'low',
      category: 'Maintenance',
      location: 'Water Treatment Plant',
      timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), // 12 hours ago
      details:
        'Routine maintenance scheduled for tomorrow 8 AM - 12 PM. Water supply may experience minor pressure fluctuations. No service interruption expected.',
      actionRequired: 'No action required. Informational notice.',
      reportedBy: 'Facilities Management',
    },
    {
      id: 'safety-007',
      title: 'High Bacterial Count',
      description:
        'Elevated bacterial levels detected. Swimming not recommended.',
      severity: 'high',
      category: 'Water Quality',
      location: 'West Bank Swimming Area',
      timestamp: new Date(now.getTime() - 18 * 3600000).toISOString(), // 18 hours ago
      details:
        'Bacterial count exceeds safe levels for recreational activities. Water quality monitoring continues. Swimming area temporarily closed.',
      actionRequired: 'Avoid swimming. Area will reopen when safe.',
      reportedBy: 'Health Department',
    },
  ];

  // Sort by severity (critical first, then high, moderate, low)
  const severityOrder: Record<SafetySeverity, number> = {
    critical: 0,
    high: 1,
    moderate: 2,
    low: 3,
  };

  return alerts.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

/**
 * Format timestamp to relative time
 */
export function formatSafetyAlertTimestamp(timestamp: string): string {
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


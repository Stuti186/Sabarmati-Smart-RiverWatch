/**
 * Volunteer Events Utilities
 * Load and manage volunteer event data
 */

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'cleanup' | 'awareness' | 'monitoring' | 'workshop' | 'other';
  location: string;
  date: string; // ISO date string
  time: string; // Time string (e.g., "09:00 AM")
  duration: string; // Duration (e.g., "3 hours")
  organizer: string;
  maxParticipants: number;
  currentParticipants: number;
  imageUrl?: string | null;
  requirements?: string[];
  contactInfo?: string;
}

// Static volunteer events data
const volunteerEventsData: VolunteerEvent[] = [
  {
    id: 'event-001',
    title: 'Sabarmati Riverfront Cleanup Drive',
    description:
      'Join us for a community cleanup drive along the Sabarmati Riverfront. Help remove waste, plant trees, and make a positive impact on our environment.',
    eventType: 'cleanup',
    location: 'Sabarmati Riverfront, Ahmedabad',
    date: '2024-02-15',
    time: '07:00 AM',
    duration: '4 hours',
    organizer: 'River Watch Community',
    maxParticipants: 50,
    currentParticipants: 32,
    imageUrl: null,
    requirements: ['Comfortable clothing', 'Water bottle', 'Gloves (provided)'],
    contactInfo: 'contact@riverwatch.com',
  },
  {
    id: 'event-002',
    title: 'Water Quality Monitoring Workshop',
    description:
      'Learn how to use water quality testing kits and understand key parameters like pH, DO, and turbidity. Hands-on training session for volunteers.',
    eventType: 'workshop',
    location: 'Environmental Center, Ahmedabad',
    date: '2024-02-18',
    time: '10:00 AM',
    duration: '3 hours',
    organizer: 'Environmental Education Team',
    maxParticipants: 30,
    currentParticipants: 18,
    imageUrl: null,
    requirements: ['Notebook', 'Pen'],
    contactInfo: 'workshop@riverwatch.com',
  },
  {
    id: 'event-003',
    title: 'Plastic Waste Awareness Campaign',
    description:
      'Help spread awareness about plastic pollution in rivers. Distribute educational materials, conduct surveys, and engage with the community.',
    eventType: 'awareness',
    location: 'Various locations across Ahmedabad',
    date: '2024-02-20',
    time: '09:00 AM',
    duration: '5 hours',
    organizer: 'Awareness Team',
    maxParticipants: 40,
    currentParticipants: 25,
    imageUrl: null,
    requirements: ['Comfortable walking shoes', 'Water bottle'],
    contactInfo: 'awareness@riverwatch.com',
  },
  {
    id: 'event-004',
    title: 'River Biodiversity Survey',
    description:
      'Participate in a citizen science project to document aquatic life in the Sabarmati River. Training provided on species identification.',
    eventType: 'monitoring',
    location: 'Sabarmati River, Multiple Sites',
    date: '2024-02-22',
    time: '08:00 AM',
    duration: '6 hours',
    organizer: 'Biology Research Team',
    maxParticipants: 25,
    currentParticipants: 12,
    imageUrl: null,
    requirements: ['Camera/phone', 'Notebook', 'Comfortable clothing'],
    contactInfo: 'research@riverwatch.com',
  },
  {
    id: 'event-005',
    title: 'Flood Preparedness Training Session',
    description:
      'Learn essential flood safety measures, early warning systems, and emergency response procedures. Important for community resilience.',
    eventType: 'workshop',
    location: 'Community Hall, Ahmedabad',
    date: '2024-02-25',
    time: '02:00 PM',
    duration: '2 hours',
    organizer: 'Safety Department',
    maxParticipants: 60,
    currentParticipants: 45,
    imageUrl: null,
    requirements: ['Notebook', 'Pen'],
    contactInfo: 'safety@riverwatch.com',
  },
  {
    id: 'event-006',
    title: 'Tree Planting Initiative',
    description:
      'Help plant native trees along the riverfront to improve biodiversity and prevent soil erosion. All materials provided.',
    eventType: 'cleanup',
    location: 'Riverfront Park, Ahmedabad',
    date: '2024-02-28',
    time: '06:30 AM',
    duration: '3 hours',
    organizer: 'Green Initiative Team',
    maxParticipants: 35,
    currentParticipants: 28,
    imageUrl: null,
    requirements: ['Comfortable clothing', 'Water bottle', 'Hat'],
    contactInfo: 'green@riverwatch.com',
  },
];

/**
 * Get all volunteer events
 */
export function getVolunteerEvents(): VolunteerEvent[] {
  return volunteerEventsData;
}

/**
 * Get event by ID
 */
export function getEventById(id: string): VolunteerEvent | undefined {
  return volunteerEventsData.find((event) => event.id === id);
}

/**
 * Get events by type
 */
export function getEventsByType(eventType: VolunteerEvent['eventType']): VolunteerEvent[] {
  return volunteerEventsData.filter((event) => event.eventType === eventType);
}

/**
 * Get upcoming events (events with date >= today)
 */
export function getUpcomingEvents(): VolunteerEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return volunteerEventsData.filter((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });
}

/**
 * Format event date
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get event type icon
 */
export function getEventTypeIcon(
  eventType: VolunteerEvent['eventType']
): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  switch (eventType) {
    case 'cleanup':
      return 'trash';
    case 'awareness':
      return 'megaphone';
    case 'monitoring':
      return 'analytics';
    case 'workshop':
      return 'school';
    case 'other':
      return 'calendar';
    default:
      return 'calendar';
  }
}

/**
 * Get event type label
 */
export function getEventTypeLabel(eventType: VolunteerEvent['eventType']): string {
  switch (eventType) {
    case 'cleanup':
      return 'Cleanup';
    case 'awareness':
      return 'Awareness';
    case 'monitoring':
      return 'Monitoring';
    case 'workshop':
      return 'Workshop';
    case 'other':
      return 'Other';
    default:
      return 'Event';
  }
}

/**
 * Check if event is full
 */
export function isEventFull(event: VolunteerEvent): boolean {
  return event.currentParticipants >= event.maxParticipants;
}

/**
 * Get available spots
 */
export function getAvailableSpots(event: VolunteerEvent): number {
  return Math.max(0, event.maxParticipants - event.currentParticipants);
}


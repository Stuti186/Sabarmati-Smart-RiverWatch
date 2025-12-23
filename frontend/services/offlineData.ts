/**
 * Offline Data Service
 * Manages cached biodiversity data for offline mode
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  SPECIES: '@sabarmati_species_cache',
  SIGHTINGS: '@sabarmati_sightings_cache',
  HEALTH_SCORE: '@sabarmati_health_score_cache',
  MIGRATION_PATTERNS: '@sabarmati_migration_cache',
  INVASIVE_ALERTS: '@sabarmati_invasive_cache',
  OFFLINE_SIGHTINGS_QUEUE: '@sabarmati_offline_sightings_queue',
};

// Default Sabarmati species (fallback)
const DEFAULT_SABARMATI_SPECIES = [
  {
    id: '1',
    name: 'Tilapia',
    scientificName: 'Oreochromis niloticus',
    category: 'fish',
    habitat: ['Sabarmati Riverfront'],
    status: 'observed',
    image: '',
    description: 'Common fish in Sabarmati Riverfront',
  },
  {
    id: '2',
    name: 'Catla',
    scientificName: 'Catla catla',
    category: 'fish',
    habitat: ['Sabarmati Riverfront'],
    status: 'observed',
    image: '',
    description: 'Indian carp found in Sabarmati',
  },
  {
    id: '3',
    name: 'Egret',
    scientificName: 'Egretta garzetta',
    category: 'bird',
    habitat: ['Sabarmati Riverfront'],
    status: 'observed',
    image: '',
    description: 'Common water bird in Sabarmati',
  },
  {
    id: '4',
    name: 'Kingfisher',
    scientificName: 'Alcedo atthis',
    category: 'bird',
    habitat: ['Sabarmati Riverfront'],
    status: 'observed',
    image: '',
    description: 'River kingfisher along Sabarmati',
  },
  {
    id: '5',
    name: 'Water Hyacinth',
    scientificName: 'Eichhornia crassipes',
    category: 'plant',
    habitat: ['Sabarmati Riverfront'],
    status: 'invasive',
    image: '',
    description: 'Invasive plant in Sabarmati',
  },
];

// Default migration patterns
const DEFAULT_MIGRATION_PATTERNS = [
  {
    speciesName: 'Common Pochard',
    startMonth: 11,
    endMonth: 2,
    activityLevel: 'high',
    expectedWindow: 'Nov–Feb (Expected migration window for this species along Sabarmati)',
  },
  {
    speciesName: 'Northern Shoveler',
    startMonth: 11,
    endMonth: 2,
    activityLevel: 'high',
    expectedWindow: 'Nov–Feb (Expected migration window for this species along Sabarmati)',
  },
  {
    speciesName: 'River Tern',
    startMonth: 10,
    endMonth: 3,
    activityLevel: 'moderate',
    expectedWindow: 'Oct–Mar (Expected migration window for this species along Sabarmati)',
  },
];

// Default invasive alerts
const DEFAULT_INVASIVE_ALERTS = [
  {
    id: 'inv-1',
    speciesId: '5',
    speciesName: 'Water Hyacinth',
    level: 'high',
    description: 'Rapid spread observed in northern river section. Dense mats blocking water flow.',
    affectedZones: [
      { latitude: 23.035, longitude: 72.585, radius: 500 },
    ],
    impact: 'Reducing oxygen levels, blocking navigation, affecting fish populations',
    recommendedAction: 'Mechanical removal and biological control recommended',
    reportedAt: new Date(),
  },
];

/**
 * Cache species data
 */
export async function cacheSpecies(species: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.SPECIES, JSON.stringify({
      data: species,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error caching species:', error);
  }
}

/**
 * Get cached species
 */
export async function getCachedSpecies(): Promise<any[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.SPECIES);
    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.timestamp).getTime();
      
      // Use cache if less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (error) {
    console.error('Error reading cached species:', error);
  }
  
  // Return default species if no cache
  return DEFAULT_SABARMATI_SPECIES;
}

/**
 * Cache sightings
 */
export async function cacheSightings(sightings: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.SIGHTINGS, JSON.stringify({
      data: sightings,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error caching sightings:', error);
  }
}

/**
 * Get cached sightings
 */
export async function getCachedSightings(): Promise<any[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.SIGHTINGS);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.data || [];
    }
  } catch (error) {
    console.error('Error reading cached sightings:', error);
  }
  
  return [];
}

/**
 * Queue offline sighting
 */
export async function queueOfflineSighting(sighting: any): Promise<void> {
  try {
    const queue = await getOfflineSightingsQueue();
    queue.push({
      ...sighting,
      queuedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_SIGHTINGS_QUEUE, JSON.stringify(queue));
    console.log('📦 Sighting queued for offline sync');
  } catch (error) {
    console.error('Error queueing offline sighting:', error);
  }
}

/**
 * Get offline sightings queue
 */
export async function getOfflineSightingsQueue(): Promise<any[]> {
  try {
    const queue = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_SIGHTINGS_QUEUE);
    if (queue) {
      return JSON.parse(queue);
    }
  } catch (error) {
    console.error('Error reading offline sightings queue:', error);
  }
  
  return [];
}

/**
 * Clear offline sightings queue
 */
export async function clearOfflineSightingsQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.OFFLINE_SIGHTINGS_QUEUE);
    console.log('✅ Offline sightings queue cleared');
  } catch (error) {
    console.error('Error clearing offline sightings queue:', error);
  }
}

/**
 * Get default migration patterns
 */
export function getDefaultMigrationPatterns(): any[] {
  return DEFAULT_MIGRATION_PATTERNS;
}

/**
 * Get default invasive alerts
 */
export function getDefaultInvasiveAlerts(): any[] {
  return DEFAULT_INVASIVE_ALERTS;
}

/**
 * Cache health score
 */
export async function cacheHealthScore(healthScore: any): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.HEALTH_SCORE, JSON.stringify({
      data: healthScore,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error caching health score:', error);
  }
}

/**
 * Get cached health score
 */
export async function getCachedHealthScore(): Promise<any | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.HEALTH_SCORE);
    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.timestamp).getTime();
      
      // Use cache if less than 1 hour old
      if (age < 60 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (error) {
    console.error('Error reading cached health score:', error);
  }
  
  // Return default health score
  return {
    score: 72,
    status: 'moderate',
    factors: {
      speciesDiversity: 75,
      populationHealth: 70,
      habitatQuality: 68,
      invasiveThreat: 25,
      waterQualityImpact: 75,
    },
    lastUpdated: new Date(),
    waterQualityCorrelation: {
      score: 75,
      impact: 'Good - Supports healthy ecosystem',
    },
  };
}


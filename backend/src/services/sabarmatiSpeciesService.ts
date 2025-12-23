/**
 * Sabarmati Riverfront Species Service
 * Validates and filters species specific to Sabarmati Riverfront ecosystem
 * Location: Subhash Bridge to Vasna Barrage (23.0300, 72.5800, 8km radius)
 */

import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { searchSpeciesOccurrences, type GBIFOccurrenceParams } from './gbifService';

const db = () => getFirestore();

// Sabarmati Riverfront coordinates and boundaries
export const SABARMATI_CONFIG = {
  CENTER_LAT: 23.0300,
  CENTER_LON: 72.5800,
  RADIUS_KM: 8, // 8km radius around riverfront
  // Riverfront zones
  ZONES: {
    FLOWER_PARK: { lat: 23.035, lon: 72.585, name: 'Flower Park Stretch' },
    BIODIVERSITY_PARK: { lat: 23.032, lon: 72.582, name: 'Riverfront Biodiversity Park' },
    SUBHASH_TO_GANDHI: { lat: 23.028, lon: 72.578, name: 'Subhash Bridge to Gandhi Bridge' },
    ELLIS_BRIDGE: { lat: 23.025, lon: 72.575, name: 'Ellis Bridge Walkway' },
    USMANPURA_GHAT: { lat: 23.020, lon: 72.570, name: 'Usmanpura Ghat Area' },
    VASNA_BARRAGE: { lat: 23.015, lon: 72.565, name: 'Vasna Barrage Downstream' },
  },
};

// Known Sabarmati species (curated list)
export const SABARMATI_SPECIES = {
  FISH: [
    'Tilapia',
    'Catla',
    'Rohu',
    'Silver Carp',
    'Common Carp',
    'Mrigal',
    'Catfish',
    'Mahseer',
  ],
  BIRDS: [
    'Egret',
    'Cormorant',
    'Kingfisher',
    'Black-winged Stilt',
    'River Tern',
    'Common Pochard',
    'Northern Shoveler',
    'Little Grebe',
    'Indian Pond Heron',
    'White-throated Kingfisher',
    'Pied Kingfisher',
    'Common Sandpiper',
  ],
  PLANTS: [
    'Water Hyacinth',
    'Typha',
    'Phragmites',
    'Ipomoea',
    'Prosopis',
    'Acacia',
  ],
};

/**
 * Check if a species is valid for Sabarmati Riverfront
 */
export async function isSabarmatiSpecies(
  speciesName: string,
  scientificName?: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    // Check against known Sabarmati species list
    const allSabarmatiSpecies = [
      ...SABARMATI_SPECIES.FISH,
      ...SABARMATI_SPECIES.BIRDS,
      ...SABARMATI_SPECIES.PLANTS,
    ];

    const nameLower = speciesName.toLowerCase();
    const isKnown = allSabarmatiSpecies.some(
      known => nameLower.includes(known.toLowerCase()) || known.toLowerCase().includes(nameLower)
    );

    if (isKnown) {
      return { valid: true };
    }

    // Check GBIF occurrences in Sabarmati region
    const occurrenceParams: GBIFOccurrenceParams = {
      lat: SABARMATI_CONFIG.CENTER_LAT,
      lon: SABARMATI_CONFIG.CENTER_LON,
      radius: SABARMATI_CONFIG.RADIUS_KM * 1000, // Convert to meters
      q: speciesName,
      limit: 5,
    };

    const occurrences = await searchSpeciesOccurrences(occurrenceParams);

    if (occurrences.results.length > 0) {
      // Species found in Sabarmati region
      return { valid: true };
    }

    return {
      valid: false,
      reason: 'Not a Sabarmati species — recheck image',
    };
  } catch (error: any) {
    logger.error('Error validating Sabarmati species:', error);
    // On error, allow the species but log warning
    return { valid: true };
  }
}

/**
 * Get Sabarmati-specific species from GBIF
 * Filters by location (Sabarmati region only)
 */
export async function getSabarmatiSpecies(
  category?: 'fish' | 'bird' | 'plant',
  limit: number = 50
): Promise<any[]> {
  try {
    // Search GBIF occurrences in Sabarmati region
    const occurrenceParams: GBIFOccurrenceParams = {
      lat: SABARMATI_CONFIG.CENTER_LAT,
      lon: SABARMATI_CONFIG.CENTER_LON,
      radius: SABARMATI_CONFIG.RADIUS_KM * 1000,
      limit,
    };

    // Add category filter if provided
    if (category === 'fish') {
      occurrenceParams.classKey = 198; // Actinopterygii (ray-finned fishes)
    } else if (category === 'bird') {
      occurrenceParams.classKey = 212; // Aves (birds)
    } else if (category === 'plant') {
      occurrenceParams.kingdomKey = 6; // Plantae
    }

    const occurrences = await searchSpeciesOccurrences(occurrenceParams);

    // Extract unique species from occurrences
    const speciesMap = new Map();
    occurrences.results.forEach(occ => {
      // Use speciesKey or taxonKey
      const speciesKey = occ.speciesKey || occ.taxonKey || occ.acceptedTaxonKey;
      const speciesName = occ.species || occ.scientificName;
      
      if (speciesKey && speciesName) {
        const key = speciesKey.toString();
        if (!speciesMap.has(key)) {
          speciesMap.set(key, {
            id: key,
            name: speciesName,
            scientificName: occ.scientificName || speciesName,
            category: determineCategory(occ.class, occ.kingdom),
            habitat: ['Sabarmati Riverfront'],
            status: 'observed',
            image: occ.media?.[0]?.identifier || '',
            description: `Observed in Sabarmati Riverfront region (${SABARMATI_CONFIG.CENTER_LAT}, ${SABARMATI_CONFIG.CENTER_LON})`,
            gbifKey: speciesKey,
            lastObserved: occ.eventDate,
            location: {
              latitude: occ.decimalLatitude || SABARMATI_CONFIG.CENTER_LAT,
              longitude: occ.decimalLongitude || SABARMATI_CONFIG.CENTER_LON,
            },
            sabarmatiValidated: true,
          });
        }
      }
    });

    return Array.from(speciesMap.values());
  } catch (error: any) {
    logger.error('Error fetching Sabarmati species:', error);
    return [];
  }
}

/**
 * Determine species category from GBIF data
 */
function determineCategory(className?: string, kingdom?: string): string {
  if (className === 'Aves') return 'bird';
  if (className === 'Actinopterygii' || className?.includes('fish')) return 'fish';
  if (kingdom === 'Plantae') return 'plant';
  if (className === 'Reptilia') return 'reptile';
  if (className === 'Mammalia') return 'mammal';
  if (className === 'Amphibia') return 'amphibian';
  return 'other';
}

/**
 * Get seasonal migration patterns for Sabarmati
 * Based on historical GBIF data
 */
export async function getSabarmatiMigrationPatterns(): Promise<any[]> {
  try {
    // Get bird occurrences by month
    const patterns = [];
    const migratoryBirds = [
      'Common Pochard',
      'Northern Shoveler',
      'River Tern',
      'Common Sandpiper',
    ];

    for (const bird of migratoryBirds) {
      const occurrenceParams: GBIFOccurrenceParams = {
        lat: SABARMATI_CONFIG.CENTER_LAT,
        lon: SABARMATI_CONFIG.CENTER_LON,
        radius: SABARMATI_CONFIG.RADIUS_KM * 1000,
        q: bird,
        limit: 100,
      };

      const occurrences = await searchSpeciesOccurrences(occurrenceParams);

      // Analyze by month
      const monthCounts: { [key: number]: number } = {};
      occurrences.results.forEach(occ => {
        if (occ.eventDate) {
          const month = new Date(occ.eventDate).getMonth() + 1;
          monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
      });

      // Find peak months (Nov-Feb for winter migrants)
      const peakMonths = Object.entries(monthCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([month]) => parseInt(month));

      if (peakMonths.length > 0) {
        patterns.push({
          speciesName: bird,
          startMonth: Math.min(...peakMonths),
          endMonth: Math.max(...peakMonths),
          activityLevel: peakMonths.length >= 3 ? 'high' : 'moderate',
          expectedWindow: `Nov–Feb (Expected migration window for this species along Sabarmati)`,
        });
      }
    }

    return patterns;
  } catch (error: any) {
    logger.error('Error fetching migration patterns:', error);
    return [];
  }
}

/**
 * Cache Sabarmati species list in Firestore
 */
export async function cacheSabarmatiSpecies(): Promise<void> {
  try {
    const species = await getSabarmatiSpecies(undefined, 200);
    
    await db()
      .collection('biodiversity')
      .doc('sabarmatiSpecies')
      .set({
        species,
        lastUpdated: new Date(),
        location: {
          lat: SABARMATI_CONFIG.CENTER_LAT,
          lon: SABARMATI_CONFIG.CENTER_LON,
          radius: SABARMATI_CONFIG.RADIUS_KM,
        },
      });

    logger.info(`Cached ${species.length} Sabarmati species`);
  } catch (error: any) {
    logger.error('Error caching Sabarmati species:', error);
  }
}


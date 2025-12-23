/**
 * GBIF API Service
 * Integration with Global Biodiversity Information Facility API
 * Documentation: https://www.gbif.org/developer/summary
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

// GBIF API Base URL - No authentication required
const GBIF_API_BASE_URL = 'https://api.gbif.org/v1';

// Create axios instance with default config
const gbifClient: AxiosInstance = axios.create({
  baseURL: GBIF_API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Rate limiting: 300 requests per minute
let requestCount = 0;
let resetTime = Date.now() + 60000; // Reset every minute

function checkRateLimit(): void {
  const now = Date.now();
  if (now > resetTime) {
    requestCount = 0;
    resetTime = now + 60000;
  }
  if (requestCount >= 300) {
    throw new Error('GBIF API rate limit exceeded. Please wait a minute.');
  }
  requestCount++;
}

/**
 * Search for species by name or scientific name
 */
export interface GBIFSpeciesSearchParams {
  q?: string; // Search query
  limit?: number; // Results per page (max 1000)
  offset?: number; // Pagination offset
  datasetKey?: string; // Filter by dataset
  rank?: string; // Taxonomic rank (KINGDOM, PHYLUM, CLASS, ORDER, FAMILY, GENUS, SPECIES)
  highertaxonKey?: number; // Filter by higher taxon
  status?: string; // ACCEPTED, DOUBTFUL, SYNONYM
}

export interface GBIFSpecies {
  key: number;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  scientificName: string;
  canonicalName: string;
  authorship?: string;
  rank: string;
  status?: string;
  numDescendants?: number;
  numOccurrences?: number;
  habitats?: string[];
  descriptions?: Array<{
    type: string;
    description: string;
    language: string;
  }>;
  media?: Array<{
    type: string;
    format: string;
    identifier: string;
    title?: string;
    description?: string;
  }>;
}

export interface GBIFSearchResponse {
  offset: number;
  limit: number;
  endOfRecords: boolean;
  count: number;
  results: GBIFSpecies[];
}

export async function searchSpecies(
  params: GBIFSpeciesSearchParams
): Promise<GBIFSearchResponse> {
  try {
    checkRateLimit();
    
    const response = await gbifClient.get<GBIFSearchResponse>('/species/search', {
      params: {
        q: params.q || '',
        limit: params.limit || 20,
        offset: params.offset || 0,
        datasetKey: params.datasetKey,
        rank: params.rank,
        highertaxonKey: params.highertaxonKey,
        status: params.status || 'ACCEPTED',
      },
    });

    logger.info(`GBIF search: Found ${response.data.count} species for query "${params.q}"`);
    return response.data;
  } catch (error: any) {
    logger.error('GBIF search error:', error);
    throw new Error(`GBIF API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get species details by GBIF key
 */
export async function getSpeciesByKey(key: number): Promise<GBIFSpecies> {
  try {
    checkRateLimit();
    
    const response = await gbifClient.get<GBIFSpecies>(`/species/${key}`);
    
    logger.info(`GBIF: Retrieved species ${key}`);
    return response.data;
  } catch (error: any) {
    logger.error('GBIF get species error:', error);
    throw new Error(`GBIF API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get species occurrences (sightings) by species key
 */
export interface GBIFOccurrenceParams {
  speciesKey: number;
  limit?: number;
  offset?: number;
  geometry?: string; // Bounding box: "minLat,minLng,maxLat,maxLng"
  country?: string; // ISO country code
  year?: number; // Filter by year
  month?: number; // Filter by month (1-12)
  basisOfRecord?: string; // HUMAN_OBSERVATION, MACHINE_OBSERVATION, etc.
}

export interface GBIFOccurrence {
  key: number;
  speciesKey?: number;
  species?: string;
  scientificName?: string;
  class?: string;
  kingdom?: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  country?: string;
  year?: number;
  month?: number;
  day?: number;
  eventDate?: string;
  basisOfRecord?: string;
  recordedBy?: string;
  media?: Array<{
    type: string;
    format: string;
    identifier: string;
  }>;
  // Additional fields for Sabarmati filtering
  taxonKey?: number;
  acceptedTaxonKey?: number;
}

export interface GBIFOccurrenceResponse {
  offset: number;
  limit: number;
  endOfRecords: boolean;
  count: number;
  results: GBIFOccurrence[];
}

export async function getSpeciesOccurrences(
  params: GBIFOccurrenceParams
): Promise<GBIFOccurrenceResponse> {
  try {
    checkRateLimit();
    
    const requestParams: any = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      basisOfRecord: params.basisOfRecord || 'HUMAN_OBSERVATION',
    };

    if (params.speciesKey) {
      requestParams.speciesKey = params.speciesKey;
    }
    if (params.geometry) {
      requestParams.geometry = params.geometry;
    }
    if (params.country) {
      requestParams.country = params.country;
    }
    if (params.year) {
      requestParams.year = params.year;
    }
    if (params.month) {
      requestParams.month = params.month;
    }
    if (params.lat && params.lon && params.radius) {
      // Use bounding box for radius search
      const radiusDegrees = params.radius / 111000; // Approximate conversion
      requestParams.decimalLatitude = `${params.lat - radiusDegrees},${params.lat + radiusDegrees}`;
      requestParams.decimalLongitude = `${params.lon - radiusDegrees},${params.lon + radiusDegrees}`;
    }
    if (params.q) {
      requestParams.q = params.q;
    }
    if (params.classKey) {
      requestParams.classKey = params.classKey;
    }
    if (params.kingdomKey) {
      requestParams.kingdomKey = params.kingdomKey;
    }
    
    const response = await gbifClient.get<GBIFOccurrenceResponse>('/occurrence/search', {
      params: requestParams,
    });

    logger.info(`GBIF: Found ${response.data.count} occurrences`);
    return response.data;
  } catch (error: any) {
    logger.error('GBIF occurrences error:', error);
    throw new Error(`GBIF API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Search species occurrences (alias for getSpeciesOccurrences)
 */
export async function searchSpeciesOccurrences(
  params: GBIFOccurrenceParams
): Promise<GBIFOccurrenceResponse> {
  return getSpeciesOccurrences(params);
}

/**
 * Get species by category (map to GBIF ranks)
 */
export async function getSpeciesByCategory(
  category: 'fish' | 'bird' | 'plant' | 'reptile' | 'mammal' | 'amphibian' | 'insect',
  limit: number = 20
): Promise<GBIFSearchResponse> {
  try {
    // Map categories to GBIF higher taxa
    const categoryMap: Record<string, { class?: string; kingdom?: string }> = {
      fish: { class: 'ACTINOPTERYGII' }, // Bony fish
      bird: { class: 'AVES' },
      plant: { kingdom: 'PLANTAE' },
      reptile: { class: 'REPTILIA' },
      mammal: { class: 'MAMMALIA' },
      amphibian: { class: 'AMPHIBIA' },
      insect: { class: 'INSECTA' },
    };

    const categoryInfo = categoryMap[category];
    if (!categoryInfo) {
      throw new Error(`Unknown category: ${category}`);
    }

    checkRateLimit();

    const params: any = {
      limit,
      status: 'ACCEPTED',
      rank: 'SPECIES',
    };

    if (categoryInfo.class) {
      params.classKey = categoryInfo.class;
    }
    if (categoryInfo.kingdom) {
      params.kingdomKey = categoryInfo.kingdom;
    }

    // Note: GBIF API doesn't directly support class/kingdom filters in species/search
    // We'll use a search query approach instead
    const searchTerms: Record<string, string> = {
      fish: 'Actinopterygii',
      bird: 'Aves',
      plant: 'Plantae',
      reptile: 'Reptilia',
      mammal: 'Mammalia',
      amphibian: 'Amphibia',
      insect: 'Insecta',
    };

    return await searchSpecies({
      q: searchTerms[category],
      limit,
      rank: 'SPECIES',
      status: 'ACCEPTED',
    });
  } catch (error: any) {
    logger.error('GBIF category search error:', error);
    throw new Error(`GBIF API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Transform GBIF species to app format
 */
export function transformGBIFSpecies(gbifSpecies: GBIFSpecies): {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  habitat: string[];
  status: string;
  image: string;
  description: string;
  gbifKey: number;
} {
  // Determine category from taxonomic information
  let category = 'unknown';
  if (gbifSpecies.class === 'AVES') category = 'bird';
  else if (gbifSpecies.class === 'MAMMALIA') category = 'mammal';
  else if (gbifSpecies.class === 'REPTILIA') category = 'reptile';
  else if (gbifSpecies.class === 'AMPHIBIA') category = 'amphibian';
  else if (gbifSpecies.class === 'INSECTA') category = 'insect';
  else if (gbifSpecies.class?.includes('ACTINOPTERYGII') || gbifSpecies.class?.includes('FISH')) category = 'fish';
  else if (gbifSpecies.kingdom === 'PLANTAE') category = 'plant';

  // Get image from media
  const image = gbifSpecies.media?.find(m => m.type === 'StillImage')?.identifier || 
               gbifSpecies.media?.[0]?.identifier || 
               '';

  // Get description
  const description = gbifSpecies.descriptions?.find(d => d.language === 'en')?.description ||
                     gbifSpecies.descriptions?.[0]?.description ||
                     `Species: ${gbifSpecies.canonicalName}`;

  // Map GBIF status to conservation status
  const statusMap: Record<string, string> = {
    'ACCEPTED': 'least_concern',
    'DOUBTFUL': 'least_concern',
    'SYNONYM': 'least_concern',
  };

  return {
    id: gbifSpecies.key.toString(),
    name: gbifSpecies.canonicalName || gbifSpecies.scientificName,
    scientificName: gbifSpecies.scientificName,
    category,
    habitat: gbifSpecies.habitats || [],
    status: statusMap[gbifSpecies.status || 'ACCEPTED'] || 'least_concern',
    image,
    description,
    gbifKey: gbifSpecies.key,
  };
}

/**
 * Health check for GBIF API
 */
export async function checkGBIFHealth(): Promise<boolean> {
  try {
    checkRateLimit();
    const response = await gbifClient.get('/species/search', {
      params: { q: 'test', limit: 1 },
    });
    return response.status === 200;
  } catch (error) {
    logger.error('GBIF health check failed:', error);
    return false;
  }
}


/**
 * Biodiversity API Service
 * Frontend service for biodiversity module API calls
 */

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants';
import { checkBackendHealth, isBackendOnline } from './backendHealth';
import {
  getCachedSpecies,
  getCachedSightings,
  getCachedHealthScore,
  getDefaultMigrationPatterns,
  getDefaultInvasiveAlerts,
  cacheSpecies,
  cacheSightings,
  cacheHealthScore,
  queueOfflineSighting,
} from './offlineData';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/v1`,
  timeout: 10000,
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

/**
 * Retry API call with exponential backoff
 */
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      console.log(`Retry attempt ${attempt + 1}/${retries}...`);
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Add auth token interceptor
api.interceptors.request.use(async (config) => {
  // Get token from AsyncStorage
  try {
    const token = await AsyncStorage.getItem('@smart_river_watch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Token retrieval failed, continue without token
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.warn('Backend API not available - will use offline data');
    }
    return Promise.reject(error);
  }
);

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  habitat: string[];
  status: string;
  image: string;
  description: string;
  gbifKey?: number;
}

export interface WildlifeSighting {
  id: string;
  speciesId?: string;
  speciesName?: string;
  location: { latitude: number; longitude: number };
  image: string;
  timestamp: Date;
  verified: boolean;
  verificationStatus: string;
  notes?: string;
  confidence?: number;
}

export interface EcologicalHealthScore {
  score: number;
  status: 'healthy' | 'moderate' | 'declining';
  factors: {
    speciesDiversity: number;
    populationHealth: number;
    habitatQuality: number;
    invasiveThreat: number;
  };
  lastUpdated: Date;
  waterQualityCorrelation?: {
    score: number;
    impact: string;
  };
}

export const biodiversityApi = {
  // Search species using GBIF (Sabarmati-only)
  searchSpecies: async (query: string, limit: number = 20) => {
    try {
      if (!isBackendOnline()) {
        throw new Error('Backend offline');
      }
      
      const response = await retryApiCall(() =>
        api.get('/biodiversity/species', {
          params: { q: query, limit },
        })
      );
      
      // Cache successful response
      if (response.data?.data) {
        await cacheSpecies(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.warn('Using cached/offline species data');
      const cached = await getCachedSpecies();
      const filtered = query
        ? cached.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.scientificName.toLowerCase().includes(query.toLowerCase())
          )
        : cached;
      
      return {
        success: true,
        count: filtered.length,
        total: filtered.length,
        data: filtered.slice(0, limit),
        offline: true,
      };
    }
  },

  // Get species by category (Sabarmati-only)
  getSpeciesByCategory: async (category: string, limit: number = 20) => {
    try {
      if (!isBackendOnline()) {
        throw new Error('Backend offline');
      }
      
      const response = await retryApiCall(() =>
        api.get(`/biodiversity/species/category/${category}`, {
          params: { limit },
        })
      );
      
      // Cache successful response
      if (response.data?.data) {
        await cacheSpecies(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.warn('Using cached/offline category data');
      const cached = await getCachedSpecies();
      const filtered = category === 'all' 
        ? cached 
        : cached.filter(s => s.category === category);
      
      return {
        success: true,
        count: filtered.length,
        category,
        data: filtered.slice(0, limit),
        offline: true,
      };
    }
  },

  // Get species by ID
  getSpeciesById: async (id: string) => {
    const response = await api.get(`/biodiversity/species/${id}`);
    return response.data;
  },

  // Get all sightings (real-time from Firestore)
  getSightings: async (limit: number = 20, offset: number = 0) => {
    try {
      if (!isBackendOnline()) {
        throw new Error('Backend offline');
      }
      
      const response = await retryApiCall(() =>
        api.get('/biodiversity/sightings', {
          params: { limit, offset },
        })
      );
      
      // Cache successful response
      if (response.data?.data) {
        await cacheSightings(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.warn('Using cached/offline sightings');
      const cached = await getCachedSightings();
      return {
        success: true,
        count: cached.length,
        data: cached.slice(offset, offset + limit),
        offline: true,
      };
    }
  },

  // Get my sightings (requires auth)
  getMySightings: async () => {
    const response = await api.get('/biodiversity/sightings/my');
    return response.data;
  },

  // Submit sighting (requires auth)
  submitSighting: async (sightingData: {
    speciesId?: string;
    speciesName?: string;
    location: { latitude: number; longitude: number };
    image: string;
    images?: string[];
    notes?: string;
    confidence?: number;
    aiIdentified?: boolean;
  }) => {
    try {
      if (!isBackendOnline()) {
        // Queue for offline sync
        await queueOfflineSighting(sightingData);
        return {
          success: true,
          message: 'Sighting queued for sync when online',
          queued: true,
        };
      }
      
      const formData = new FormData();
      formData.append('speciesId', sightingData.speciesId || '');
      formData.append('speciesName', sightingData.speciesName || '');
      formData.append('location', JSON.stringify(sightingData.location));
      formData.append('image', sightingData.image);
      if (sightingData.images) {
        sightingData.images.forEach((img, idx) => {
          formData.append(`images[${idx}]`, img);
        });
      }
      formData.append('notes', sightingData.notes || '');
      if (sightingData.confidence) {
        formData.append('confidence', sightingData.confidence.toString());
      }
      formData.append('aiIdentified', (sightingData.aiIdentified || false).toString());

      const response = await retryApiCall(() =>
        api.post('/biodiversity/sightings', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      
      return response.data;
    } catch (error) {
      // Queue for offline sync on error
      await queueOfflineSighting(sightingData);
      return {
        success: true,
        message: 'Sighting queued for sync when online',
        queued: true,
      };
    }
  },

  // Get ecological health score
  getEcologicalHealthScore: async () => {
    try {
      if (!isBackendOnline()) {
        throw new Error('Backend offline');
      }
      
      const response = await retryApiCall(() =>
        api.get('/biodiversity/health-score')
      );
      
      // Cache successful response
      if (response.data?.data) {
        await cacheHealthScore(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.warn('Using cached/offline health score');
      const cached = await getCachedHealthScore();
      return {
        success: true,
        data: cached,
        offline: true,
      };
    }
  },

  // Health check
  checkHealth: async () => {
    const response = await api.get('/biodiversity/health');
    return response.data;
  },

  // Validate species for Sabarmati (real validation)
  validateSpecies: async (speciesName: string, scientificName?: string) => {
    const response = await api.post('/biodiversity/validate-species', {
      speciesName,
      scientificName,
    });
    return response.data;
  },

  // Get Sabarmati migration patterns
  getMigrationPatterns: async () => {
    try {
      if (!isBackendOnline()) {
        throw new Error('Backend offline');
      }
      
      const response = await retryApiCall(() =>
        api.get('/biodiversity/migration-patterns')
      );
      
      return response.data;
    } catch (error) {
      console.warn('Using default migration patterns');
      return {
        success: true,
        count: getDefaultMigrationPatterns().length,
        data: getDefaultMigrationPatterns(),
        offline: true,
      };
    }
  },
  
  // Get invasive alerts (with offline fallback)
  getInvasiveAlerts: async () => {
    try {
      if (!isBackendOnline()) {
        throw new Error('Backend offline');
      }
      
      // This endpoint doesn't exist yet, but we'll add it
      const response = await retryApiCall(() =>
        api.get('/biodiversity/invasive-alerts')
      );
      
      return response.data;
    } catch (error) {
      console.warn('Using default invasive alerts');
      return {
        success: true,
        count: getDefaultInvasiveAlerts().length,
        data: getDefaultInvasiveAlerts(),
        offline: true,
      };
    }
  },

  // AI Species Identification using Google Gemini (backend)
  // Note: we attempt the call even if health probe says offline, to avoid blocking when backend is slow to report.
  aiIdentifySpecies: async (imageBase64: string, imageMimeType: string = 'image/jpeg') => {
    try {
      const response = await retryApiCall(() =>
        api.post('/biodiversity/ai-identify', {
          image: imageBase64,
          imageMimeType,
        })
      );
      return response.data;
    } catch (error: any) {
      console.error('AI identification error:', error);
      const baseUrl = `${API_CONFIG.BASE_URL}/api/v1`;
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        throw new Error(
          `Network unreachable. Check that the backend is running and EXPO_PUBLIC_API_URL is set.\nCurrent base URL: ${baseUrl}`
        );
      }
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to identify species';
      throw new Error(msg);
    }
  },
};


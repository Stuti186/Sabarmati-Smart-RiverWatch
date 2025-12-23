/**
 * Biodiversity Controller
 * Handles species, sightings, and biodiversity data
 * SABARMATI RIVERFRONT ONLY - All endpoints filter to Sabarmati region
 */

import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import {
  getSpeciesByKey,
  transformGBIFSpecies,
  checkGBIFHealth,
} from '../services/gbifService';
import {
  getSabarmatiSpecies,
  isSabarmatiSpecies,
  getSabarmatiMigrationPatterns,
  SABARMATI_CONFIG,
} from '../services/sabarmatiSpeciesService';
import {
  getEcologicalHealthScore,
  calculateEcologicalHealthScore,
  getHealthScoreHistory,
} from '../services/ecologicalHealthService';
import {
  identifySpeciesWithGemini,
  isGeminiConfigured,
} from '../services/geminiService';

const db = () => getFirestore();

// ============================================
// SPECIES ENDPOINTS (SABARMATI-ONLY)
// ============================================

/**
 * Search species - SABARMATI RIVERFRONT ONLY
 * GET /api/v1/biodiversity/species?q=bird&limit=20
 * Returns only species found in Sabarmati Riverfront region (8km radius)
 */
export const searchSpeciesAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit, category } = req.query;

    // Get Sabarmati-specific species (filtered by location)
    const sabarmatiSpecies = await getSabarmatiSpecies(
      category as any,
      parseInt(limit as string) || 20
    );

    // Filter by search query if provided
    let filtered = sabarmatiSpecies;
    if (q) {
      const queryLower = (q as string).toLowerCase();
      filtered = sabarmatiSpecies.filter(
        s =>
          s.name.toLowerCase().includes(queryLower) ||
          s.scientificName.toLowerCase().includes(queryLower)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      total: sabarmatiSpecies.length,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        radius: SABARMATI_CONFIG.RADIUS_KM,
        description: 'Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)',
      },
      data: filtered,
    });
  } catch (error: any) {
    logger.error('Search Sabarmati species error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching Sabarmati species',
    });
  }
};

/**
 * Get species details by ID (GBIF key)
 * GET /api/v1/biodiversity/species/:id
 * Note: Species must be validated as Sabarmati species
 */
export const getSpeciesById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gbifKey = parseInt(id);

    if (isNaN(gbifKey)) {
      res.status(400).json({
        success: false,
        message: 'Invalid species ID',
      });
      return;
    }

    // Try to get from cache/database first
    const cachedDoc = await db().collection('biodiversity').doc('species').collection('cached').doc(id).get();
    
    if (cachedDoc.exists) {
      const cached = cachedDoc.data();
      // Check if cache is less than 7 days old
      const cacheAge = Date.now() - (cached?.cachedAt?.toMillis() || 0);
      if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
        res.status(200).json({
          success: true,
          data: cached?.data,
          cached: true,
          location: {
            center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
            description: 'Sabarmati Riverfront',
          },
        });
        return;
      }
    }

    // Fetch from GBIF
    const gbifSpecies = await getSpeciesByKey(gbifKey);
    const transformed = transformGBIFSpecies(gbifSpecies);

    // Validate it's a Sabarmati species
    const validation = await isSabarmatiSpecies(transformed.name, transformed.scientificName);
    if (!validation.valid) {
      res.status(404).json({
        success: false,
        message: 'Species not found in Sabarmati Riverfront region',
        reason: validation.reason,
      });
      return;
    }

    // Add Sabarmati-specific metadata
    const sabarmatiSpecies = {
      ...transformed,
      sabarmatiValidated: true,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        radius: SABARMATI_CONFIG.RADIUS_KM,
        description: 'Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)',
      },
    };

    // Cache the result
    await db().collection('biodiversity').doc('species').collection('cached').doc(id).set({
      data: sabarmatiSpecies,
      cachedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: sabarmatiSpecies,
      cached: false,
    });
  } catch (error: any) {
    logger.error('Get species error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching species',
    });
  }
};

/**
 * Get species by category - SABARMATI RIVERFRONT ONLY
 * GET /api/v1/biodiversity/species/category/:category
 */
export const getSpeciesByCategoryAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { limit } = req.query;

    const validCategories = ['fish', 'bird', 'plant', 'reptile', 'mammal', 'amphibian', 'insect'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
      return;
    }

    // Get Sabarmati-specific species for this category
    const sabarmatiSpecies = await getSabarmatiSpecies(
      category as any,
      parseInt(limit as string) || 20
    );

    res.status(200).json({
      success: true,
      count: sabarmatiSpecies.length,
      category,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        radius: SABARMATI_CONFIG.RADIUS_KM,
        description: 'Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)',
      },
      data: sabarmatiSpecies,
    });
  } catch (error: any) {
    logger.error('Get Sabarmati species by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching Sabarmati species by category',
    });
  }
};

// ============================================
// SIGHTINGS ENDPOINTS
// ============================================

/**
 * Get all wildlife sightings (Sabarmati Riverfront)
 * GET /api/v1/biodiversity/sightings
 */
export const getSightings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '20', offset = '0', verified, speciesId, zone } = req.query;

    let query = db().collection('biodiversity').doc('sightings').collection('data')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    if (verified !== undefined) {
      query = query.where('verified', '==', verified === 'true') as any;
    }
    if (speciesId) {
      query = query.where('speciesId', '==', speciesId) as any;
    }
    if (zone) {
      query = query.where('zone', '==', zone) as any;
    }

    const snapshot = await query.get();
    const sightings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || doc.data().timestamp,
    }));

    res.status(200).json({
      success: true,
      count: sightings.length,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        description: 'Sabarmati Riverfront',
      },
      data: sightings,
    });
  } catch (error: any) {
    logger.error('Get sightings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sightings',
    });
  }
};

/**
 * Get user's sightings
 * GET /api/v1/biodiversity/sightings/my
 */
export const getMySightings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const snapshot = await db()
      .collection('biodiversity').doc('sightings').collection('data')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const sightings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || doc.data().timestamp,
    }));

    res.status(200).json({
      success: true,
      count: sightings.length,
      data: sightings,
    });
  } catch (error: any) {
    logger.error('Get my sightings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your sightings',
    });
  }
};

/**
 * Submit wildlife sighting - SABARMATI RIVERFRONT ONLY
 * POST /api/v1/biodiversity/sightings
 * Validates species is Sabarmati-specific before accepting
 */
export const submitSighting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const {
      speciesId,
      speciesName,
      location,
      image,
      images,
      notes,
      confidence,
      aiIdentified,
    } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      res.status(400).json({
        success: false,
        message: 'Location is required',
      });
      return;
    }

    if (!image && (!images || images.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'At least one image is required',
      });
      return;
    }

    // Validate species is Sabarmati-specific
    if (speciesName) {
      const validation = await isSabarmatiSpecies(speciesName);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.reason || 'Not a Sabarmati species — recheck image',
          sabarmatiOnly: true,
        });
        return;
      }
    }

    // Determine riverfront zone
    const zone = determineSabarmatiZone(
      parseFloat(location.latitude),
      parseFloat(location.longitude)
    );

    const sightingData = {
      speciesId: speciesId || null,
      speciesName: speciesName || null,
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      },
      zone: zone || 'Sabarmati Riverfront',
      image: image || images?.[0] || '',
      images: images || (image ? [image] : []),
      timestamp: new Date(),
      verified: false,
      verificationStatus: 'pending',
      notes: notes || '',
      userId,
      confidence: confidence || null,
      aiIdentified: aiIdentified || false,
      sabarmatiValidated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db()
      .collection('biodiversity').doc('sightings').collection('data')
      .add(sightingData);

    res.status(201).json({
      success: true,
      message: 'Sighting submitted successfully to Sabarmati Riverfront database',
      data: {
        id: docRef.id,
        ...sightingData,
      },
    });
  } catch (error: any) {
    logger.error('Submit sighting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting sighting',
    });
  }
};

/**
 * Determine which Sabarmati Riverfront zone a location belongs to
 */
function determineSabarmatiZone(lat: number, lon: number): string | null {
  const zones = SABARMATI_CONFIG.ZONES;
  
  // Simple distance check (can be improved with proper distance calculation)
  for (const [key, zone] of Object.entries(zones)) {
    const distance = Math.sqrt(
      Math.pow(lat - zone.lat, 2) + Math.pow(lon - zone.lon, 2)
    );
    if (distance < 0.01) { // ~1km threshold
      return zone.name;
    }
  }
  
  return null;
}

// ============================================
// ECOLOGICAL HEALTH SCORE
// ============================================

/**
 * Get current ecological health score (Sabarmati Riverfront)
 * GET /api/v1/biodiversity/health-score
 */
export const getHealthScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthScore = await getEcologicalHealthScore();

    res.status(200).json({
      success: true,
      data: {
        ...healthScore,
        location: {
          center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
          description: 'Sabarmati Riverfront',
        },
      },
    });
  } catch (error: any) {
    logger.error('Get health score error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching health score',
    });
  }
};

/**
 * Get health score history
 * GET /api/v1/biodiversity/health-score/history?days=30
 */
export const getHealthScoreHistoryAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const history = await getHealthScoreHistory(days);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error: any) {
    logger.error('Get health score history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health score history',
    });
  }
};

/**
 * Recalculate health score (Admin)
 * POST /api/v1/biodiversity/health-score/calculate
 */
export const recalculateHealthScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const healthScore = await calculateEcologicalHealthScore();

    res.status(200).json({
      success: true,
      message: 'Sabarmati Riverfront health score recalculated',
      data: healthScore,
    });
  } catch (error: any) {
    logger.error('Recalculate health score error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error recalculating health score',
    });
  }
};

// ============================================
// MIGRATION PATTERNS
// ============================================

/**
 * Get Sabarmati migration patterns
 * GET /api/v1/biodiversity/migration-patterns
 */
export const getMigrationPatterns = async (req: Request, res: Response): Promise<void> => {
  try {
    const patterns = await getSabarmatiMigrationPatterns();

    res.status(200).json({
      success: true,
      count: patterns.length,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        description: 'Sabarmati Riverfront',
      },
      data: patterns,
    });
  } catch (error: any) {
    logger.error('Get migration patterns error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching migration patterns',
    });
  }
};

// ============================================
// SPECIES VALIDATION
// ============================================

/**
 * Validate species for Sabarmati
 * POST /api/v1/biodiversity/validate-species
 */
export const validateSpecies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { speciesName, scientificName } = req.body;

    if (!speciesName) {
      res.status(400).json({
        success: false,
        message: 'Species name is required',
      });
      return;
    }

    const validation = await isSabarmatiSpecies(speciesName, scientificName);

    res.status(200).json({
      success: true,
      valid: validation.valid,
      reason: validation.reason,
      speciesName,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        radius: SABARMATI_CONFIG.RADIUS_KM,
        description: 'Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)',
      },
    });
  } catch (error: any) {
    logger.error('Validate species error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating species',
    });
  }
};

// ============================================
// AI SPECIES IDENTIFICATION
// ============================================

/**
 * AI Species Identification using Google Gemini
 * POST /api/v1/biodiversity/ai-identify
 * Accepts image and returns AI-identified species with Sabarmati validation
 */
export const aiIdentifySpecies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, imageMimeType } = req.body;

    if (!image) {
      res.status(400).json({
        success: false,
        message: 'Image is required (base64 encoded)',
      });
      return;
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      res.status(503).json({
        success: false,
        message: 'AI identification service not configured. Please set GOOGLE_GEMINI_API_KEY in backend .env',
      });
      return;
    }

    // Identify species using Gemini
    const identification = await identifySpeciesWithGemini(
      image,
      imageMimeType || 'image/jpeg'
    );

    res.status(200).json({
      success: true,
      data: identification,
      location: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        radius: SABARMATI_CONFIG.RADIUS_KM,
        description: 'Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('AI species identification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error identifying species',
    });
  }
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check GBIF API health
 * GET /api/v1/biodiversity/health
 */
export const checkBiodiversityHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const gbifHealthy = await checkGBIFHealth();

    res.status(200).json({
      success: true,
      gbif: {
        healthy: gbifHealthy,
        baseUrl: 'https://api.gbif.org/v1',
      },
      sabarmati: {
        center: { lat: SABARMATI_CONFIG.CENTER_LAT, lon: SABARMATI_CONFIG.CENTER_LON },
        radius: SABARMATI_CONFIG.RADIUS_KM,
        description: 'Sabarmati Riverfront (Subhash Bridge to Vasna Barrage)',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Biodiversity health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
    });
  }
};

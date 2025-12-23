/**
 * Biodiversity Routes
 * API endpoints for biodiversity module
 */

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  searchSpeciesAPI,
  getSpeciesById,
  getSpeciesByCategoryAPI,
  getSightings,
  getMySightings,
  submitSighting,
  getHealthScore,
  getHealthScoreHistoryAPI,
  recalculateHealthScore,
  checkBiodiversityHealth,
  getMigrationPatterns,
  validateSpecies,
  aiIdentifySpecies,
} from '../controllers/biodiversity.controller';

const router = Router();

// Public routes
router.get('/health', checkBiodiversityHealth);
router.get('/health-score', getHealthScore);
router.get('/health-score/history', getHealthScoreHistoryAPI);
router.get('/species', searchSpeciesAPI); // Sabarmati-only
router.get('/species/category/:category', getSpeciesByCategoryAPI); // Sabarmati-only
router.get('/species/:id', getSpeciesById);
router.get('/sightings', getSightings);
router.get('/migration-patterns', getMigrationPatterns); // Sabarmati migration
router.post('/validate-species', validateSpecies); // Validate Sabarmati species
router.post('/ai-identify', aiIdentifySpecies); // AI species identification (Gemini)

// Protected routes (require authentication)
router.get('/sightings/my', protect, getMySightings);
router.post('/sightings', protect, submitSighting); // Validates Sabarmati species
router.post('/health-score/calculate', protect, recalculateHealthScore);

// Admin routes (future)
// router.post('/species', protect, authorize('admin'), createSpecies);
// router.put('/species/:id', protect, authorize('admin'), updateSpecies);
// router.delete('/species/:id', protect, authorize('admin'), deleteSpecies);

export default router;


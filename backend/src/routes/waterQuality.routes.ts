import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getWaterQualityReadings,
  getLatestReadings,
  createWaterQualityReading,
  getWaterQualityStats,
  deleteWaterQualityReading,
  getTemperatureState,
  updateTemperatureState,
} from '../controllers/waterQuality.controller';

const router = Router();

// Public routes
router.get('/', getWaterQualityReadings);
router.get('/latest', getLatestReadings);
router.get('/stats', getWaterQualityStats);

// Temperature state sync (public for demo)
router.get('/temperature-state', getTemperatureState);
router.post('/temperature-state', updateTemperatureState);

// Admin/sensor routes
router.post('/', protect, createWaterQualityReading);
router.delete('/:id', protect, authorize('admin'), deleteWaterQualityReading);

export default router;

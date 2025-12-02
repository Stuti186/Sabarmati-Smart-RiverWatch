import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getWaterQualityReadings,
  getLatestReadings,
  createWaterQualityReading,
  getWaterQualityStats,
  deleteWaterQualityReading,
} from '../controllers/waterQuality.controller';

const router = Router();

// Public routes
router.get('/', getWaterQualityReadings);
router.get('/latest', getLatestReadings);
router.get('/stats', getWaterQualityStats);

// Admin/sensor routes
router.post('/', protect, createWaterQualityReading);
router.delete('/:id', protect, authorize('admin'), deleteWaterQualityReading);

export default router;

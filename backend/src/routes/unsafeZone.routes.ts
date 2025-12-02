import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getUnsafeZones,
  getUnsafeZoneById,
  createUnsafeZone,
  updateUnsafeZone,
  deleteUnsafeZone,
} from '../controllers/unsafeZone.controller';

const router = Router();

// Public routes
router.get('/', getUnsafeZones);
router.get('/:id', getUnsafeZoneById);

// Admin routes
router.post('/', protect, authorize('admin'), createUnsafeZone);
router.put('/:id', protect, authorize('admin'), updateUnsafeZone);
router.delete('/:id', protect, authorize('admin'), deleteUnsafeZone);

export default router;

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getWasteHotspots,
  getWasteHotspotById,
  createWasteHotspot,
  updateWasteHotspot,
  deleteWasteHotspot,
} from '../controllers/wasteHotspot.controller';

const router = Router();

// Public routes
router.get('/', getWasteHotspots);
router.get('/:id', getWasteHotspotById);

// Admin routes
router.post('/', protect, authorize('admin'), createWasteHotspot);
router.put('/:id', protect, authorize('admin'), updateWasteHotspot);
router.delete('/:id', protect, authorize('admin'), deleteWasteHotspot);

export default router;

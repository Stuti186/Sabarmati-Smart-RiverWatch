import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  resolveAlert,
  deleteAlert,
} from '../controllers/alert.controller';

const router = Router();

// Public routes
router.get('/', getAlerts);
router.get('/:id', getAlertById);

// Admin routes
router.post('/', protect, authorize('admin'), createAlert);
router.put('/:id', protect, authorize('admin'), updateAlert);
router.post('/:id/resolve', protect, authorize('admin'), resolveAlert);
router.delete('/:id', protect, authorize('admin'), deleteAlert);

export default router;

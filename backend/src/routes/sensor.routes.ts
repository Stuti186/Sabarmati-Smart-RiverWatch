import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getSensors,
  getSensorById,
  getSensorsNearby,
  createSensor,
  updateSensor,
  deleteSensor,
} from '../controllers/sensor.controller';

const router = Router();

// Public routes
router.get('/', getSensors);
router.get('/nearby', getSensorsNearby);
router.get('/:id', getSensorById);

// Admin routes
router.post('/', protect, authorize('admin'), createSensor);
router.put('/:id', protect, authorize('admin'), updateSensor);
router.delete('/:id', protect, authorize('admin'), deleteSensor);

export default router;

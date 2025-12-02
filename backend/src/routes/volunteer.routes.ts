import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getVolunteerEvents,
  getVolunteerEventById,
  createVolunteerEvent,
  registerForEvent,
  markAttendance,
  updateVolunteerEvent,
  deleteVolunteerEvent,
} from '../controllers/volunteer.controller';

const router = Router();

// Public routes
router.get('/', getVolunteerEvents);
router.get('/:id', getVolunteerEventById);

// Protected routes
router.post('/:id/register', protect, registerForEvent);

// Admin routes
router.post('/', protect, authorize('admin'), createVolunteerEvent);
router.post('/:id/attendance', protect, authorize('admin'), markAttendance);
router.put('/:id', protect, authorize('admin'), updateVolunteerEvent);
router.delete('/:id', protect, authorize('admin'), deleteVolunteerEvent);

export default router;

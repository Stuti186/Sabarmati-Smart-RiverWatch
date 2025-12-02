import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats,
} from '../controllers/user.controller';

const router = Router();

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;

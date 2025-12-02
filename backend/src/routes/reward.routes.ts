import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getMyRewards,
  getLeaderboard,
  awardPoints,
  getRewardHistory,
} from '../controllers/reward.controller';

const router = Router();

// Public/protected routes
router.get('/leaderboard', getLeaderboard);
router.get('/my', protect, getMyRewards);
router.get('/history', protect, getRewardHistory);

// Admin routes
router.post('/award', protect, authorize('admin'), awardPoints);

export default router;

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getReports,
  getReportById,
  getMyReports,
  getReportsNearby,
  createReport,
  updateReport,
  verifyReport,
  addComment,
  voteReport,
  deleteReport,
} from '../controllers/report.controller';

const router = Router();

// Public routes
router.get('/', getReports);
router.get('/nearby', getReportsNearby);
router.get('/:id', getReportById);

// Protected routes
router.get('/my/reports', protect, getMyReports);
router.post('/', protect, createReport);
router.put('/:id', protect, updateReport);
router.post('/:id/comments', protect, addComment);
router.post('/:id/vote', voteReport);
router.delete('/:id', protect, deleteReport);

// Admin routes
router.post('/:id/verify', protect, authorize('admin'), verifyReport);

export default router;

import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// Placeholder routes
router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Volunteer routes to be implemented' });
});

export default router;

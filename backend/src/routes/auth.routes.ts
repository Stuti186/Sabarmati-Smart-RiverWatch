import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  updatePassword,
  refreshToken,
  logout,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { upload } from '../utils/multer';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;

import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getFirestore, getAuth } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import * as bcrypt from 'bcryptjs';

const db = () => getFirestore();
const auth = () => getAuth();

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '7d' });
};

const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, config.jwtRefreshSecret, { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const usersRef = db().collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();

    if (!existingUser.empty) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Create Firebase Auth user
    const firebaseUser = await auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Hash password for Firestore storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document in Firestore
    const userData = {
      uid: firebaseUser.uid,
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role: 'user',
      rewardPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersRef.doc(firebaseUser.uid).set(userData);

    // Generate tokens
    const token = generateToken(firebaseUser.uid);
    const refreshToken = generateRefreshToken(firebaseUser.uid);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          rewardPoints: userData.rewardPoints,
        },
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fcmToken } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user in Firestore
    const usersRef = db().collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (userSnapshot.empty) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Update FCM token if provided
    if (fcmToken) {
      await userDoc.ref.update({
        fcmToken,
        lastLogin: new Date(),
      });
    } else {
      await userDoc.ref.update({
        lastLogin: new Date(),
      });
    }

    // Generate tokens
    const token = generateToken(userDoc.id);
    const refreshToken = generateRefreshToken(userDoc.id);

    res.json({
      success: true,
      data: {
        user: {
          id: userDoc.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          rewardPoints: user.rewardPoints,
          avatar: user.avatar || null,
        },
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const userDoc = await db().collection('users').doc(req.user.id).get();

    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = userDoc.data();

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
        rewardPoints: user?.rewardPoints,
        avatar: user?.avatar,
      },
    });
  } catch (error: any) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const { name, phone, preferences } = req.body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferences) updateData.preferences = preferences;

    await db().collection('users').doc(req.user.id).update(updateData);

    const updatedDoc = await db().collection('users').doc(req.user.id).get();
    const updatedUser = updatedDoc.data();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        role: updatedUser?.role,
        rewardPoints: updatedUser?.rewardPoints,
        avatar: updatedUser?.avatar,
      },
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/v1/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
      return;
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await db().collection('users').doc(req.user.id).update({
      avatar: avatarUrl,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        avatar: avatarUrl,
      },
    });
  } catch (error: any) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading avatar',
    });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
      return;
    }

    const userDoc = await db().collection('users').doc(req.user.id).get();
    const user = userDoc.data();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in Firestore
    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: new Date(),
    });

    // Update password in Firebase Auth
    await auth().updateUser(req.user.id, {
      password: newPassword,
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    logger.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating password',
    });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as { id: string };

    // Generate new tokens
    const newToken = generateToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const { fcmToken } = req.body;

    // Remove FCM token
    if (fcmToken) {
      await db().collection('users').doc(req.user.id).update({
        fcmToken: null,
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging out',
    });
  }
};

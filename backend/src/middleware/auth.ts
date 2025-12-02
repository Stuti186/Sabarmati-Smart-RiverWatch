import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';

export interface IUser {
  id: string;
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  rewardPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

      // Get user from Firestore
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(decoded.id).get();

      if (!userDoc.exists) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userData = userDoc.data();
      const user: IUser = {
        id: userDoc.id,
        email: userData?.email || '',
        username: userData?.username || '',
        role: userData?.role || 'user',
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        phoneNumber: userData?.phoneNumber,
        avatar: userData?.avatar,
        location: userData?.location,
        notificationSettings: userData?.notificationSettings,
        rewardPoints: userData?.rewardPoints || 0,
        createdAt: userData?.createdAt?.toDate() || new Date(),
        updatedAt: userData?.updatedAt?.toDate() || new Date(),
      };

      req.user = user;
      req.userId = userDoc.id;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};

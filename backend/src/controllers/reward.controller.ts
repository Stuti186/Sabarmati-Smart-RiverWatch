import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get user reward points
export const getMyRewards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    const userDoc = await db().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }
    
    const userData = userDoc.data();
    
    res.status(200).json({
      success: true,
      data: {
        rewardPoints: userData?.rewardPoints || 0,
        userId,
      },
    });
  } catch (error) {
    logger.error('Get my rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reward points',
    });
  }
};

// Get reward leaderboard
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const snapshot = await db()
      .collection('users')
      .orderBy('rewardPoints', 'desc')
      .limit(parseInt(limit as string))
      .get();
    
    const leaderboard = snapshot.docs.map((doc, index) => {
      const userData = doc.data();
      return {
        rank: index + 1,
        userId: doc.id,
        username: userData.username,
        avatar: userData.avatar || null,
        rewardPoints: userData.rewardPoints || 0,
      };
    });
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
    });
  }
};

// Award points to user (admin)
export const awardPoints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, points, reason } = req.body;
    
    if (!userId || !points) {
      res.status(400).json({
        success: false,
        message: 'Please provide userId and points',
      });
      return;
    }
    
    const userDoc = await db().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }
    
    const currentPoints = userDoc.data()?.rewardPoints || 0;
    const newPoints = currentPoints + points;
    
    await userDoc.ref.update({
      rewardPoints: newPoints,
      updatedAt: new Date(),
    });
    
    // Create reward transaction record
    await db().collection('rewardTransactions').add({
      userId,
      points,
      reason: reason || 'Manual award by admin',
      awardedBy: req.userId,
      timestamp: new Date(),
    });
    
    res.status(200).json({
      success: true,
      message: 'Points awarded successfully',
      data: {
        userId,
        previousPoints: currentPoints,
        pointsAwarded: points,
        newTotal: newPoints,
      },
    });
  } catch (error) {
    logger.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding points',
    });
  }
};

// Get reward transaction history (admin or own)
export const getRewardHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const requestUserId = req.userId;
    const userRole = req.user?.role;
    
    // Non-admins can only view their own history
    const targetUserId = userId || requestUserId;
    
    if (userRole !== 'admin' && targetUserId !== requestUserId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view other users reward history',
      });
      return;
    }
    
    const snapshot = await db()
      .collection('rewardTransactions')
      .where('userId', '==', targetUserId)
      .orderBy('timestamp', 'desc')
      .get();
    
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    logger.error('Get reward history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reward history',
    });
  }
};

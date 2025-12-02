import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get all users (admin)
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db().collection('users').orderBy('createdAt', 'desc').get();
    
    const users = snapshot.docs.map(doc => {
      const userData = doc.data();
      delete userData.password; // Don't send passwords
      return {
        id: doc.id,
        ...userData,
      };
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
};

// Get user by ID (admin)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const userDoc = await db().collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }
    
    const userData = userDoc.data();
    delete userData?.password;
    
    res.status(200).json({
      success: true,
      data: {
        id: userDoc.id,
        ...userData,
      },
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
};

// Update user role (admin)
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, admin, or moderator',
      });
      return;
    }
    
    const userDoc = await db().collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }
    
    await userDoc.ref.update({
      role,
      updatedAt: new Date(),
    });
    
    const updatedDoc = await userDoc.ref.get();
    const userData = updatedDoc.data();
    delete userData?.password;
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: updatedDoc.id,
        ...userData,
      },
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
    });
  }
};

// Delete user (admin)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (id === req.userId) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
      return;
    }
    
    const userDoc = await db().collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }
    
    await userDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
    });
  }
};

// Get user statistics (admin)
export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usersSnapshot = await db().collection('users').get();
    const reportsSnapshot = await db().collection('reports').get();
    
    const stats = {
      totalUsers: usersSnapshot.size,
      totalReports: reportsSnapshot.size,
      usersByRole: {
        user: 0,
        admin: 0,
        moderator: 0,
      },
      reportsPerUser: 0,
    };
    
    usersSnapshot.docs.forEach(doc => {
      const role = doc.data().role || 'user';
      if (role in stats.usersByRole) {
        stats.usersByRole[role as keyof typeof stats.usersByRole]++;
      }
    });
    
    if (stats.totalUsers > 0) {
      stats.reportsPerUser = stats.totalReports / stats.totalUsers;
    }
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
    });
  }
};

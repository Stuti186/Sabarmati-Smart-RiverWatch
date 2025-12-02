import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get all reports with filtering and pagination
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, userId, limit = 50, offset = 0 } = req.query;
    
    let query = db().collection('reports');
    
    if (type) {
      query = query.where('type', '==', type) as any;
    }
    if (status) {
      query = query.where('status', '==', status) as any;
    }
    if (userId) {
      query = query.where('userId', '==', userId) as any;
    }
    
    // Order by creation date descending
    query = query.orderBy('createdAt', 'desc') as any;
    
    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    query = query.limit(limitNum).offset(offsetNum) as any;
    
    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
    });
  }
};

// Get report by ID
export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const reportDoc = await db().collection('reports').doc(id).get();
    
    if (!reportDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: reportDoc.id,
        ...reportDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
    });
  }
};

// Get user's reports
export const getMyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    const snapshot = await db()
      .collection('reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    logger.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reports',
    });
  }
};

// Get nearby reports
export const getReportsNearby = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 5000, type } = req.query;
    
    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
      return;
    }
    
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusInKm = parseFloat(radius as string) / 1000;
    
    let query = db().collection('reports');
    
    if (type) {
      query = query.where('type', '==', type) as any;
    }
    
    const snapshot = await query.get();
    
    const nearbyReports = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((report: any) => {
        if (!report.location || !report.location.coordinates) return false;
        
        const [reportLon, reportLat] = report.location.coordinates;
        const distance = getDistanceFromLatLonInKm(lat, lon, reportLat, reportLon);
        
        return distance <= radiusInKm;
      });
    
    res.status(200).json({
      success: true,
      count: nearbyReports.length,
      data: nearbyReports,
    });
  } catch (error) {
    logger.error('Get nearby reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby reports',
    });
  }
};

// Create a new report
export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User must be authenticated to create reports',
      });
      return;
    }
    
    const {
      type,
      title,
      description,
      location,
      address,
      severity,
      images = [],
      aiAnalysis,
      metadata,
    } = req.body;
    
    // Validate required fields
    if (!type || !title || !description || !location || !severity) {
      res.status(400).json({
        success: false,
        message: 'Please provide type, title, description, location, and severity',
      });
      return;
    }
    
    const reportData = {
      userId,
      type,
      title,
      description,
      location,
      address: address || null,
      severity,
      images,
      aiAnalysis: aiAnalysis || null,
      status: 'pending',
      verifiedBy: null,
      verificationNotes: null,
      verificationDate: null,
      relatedEntity: null,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      rewardPointsAwarded: 0,
      isPublic: true,
      metadata: metadata || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const reportRef = await db().collection('reports').add(reportData);
    
    // Award reward points for creating a report (10 points)
    const userDoc = await db().collection('users').doc(userId).get();
    if (userDoc.exists) {
      const currentPoints = userDoc.data()?.rewardPoints || 0;
      await userDoc.ref.update({
        rewardPoints: currentPoints + 10,
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        id: reportRef.id,
        ...reportData,
      },
    });
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
    });
  }
};

// Update report
export const updateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.user?.role;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    const reportDoc = await db().collection('reports').doc(id).get();
    
    if (!reportDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }
    
    const reportData = reportDoc.data();
    
    // Only owner or admin can update
    if (reportData?.userId !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this report',
      });
      return;
    }
    
    const updateData = { ...req.body };
    delete updateData.userId; // Don't allow changing owner
    delete updateData.createdAt;
    delete updateData.rewardPointsAwarded;
    
    updateData.updatedAt = new Date();
    
    await reportDoc.ref.update(updateData);
    
    const updatedDoc = await reportDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
    });
  }
};

// Verify report (admin only)
export const verifyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, verificationNotes } = req.body;
    const verifierId = req.userId;
    
    if (!verifierId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    const reportDoc = await db().collection('reports').doc(id).get();
    
    if (!reportDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }
    
    const reportData = reportDoc.data();
    
    await reportDoc.ref.update({
      status: status || 'verified',
      verifiedBy: verifierId,
      verificationNotes: verificationNotes || null,
      verificationDate: new Date(),
      updatedAt: new Date(),
    });
    
    // Award additional points if verified (20 points)
    if (status === 'verified' && reportData?.userId) {
      const userDoc = await db().collection('users').doc(reportData.userId).get();
      if (userDoc.exists) {
        const currentPoints = userDoc.data()?.rewardPoints || 0;
        await userDoc.ref.update({
          rewardPoints: currentPoints + 20,
        });
        
        await reportDoc.ref.update({
          rewardPointsAwarded: 30, // 10 for creation + 20 for verification
        });
      }
    }
    
    const updatedDoc = await reportDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Report verified successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Verify report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying report',
    });
  }
};

// Add comment to report
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
      return;
    }
    
    const reportDoc = await db().collection('reports').doc(id).get();
    
    if (!reportDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }
    
    const reportData = reportDoc.data();
    const comments = reportData?.comments || [];
    
    const newComment = {
      userId,
      text: text.trim(),
      createdAt: new Date(),
    };
    
    comments.push(newComment);
    
    await reportDoc.ref.update({
      comments,
      updatedAt: new Date(),
    });
    
    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment,
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
    });
  }
};

// Vote on report
export const voteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' or 'down'
    
    const reportDoc = await db().collection('reports').doc(id).get();
    
    if (!reportDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }
    
    const reportData = reportDoc.data();
    const updates: any = { updatedAt: new Date() };
    
    if (voteType === 'up') {
      updates.upvotes = (reportData?.upvotes || 0) + 1;
    } else if (voteType === 'down') {
      updates.downvotes = (reportData?.downvotes || 0) + 1;
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use "up" or "down"',
      });
      return;
    }
    
    await reportDoc.ref.update(updates);
    
    const updatedDoc = await reportDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Vote report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error voting on report',
    });
  }
};

// Delete report
export const deleteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.user?.role;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    const reportDoc = await db().collection('reports').doc(id).get();
    
    if (!reportDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }
    
    const reportData = reportDoc.data();
    
    // Only owner or admin can delete
    if (reportData?.userId !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report',
      });
      return;
    }
    
    await reportDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
    });
  }
};

// Helper function
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

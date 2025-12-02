import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get all unsafe zones
export const getUnsafeZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, isActive } = req.query;
    
    let query = db().collection('unsafeZones');
    
    if (status) {
      query = query.where('status', '==', status) as any;
    }
    if (type) {
      query = query.where('type', '==', type) as any;
    }
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true') as any;
    }
    
    const snapshot = await query.get();
    const zones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones,
    });
  } catch (error) {
    logger.error('Get unsafe zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unsafe zones',
    });
  }
};

// Get unsafe zone by ID
export const getUnsafeZoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const zoneDoc = await db().collection('unsafeZones').doc(id).get();
    
    if (!zoneDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Unsafe zone not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: zoneDoc.id,
        ...zoneDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Get unsafe zone by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unsafe zone',
    });
  }
};

// Create unsafe zone (admin)
export const createUnsafeZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      location,
      radius,
      severity,
      type,
      description,
      causes = [],
      safetyRecommendations = [],
      images = [],
    } = req.body;
    
    if (!name || !location || !radius || !severity || !type || !description) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }
    
    const zoneData = {
      name,
      location,
      radius,
      severity,
      type,
      description,
      causes,
      affectedArea: Math.PI * radius * radius,
      riskLevel: {
        health: 0,
        environmental: 0,
        overall: 0,
      },
      reportedBy: req.userId || null,
      verifiedBy: null,
      verificationDate: null,
      status: 'reported',
      images,
      safetyRecommendations,
      estimatedCleanupCost: null,
      cleanupProgress: 0,
      metadata: {
        reportCount: 1,
        lastReportDate: new Date(),
        authorities_notified: false,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const zoneRef = await db().collection('unsafeZones').add(zoneData);
    
    res.status(201).json({
      success: true,
      message: 'Unsafe zone created successfully',
      data: {
        id: zoneRef.id,
        ...zoneData,
      },
    });
  } catch (error) {
    logger.error('Create unsafe zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating unsafe zone',
    });
  }
};

// Update unsafe zone (admin)
export const updateUnsafeZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    delete updateData.createdAt;
    delete updateData.reportedBy;
    
    const zoneDoc = await db().collection('unsafeZones').doc(id).get();
    
    if (!zoneDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Unsafe zone not found',
      });
      return;
    }
    
    updateData.updatedAt = new Date();
    
    await zoneDoc.ref.update(updateData);
    
    const updatedDoc = await zoneDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Unsafe zone updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Update unsafe zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating unsafe zone',
    });
  }
};

// Delete unsafe zone (admin)
export const deleteUnsafeZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const zoneDoc = await db().collection('unsafeZones').doc(id).get();
    
    if (!zoneDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Unsafe zone not found',
      });
      return;
    }
    
    await zoneDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'Unsafe zone deleted successfully',
    });
  } catch (error) {
    logger.error('Delete unsafe zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting unsafe zone',
    });
  }
};

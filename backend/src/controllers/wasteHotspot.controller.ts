import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get all waste hotspots
export const getWasteHotspots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, severity, isActive } = req.query;
    
    let query = db().collection('wasteHotspots');
    
    if (status) {
      query = query.where('status', '==', status) as any;
    }
    if (severity) {
      query = query.where('severity', '==', severity) as any;
    }
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true') as any;
    }
    
    const snapshot = await query.get();
    const hotspots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: hotspots.length,
      data: hotspots,
    });
  } catch (error) {
    logger.error('Get waste hotspots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching waste hotspots',
    });
  }
};

// Get waste hotspot by ID
export const getWasteHotspotById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const hotspotDoc = await db().collection('wasteHotspots').doc(id).get();
    
    if (!hotspotDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Waste hotspot not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: hotspotDoc.id,
        ...hotspotDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Get waste hotspot by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching waste hotspot',
    });
  }
};

// Create waste hotspot (admin)
export const createWasteHotspot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      location,
      radius,
      density,
      severity,
      wasteTypes = [],
      estimatedVolume,
      description,
      images = [],
    } = req.body;
    
    if (!name || !location || !radius || !density || !severity) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }
    
    const hotspotData = {
      name,
      location,
      radius,
      density,
      severity,
      wasteTypes,
      estimatedVolume: estimatedVolume || null,
      description: description || null,
      images,
      reportedBy: req.userId || null,
      verifiedBy: null,
      verificationDate: null,
      status: 'reported',
      cleanupEvents: [],
      trends: {
        historicalDensity: [{
          date: new Date(),
          density,
        }],
        changeRate: 0,
      },
      metadata: {
        reportCount: 1,
        lastReportDate: new Date(),
        aiDetectionConfidence: null,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const hotspotRef = await db().collection('wasteHotspots').add(hotspotData);
    
    res.status(201).json({
      success: true,
      message: 'Waste hotspot created successfully',
      data: {
        id: hotspotRef.id,
        ...hotspotData,
      },
    });
  } catch (error) {
    logger.error('Create waste hotspot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating waste hotspot',
    });
  }
};

// Update waste hotspot (admin)
export const updateWasteHotspot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    delete updateData.createdAt;
    delete updateData.reportedBy;
    
    const hotspotDoc = await db().collection('wasteHotspots').doc(id).get();
    
    if (!hotspotDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Waste hotspot not found',
      });
      return;
    }
    
    updateData.updatedAt = new Date();
    
    await hotspotDoc.ref.update(updateData);
    
    const updatedDoc = await hotspotDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Waste hotspot updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Update waste hotspot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating waste hotspot',
    });
  }
};

// Delete waste hotspot (admin)
export const deleteWasteHotspot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const hotspotDoc = await db().collection('wasteHotspots').doc(id).get();
    
    if (!hotspotDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Waste hotspot not found',
      });
      return;
    }
    
    await hotspotDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'Waste hotspot deleted successfully',
    });
  } catch (error) {
    logger.error('Delete waste hotspot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting waste hotspot',
    });
  }
};

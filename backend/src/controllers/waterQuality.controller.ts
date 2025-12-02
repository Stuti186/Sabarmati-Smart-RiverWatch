import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get water quality readings with filtering
export const getWaterQualityReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, startDate, endDate, limit = 100 } = req.query;
    
    let query = db().collection('waterQuality');
    
    if (sensorId) {
      query = query.where('sensorId', '==', sensorId) as any;
    }
    
    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit as string)) as any;
    
    const snapshot = await query.get();
    let readings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Filter by date range if provided
    if (startDate || endDate) {
      readings = readings.filter((reading: any) => {
        const timestamp = reading.timestamp?.toDate?.() || new Date(reading.timestamp);
        if (startDate && timestamp < new Date(startDate as string)) return false;
        if (endDate && timestamp > new Date(endDate as string)) return false;
        return true;
      });
    }
    
    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    logger.error('Get water quality readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality readings',
    });
  }
};

// Get latest water quality for all sensors
export const getLatestReadings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sensorsSnapshot = await db().collection('sensors')
      .where('type', 'in', ['water_quality', 'multi'])
      .get();
    
    const latestReadings = [];
    
    for (const sensorDoc of sensorsSnapshot.docs) {
      const readingSnapshot = await db().collection('waterQuality')
        .where('sensorId', '==', sensorDoc.id)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!readingSnapshot.empty) {
        const reading = readingSnapshot.docs[0];
        latestReadings.push({
          id: reading.id,
          sensorData: {
            id: sensorDoc.id,
            ...sensorDoc.data(),
          },
          ...reading.data(),
        });
      }
    }
    
    res.status(200).json({
      success: true,
      count: latestReadings.length,
      data: latestReadings,
    });
  } catch (error) {
    logger.error('Get latest readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest readings',
    });
  }
};

// Create water quality reading (sensor/admin)
export const createWaterQualityReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      sensorId,
      timestamp,
      location,
      parameters,
      qualityIndex,
      alerts = [],
      metadata,
      isValidated = false,
    } = req.body;
    
    if (!sensorId || !parameters || !qualityIndex) {
      res.status(400).json({
        success: false,
        message: 'Please provide sensorId, parameters, and qualityIndex',
      });
      return;
    }
    
    const readingData = {
      sensorId,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      location: location || null,
      parameters,
      qualityIndex,
      alerts,
      metadata: metadata || null,
      isValidated,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const readingRef = await db().collection('waterQuality').add(readingData);
    
    res.status(201).json({
      success: true,
      message: 'Water quality reading created successfully',
      data: {
        id: readingRef.id,
        ...readingData,
      },
    });
  } catch (error) {
    logger.error('Create water quality reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating water quality reading',
    });
  }
};

// Get statistics
export const getWaterQualityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));
    
    let query = db().collection('waterQuality');
    
    if (sensorId) {
      query = query.where('sensorId', '==', sensorId) as any;
    }
    
    const snapshot = await query.get();
    
    const readings = snapshot.docs
      .map(doc => doc.data())
      .filter((reading: any) => {
        const timestamp = reading.timestamp?.toDate?.() || new Date(reading.timestamp);
        return timestamp >= startDate;
      });
    
    // Calculate averages
    const stats = {
      averageScore: 0,
      categoryDistribution: {
        excellent: 0,
        good: 0,
        moderate: 0,
        poor: 0,
        very_poor: 0,
      },
      parameterAverages: {} as any,
      totalReadings: readings.length,
    };
    
    if (readings.length > 0) {
      let totalScore = 0;
      const parameterSums: any = {};
      const parameterCounts: any = {};
      
      readings.forEach((reading: any) => {
        totalScore += reading.qualityIndex?.score || 0;
        const category = reading.qualityIndex?.category;
        if (category && category in stats.categoryDistribution) {
          stats.categoryDistribution[category as keyof typeof stats.categoryDistribution]++;
        }
        
        Object.entries(reading.parameters || {}).forEach(([key, value]) => {
          if (typeof value === 'number') {
            parameterSums[key] = (parameterSums[key] || 0) + value;
            parameterCounts[key] = (parameterCounts[key] || 0) + 1;
          }
        });
      });
      
      stats.averageScore = totalScore / readings.length;
      
      Object.keys(parameterSums).forEach(key => {
        stats.parameterAverages[key] = parameterSums[key] / parameterCounts[key];
      });
    }
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get water quality stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
    });
  }
};

// Delete reading (admin only)
export const deleteWaterQualityReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const readingDoc = await db().collection('waterQuality').doc(id).get();
    
    if (!readingDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Water quality reading not found',
      });
      return;
    }
    
    await readingDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'Water quality reading deleted successfully',
    });
  } catch (error) {
    logger.error('Delete water quality reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting water quality reading',
    });
  }
};

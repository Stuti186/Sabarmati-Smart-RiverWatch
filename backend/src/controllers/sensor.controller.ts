import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get all sensors with optional filtering
export const getSensors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, isPublic } = req.query;
    
    let query = db().collection('sensors');
    
    if (type) {
      query = query.where('type', '==', type) as any;
    }
    if (status) {
      query = query.where('status', '==', status) as any;
    }
    if (isPublic !== undefined) {
      query = query.where('isPublic', '==', isPublic === 'true') as any;
    }
    
    const snapshot = await query.get();
    const sensors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: sensors.length,
      data: sensors,
    });
  } catch (error) {
    logger.error('Get sensors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sensors',
    });
  }
};

// Get sensor by ID
export const getSensorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sensorDoc = await db().collection('sensors').doc(id).get();
    
    if (!sensorDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Sensor not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: sensorDoc.id,
        ...sensorDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Get sensor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sensor',
    });
  }
};

// Get sensors near a location
export const getSensorsNearby = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;
    
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
    
    // Firestore doesn't support geoqueries directly, so we fetch all and filter
    const snapshot = await db().collection('sensors').where('isPublic', '==', true).get();
    
    const nearbySensors = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((sensor: any) => {
        if (!sensor.location || !sensor.location.coordinates) return false;
        
        const [sensorLon, sensorLat] = sensor.location.coordinates;
        const distance = getDistanceFromLatLonInKm(lat, lon, sensorLat, sensorLon);
        
        return distance <= radiusInKm;
      });
    
    res.status(200).json({
      success: true,
      count: nearbySensors.length,
      data: nearbySensors,
    });
  } catch (error) {
    logger.error('Get nearby sensors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby sensors',
    });
  }
};

// Create a new sensor (admin only)
export const createSensor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      sensorId,
      name,
      type,
      location,
      address,
      status = 'active',
      manufacturer,
      deviceModel,
      installationDate,
      parameters = [],
      metadata = {},
      alertThresholds,
      isPublic = true,
    } = req.body;
    
    // Validate required fields
    if (!sensorId || !name || !type || !location) {
      res.status(400).json({
        success: false,
        message: 'Please provide sensorId, name, type, and location',
      });
      return;
    }
    
    // Check if sensor with this sensorId already exists
    const existingSnapshot = await db()
      .collection('sensors')
      .where('sensorId', '==', sensorId)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      res.status(400).json({
        success: false,
        message: 'Sensor with this sensorId already exists',
      });
      return;
    }
    
    const sensorData = {
      sensorId,
      name,
      type,
      location,
      address: address || null,
      status,
      manufacturer: manufacturer || null,
      deviceModel: deviceModel || null,
      installationDate: installationDate ? new Date(installationDate) : null,
      lastMaintenanceDate: null,
      calibrationDate: null,
      parameters,
      metadata,
      alertThresholds: alertThresholds || null,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const sensorRef = await db().collection('sensors').add(sensorData);
    
    res.status(201).json({
      success: true,
      message: 'Sensor created successfully',
      data: {
        id: sensorRef.id,
        ...sensorData,
      },
    });
  } catch (error) {
    logger.error('Create sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sensor',
    });
  }
};

// Update sensor (admin only)
export const updateSensor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated
    delete updateData.createdAt;
    delete updateData.sensorId; // Don't allow changing unique ID
    
    const sensorDoc = await db().collection('sensors').doc(id).get();
    
    if (!sensorDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Sensor not found',
      });
      return;
    }
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    await sensorDoc.ref.update(updateData);
    
    const updatedDoc = await sensorDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Sensor updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Update sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sensor',
    });
  }
};

// Delete sensor (admin only)
export const deleteSensor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sensorDoc = await db().collection('sensors').doc(id).get();
    
    if (!sensorDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Sensor not found',
      });
      return;
    }
    
    await sensorDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'Sensor deleted successfully',
    });
  } catch (error) {
    logger.error('Delete sensor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sensor',
    });
  }
};

// Helper function to calculate distance between coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

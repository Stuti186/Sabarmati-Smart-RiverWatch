/**
 * Drowning Detection Controller
 * Handles AI-based drowning detection from CCTV cameras
 * Sabarmati Riverfront specific
 */

import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { getSabarmatiZone } from '../utils/sabarmatiZones';
import { notifyAuthorities } from './sos.controller';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

export interface DrowningDetection {
  cameraId: string;
  cameraName: string;
  latitude: number;
  longitude: number;
  zone: string;
  confidence: number;
  timestamp: Date;
  frameUrl?: string;
  status: 'detected' | 'verified' | 'false_positive' | 'resolved';
  verifiedBy?: string;
}

/**
 * Submit drowning detection alert (from AI pipeline)
 * POST /api/v1/sos/drowning-detection
 */
export const submitDrowningDetection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cameraId, cameraName, latitude, longitude, confidence, frameUrl } = req.body;

    if (!cameraId || !latitude || !longitude || confidence === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: cameraId, latitude, longitude, confidence',
      });
      return;
    }

    // Only process if confidence >= 0.85 (85%)
    if (confidence < 0.85) {
      res.status(200).json({
        success: true,
        message: 'Detection confidence too low, not triggering alert',
        confidence,
      });
      return;
    }

    // Determine Sabarmati zone
    const zone = getSabarmatiZone(latitude, longitude);

    const detection: DrowningDetection = {
      cameraId,
      cameraName: cameraName || `Camera ${cameraId}`,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      zone: zone || 'Unknown Sabarmati Zone',
      confidence: parseFloat(confidence),
      timestamp: new Date(),
      frameUrl,
      status: 'detected',
    };

    // Save detection
    const docRef = await db().collection('drowning_detections').add(detection);

    // Create SOS incident
    const sosData = {
      userId: 'system',
      latitude: detection.latitude,
      longitude: detection.longitude,
      zone: detection.zone,
      eventType: 'drowning_detection',
      deviceInfo: `AI Detection - Camera ${cameraId}`,
      timestamp: new Date(),
      status: 'active',
      detectionId: docRef.id,
      confidence: detection.confidence,
    };

    const sosRef = await db().collection('sos_emergencies').add(sosData);

    // Notify authorities
    await notifyAuthorities(sosData as any, sosRef.id);

    logger.warn(`Drowning detection alert: ${docRef.id} in zone ${zone} (confidence: ${confidence})`);

    res.status(201).json({
      success: true,
      message: 'Drowning detection alert sent to authorities',
      detectionId: docRef.id,
      incidentId: sosRef.id,
      zone,
      confidence,
    });
  } catch (error: any) {
    logger.error('Drowning detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing drowning detection',
    });
  }
};

/**
 * Get recent drowning detections
 * GET /api/v1/sos/drowning-detections
 */
export const getDrowningDetections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20, status } = req.query;

    let query = db()
      .collection('drowning_detections')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));

    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.get();

    const detections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || doc.data().timestamp,
    }));

    res.status(200).json({
      success: true,
      count: detections.length,
      data: detections,
    });
  } catch (error: any) {
    logger.error('Get drowning detections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drowning detections',
    });
  }
};

/**
 * Verify/Update drowning detection status
 * PATCH /api/v1/sos/drowning-detections/:id
 */
export const updateDrowningDetection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, verifiedBy } = req.body;

    const validStatuses = ['detected', 'verified', 'false_positive', 'resolved'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (verifiedBy) updateData.verifiedBy = verifiedBy;

    await db().collection('drowning_detections').doc(id).update(updateData);

    logger.info(`Drowning detection ${id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Detection status updated',
      data: { id, status },
    });
  } catch (error: any) {
    logger.error('Update drowning detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating detection status',
    });
  }
};


/**
 * SOS Emergency Controller
 * Handles emergency SOS requests, drowning detection alerts, and incident tracking
 * Sabarmati Riverfront specific
 */

import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { SABARMATI_ZONES, getSabarmatiZone } from '../utils/sabarmatiZones';

const db = () => getFirestore();

export interface SOSRequest {
  userId: string;
  latitude: number;
  longitude: number;
  zone: string;
  eventType: 'manual_sos' | 'drowning_detection' | 'other';
  deviceInfo?: string;
  timestamp: Date;
  status: 'active' | 'responded' | 'resolved' | 'false_alarm';
  responseTime?: number;
  notes?: string;
}

/**
 * Submit SOS Emergency
 * POST /api/v1/sos/emergency
 */
export const submitSOS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { latitude, longitude, eventType = 'manual_sos', deviceInfo } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Location is required',
      });
      return;
    }

    // Determine Sabarmati zone
    const zone = getSabarmatiZone(latitude, longitude);

    const sosData: SOSRequest = {
      userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      zone: zone || 'Unknown Sabarmati Zone',
      eventType: eventType as any,
      deviceInfo: deviceInfo || req.headers['user-agent'] || 'Unknown',
      timestamp: new Date(),
      status: 'active',
    };

    // Save to Firestore
    const docRef = await db().collection('sos_emergencies').add(sosData);

    // Notify authorities and lifeguards
    await notifyAuthorities(sosData, docRef.id);

    logger.info(`SOS emergency submitted: ${docRef.id} by user ${userId} in zone ${zone}`);

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent to Sabarmati authorities. Help is on the way.',
      incidentId: docRef.id,
      zone,
      timestamp: sosData.timestamp,
    });
  } catch (error: any) {
    logger.error('Submit SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting SOS emergency',
    });
  }
};

/**
 * Get user's SOS incidents
 * GET /api/v1/sos/incidents
 */
export const getMyIncidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { limit = 20, offset = 0 } = req.query;

    const snapshot = await db()
      .collection('sos_emergencies')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();

    const incidents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || doc.data().timestamp,
    }));

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error: any) {
    logger.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incidents',
    });
  }
};

/**
 * Get active SOS incidents (for authorities/lifeguards)
 * GET /api/v1/sos/active
 */
export const getActiveIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db()
      .collection('sos_emergencies')
      .where('status', '==', 'active')
      .orderBy('timestamp', 'desc')
      .get();

    const incidents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || doc.data().timestamp,
    }));

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error: any) {
    logger.error('Get active incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active incidents',
    });
  }
};

/**
 * Update incident status (for authorities)
 * PATCH /api/v1/sos/incidents/:id
 */
export const updateIncidentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, responseTime } = req.body;

    const validStatuses = ['active', 'responded', 'resolved', 'false_alarm'];
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

    if (notes) updateData.notes = notes;
    if (responseTime) updateData.responseTime = responseTime;

    await db().collection('sos_emergencies').doc(id).update(updateData);

    logger.info(`Incident ${id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Incident status updated',
      data: { id, status },
    });
  } catch (error: any) {
    logger.error('Update incident status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating incident status',
    });
  }
};

/**
 * Notify authorities and lifeguards about SOS
 * Exported for use in drowning detection controller
 */
export async function notifyAuthorities(sosData: SOSRequest, incidentId: string): Promise<void> {
  try {
    // Get nearby lifeguards
    const lifeguardsSnapshot = await db()
      .collection('lifeguards')
      .where('active', '==', true)
      .get();

    const notifications = [];

    // Notify each lifeguard
    for (const lifeguardDoc of lifeguardsSnapshot.docs) {
      const lifeguard = lifeguardDoc.data();
      const distance = calculateDistance(
        sosData.latitude,
        sosData.longitude,
        lifeguard.location?.latitude || 0,
        lifeguard.location?.longitude || 0
      );

      // Only notify if within 5km
      if (distance <= 5000) {
        notifications.push({
          type: 'sos_alert',
          incidentId,
          lifeguardId: lifeguardDoc.id,
          zone: sosData.zone,
          location: {
            latitude: sosData.latitude,
            longitude: sosData.longitude,
          },
          distance,
          timestamp: new Date(),
        });
      }
    }

    // Save notifications
    for (const notification of notifications) {
      await db().collection('lifeguard_notifications').add(notification);
    }

    // Log to control room
    await db().collection('control_room_logs').add({
      type: 'sos_emergency',
      incidentId,
      zone: sosData.zone,
      location: {
        latitude: sosData.latitude,
        longitude: sosData.longitude,
      },
      timestamp: new Date(),
      status: 'pending_response',
    });

    logger.info(`Notified ${notifications.length} lifeguards about SOS ${incidentId}`);
  } catch (error: any) {
    logger.error('Error notifying authorities:', error);
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}


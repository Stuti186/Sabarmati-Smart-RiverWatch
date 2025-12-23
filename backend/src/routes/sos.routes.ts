/**
 * SOS Emergency Routes
 * API endpoints for emergency SOS and drowning detection
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  submitSOS,
  getMyIncidents,
  getActiveIncidents,
  updateIncidentStatus,
} from '../controllers/sos.controller';
import {
  submitDrowningDetection,
  getDrowningDetections,
  updateDrowningDetection,
} from '../controllers/drowningDetection.controller';
import { getAllCameras, getCameraStatus, triggerTestDetection } from '../services/drowningDetectionService';

const router = Router();

// Public routes (for AI detection system)
router.post('/drowning-detection', submitDrowningDetection);
router.get('/drowning-detections', getDrowningDetections);
router.get('/cameras', (req, res) => {
  // Get all cameras (for monitoring dashboard)
  res.json({
    success: true,
    data: getAllCameras(),
  });
});
router.get('/cameras/:id', (req, res) => {
  // Get camera status
  const camera = getCameraStatus(req.params.id);
  if (camera) {
    res.json({ success: true, data: camera });
  } else {
    res.status(404).json({ success: false, message: 'Camera not found' });
  }
});

// Test endpoint to manually trigger a drowning detection (for testing)
router.post('/test-detection/:cameraId', async (req, res) => {
  try {
    const { cameraId } = req.params;
    await triggerTestDetection(cameraId);
    res.json({
      success: true,
      message: `Test drowning detection triggered for camera ${cameraId}`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to trigger test detection',
    });
  }
});

// Protected routes (require authentication)
router.post('/emergency', protect, submitSOS);
router.get('/incidents', protect, getMyIncidents);
router.get('/active', protect, getActiveIncidents); // For authorities/lifeguards
router.patch('/incidents/:id', protect, updateIncidentStatus);
router.patch('/drowning-detections/:id', protect, updateDrowningDetection);

export default router;

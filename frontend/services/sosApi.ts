/**
 * SOS Emergency API Service
 * Frontend service for SOS and emergency features
 */

import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '@/constants';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import * as SMS from 'expo-sms';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/v1`,
  timeout: 10000,
});

// Add auth token interceptor
api.interceptors.request.use(async (config) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('@smart_river_watch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Token retrieval failed, continue without token
  }
  return config;
});

export interface SOSRequest {
  latitude: number;
  longitude: number;
  eventType?: 'manual_sos' | 'drowning_detection' | 'other';
  deviceInfo?: string;
}

export interface SOSIncident {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  zone: string;
  eventType: string;
  timestamp: Date;
  status: 'active' | 'responded' | 'resolved' | 'false_alarm';
  responseTime?: number;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export const sosApi = {
  /**
   * Submit SOS emergency
   */
  submitSOS: async (location: { latitude: number; longitude: number }): Promise<any> => {
    try {
      const response = await api.post('/sos/emergency', {
        latitude: location.latitude,
        longitude: location.longitude,
        eventType: 'manual_sos',
        deviceInfo: 'Mobile App',
      });
      return response.data;
    } catch (error: any) {
      console.error('SOS submission error:', error);
      throw error;
    }
  },

  /**
   * Get user's SOS incidents
   */
  getMyIncidents: async (limit: number = 20, offset: number = 0): Promise<any> => {
    try {
      const response = await api.get('/sos/incidents', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get incidents error:', error);
      throw error;
    }
  },

  /**
   * Get active incidents (for authorities)
   */
  getActiveIncidents: async (): Promise<any> => {
    try {
      const response = await api.get('/sos/active');
      return response.data;
    } catch (error: any) {
      console.error('Get active incidents error:', error);
      throw error;
    }
  },

  /**
   * Update incident status
   */
  updateIncidentStatus: async (
    incidentId: string,
    status: string,
    notes?: string
  ): Promise<any> => {
    try {
      const response = await api.patch(`/sos/incidents/${incidentId}`, {
        status,
        notes,
      });
      return response.data;
    } catch (error: any) {
      console.error('Update incident status error:', error);
      throw error;
    }
  },

  /**
   * Get drowning detections (for authorities/dashboard)
   */
  getDrowningDetections: async (limit: number = 20, status?: string): Promise<any> => {
    try {
      const response = await api.get('/sos/drowning-detections', {
        params: { limit, status },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get drowning detections error:', error);
      throw error;
    }
  },

  /**
   * Trigger test detection (for testing purposes)
   */
  triggerTestDetection: async (cameraId: string): Promise<any> => {
    try {
      const response = await api.post(`/sos/test-detection/${cameraId}`);
      return response.data;
    } catch (error: any) {
      console.error('Trigger test detection error:', error);
      throw error;
    }
  },
};

/**
 * Emergency utilities
 */
export const emergencyUtils = {
  /**
   * Get current location
   */
  getCurrentLocation: async (): Promise<{ latitude: number; longitude: number }> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Get location error:', error);
      throw error;
    }
  },

  /**
   * Call emergency contact
   */
  callContact: async (phone: string): Promise<void> => {
    try {
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Cannot make phone call');
      }
    } catch (error) {
      console.error('Call contact error:', error);
      throw error;
    }
  },

  /**
   * Send SMS with location (using Linking)
   */
  sendLocationSMS: async (
    phone: string,
    location: { latitude: number; longitude: number },
    zone: string
  ): Promise<void> => {
    try {
      const message = `I need help at Sabarmati Riverfront. My location: ${location.latitude}, ${location.longitude} (${zone}). Please help!`;
      const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Cannot send SMS');
      }
    } catch (error) {
      console.error('Send SMS error:', error);
      throw error;
    }
  },

  /**
   * Get Google Maps link for location
   */
  getMapsLink: (latitude: number, longitude: number): string => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  },
};


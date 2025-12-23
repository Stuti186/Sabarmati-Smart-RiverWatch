/**
 * Backend Health Check Service
 * Monitors backend availability and manages retry logic
 */

import axios from 'axios';
import { API_CONFIG } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const HEALTH_CHECK_ENDPOINT = '/health';
const HEALTH_CHECK_KEY = '@backend_health_status';
const HEALTH_CHECK_TIMESTAMP = '@backend_health_timestamp';
let lastWarnTs = 0;

export interface HealthStatus {
  isOnline: boolean;
  lastChecked: Date | null;
  retryCount: number;
  service?: string;
}

let healthStatus: HealthStatus = {
  isOnline: false,
  lastChecked: null,
  retryCount: 0,
};

/**
 * Check backend health with retry logic
 */
function normalizeBaseURL(): string {
  let base = API_CONFIG.BASE_URL || '';
  // Strip /api/v1 if present
  base = base.replace(/\/api\/v1\/?$/, '');
  // Trim trailing slash
  base = base.replace(/\/$/, '');
  // Android emulator cannot reach localhost
  if (Platform.OS === 'android') {
    base = base.replace('http://127.0.0.1', 'http://10.0.2.2').replace('http://localhost', 'http://10.0.2.2');
  }
  return base;
}

export async function checkBackendHealth(retries: number = 2, delay: number = 500): Promise<HealthStatus> {
  const baseURL = normalizeBaseURL();

  const api = axios.create({
    baseURL,
    timeout: 5000, // 5 second timeout
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get(HEALTH_CHECK_ENDPOINT);
      
      if (response.data?.status === 'ok' || response.status === 200) {
        healthStatus = {
          isOnline: true,
          lastChecked: new Date(),
          retryCount: 0,
          service: response.data?.service || 'sabarmati-biodiversity-api',
        };
        
        // Cache health status
        await AsyncStorage.setItem(HEALTH_CHECK_KEY, JSON.stringify(healthStatus));
        await AsyncStorage.setItem(HEALTH_CHECK_TIMESTAMP, new Date().toISOString());
        
        console.log('✅ Backend health check: ONLINE');
        return healthStatus;
      }
    } catch (error: any) {
      const now = Date.now();
      if (now - lastWarnTs > 20000) {
        console.warn(`Backend health check attempt ${attempt}/${retries} failed:`, error?.message || 'Network Error');
        lastWarnTs = now;
      }
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  healthStatus = {
    isOnline: false,
    lastChecked: new Date(),
    retryCount: retries,
  };
  
  await AsyncStorage.setItem(HEALTH_CHECK_KEY, JSON.stringify(healthStatus));
  await AsyncStorage.setItem(HEALTH_CHECK_TIMESTAMP, new Date().toISOString());
  
  const now = Date.now();
  if (now - lastWarnTs > 20000) {
    console.warn('❌ Backend health check: OFFLINE');
    lastWarnTs = now;
  }
  return healthStatus;
}

/**
 * Get cached health status
 */
export async function getCachedHealthStatus(): Promise<HealthStatus | null> {
  try {
    const cached = await AsyncStorage.getItem(HEALTH_CHECK_KEY);
    const timestamp = await AsyncStorage.getItem(HEALTH_CHECK_TIMESTAMP);
    
    if (cached && timestamp) {
      const status = JSON.parse(cached);
      const lastChecked = new Date(timestamp);
      const age = Date.now() - lastChecked.getTime();
      
      // If cache is less than 1 minute old, use it
      if (age < 60000) {
        return {
          ...status,
          lastChecked,
        };
      }
    }
  } catch (error) {
    console.error('Error reading cached health status:', error);
  }
  
  return null;
}

/**
 * Get current health status (cached or check)
 */
export async function getHealthStatus(forceCheck: boolean = false): Promise<HealthStatus> {
  if (!forceCheck) {
    const cached = await getCachedHealthStatus();
    if (cached) {
      healthStatus = cached;
      return cached;
    }
  }
  
  return await checkBackendHealth();
}

/**
 * Check if backend is currently online
 */
export function isBackendOnline(): boolean {
  return healthStatus.isOnline;
}

/**
 * Set health status manually (for testing)
 */
export function setHealthStatus(status: HealthStatus): void {
  healthStatus = status;
}


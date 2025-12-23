/**
 * Temperature Leader Service
 * Implements a leader-follower pattern for intranet temperature sync
 * One device acts as leader (controls temperature), others follow (display synced values)
 */

import { API_CONFIG } from '@/constants';
import axios from 'axios';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/v1`,
  timeout: 5000, // Increased timeout for network reliability
});

// Add request interceptor for debugging (only log first error, then silence)
let errorLogged = false;
let lastErrorTime = 0;

if (__DEV__) {
  api.interceptors.request.use(
    (config) => {
      // Only log requests occasionally to reduce spam
      if (Math.random() < 0.1) { // Log 10% of requests
        console.log('🌡️ Temperature Sync Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
        });
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      // Reset error flag on success
      if (response.status === 200) {
        errorLogged = false;
      }
      return response;
    },
    (error) => {
      // Only log network errors once every 10 seconds to reduce spam
      const now = Date.now();
      if (!errorLogged || (now - lastErrorTime > 10000)) {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.warn('🌡️ Temperature Sync: Backend offline or unreachable. Check:', {
            url: `${error.config?.baseURL}${error.config?.url}`,
            hint: 'Make sure backend is running and EXPO_PUBLIC_API_URL is set correctly',
          });
          errorLogged = true;
          lastErrorTime = now;
        } else {
          // Log non-network errors normally
          console.error('🌡️ Temperature Sync Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
          });
        }
      }
      return Promise.reject(error);
    }
  );
}

interface TemperatureState {
  temperature: number;
  heatMode: boolean;
  coolMode: boolean;
  lastUpdated: string;
  deviceId: string;
  leaderDeviceId?: string;
}

let isLeader = false;
let leaderDeviceId: string | null = null;
let currentState: TemperatureState | null = null;
let syncInterval: NodeJS.Timeout | null = null;
let updateCallbacks: Array<(state: TemperatureState) => void> = [];

// Generate unique device ID (persists for this session)
const DEVICE_ID = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Check if this device should be the leader
 * Leader = device that has heatMode or coolMode active
 */
export function shouldBeLeader(heatMode: boolean, coolMode: boolean): boolean {
  return heatMode || coolMode;
}

/**
 * Get current temperature state from server
 */
export async function getTemperatureState(): Promise<TemperatureState | null> {
  try {
    const response = await api.get('/water-quality/temperature-state');
    return response.data;
  } catch (error: any) {
    // Silently fail if backend is offline
    return null;
  }
}

/**
 * Update temperature state on server (only if this device is leader)
 */
export async function updateTemperatureState(
  state: Partial<TemperatureState>,
  forceUpdate: boolean = false
): Promise<boolean> {
  try {
    // Only update if we're the leader or forcing update
    if (!isLeader && !forceUpdate) {
      return false;
    }

    const payload = {
      ...state,
      deviceId: DEVICE_ID,
      leaderDeviceId: isLeader ? DEVICE_ID : leaderDeviceId,
      lastUpdated: new Date().toISOString(),
    };
    
    await api.post('/water-quality/temperature-state', payload);
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Start syncing temperature state (polling every 200ms for fast sync)
 */
export function startTemperatureSync(
  onUpdate: (state: TemperatureState) => void,
  checkLeader: () => { heatMode: boolean; coolMode: boolean }
): () => void {
  // Add callback
  updateCallbacks.push(onUpdate);

  // Start polling if not already started
  if (!syncInterval) {
    syncInterval = setInterval(async () => {
      try {
        const state = await getTemperatureState();
        if (state) {
          // Update leader info
          if (state.leaderDeviceId) {
            leaderDeviceId = state.leaderDeviceId;
            isLeader = leaderDeviceId === DEVICE_ID;
          }

          // Check if we should become leader
          const { heatMode, coolMode } = checkLeader();
          if (shouldBeLeader(heatMode, coolMode) && !isLeader) {
            // This device should become leader
            isLeader = true;
            leaderDeviceId = DEVICE_ID;
            // Immediately update server with our state
            updateTemperatureState({
              temperature: state.temperature,
              heatMode,
              coolMode,
            }, true);
          }

          // Compare state properly (very small threshold for perfect sync)
          const hasChanged = !currentState || 
            Math.abs(state.temperature - currentState.temperature) > 0.01 ||
            state.heatMode !== currentState.heatMode ||
            state.coolMode !== currentState.coolMode ||
            state.leaderDeviceId !== currentState.leaderDeviceId;
          
          if (hasChanged) {
            currentState = state;
            // Notify all callbacks
            updateCallbacks.forEach(callback => callback(state));
          }
        }
      } catch (error) {
        // Silently fail - will retry on next interval
      }
    }, 200); // Poll every 200ms for very fast sync
  }

  // Return cleanup function
  return () => {
    const index = updateCallbacks.indexOf(onUpdate);
    if (index > -1) {
      updateCallbacks.splice(index, 1);
    }

    // Stop polling if no more callbacks
    if (updateCallbacks.length === 0 && syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  };
}

/**
 * Stop all temperature syncing
 */
export function stopTemperatureSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  updateCallbacks = [];
  currentState = null;
  isLeader = false;
  leaderDeviceId = null;
}

/**
 * Get current leader status
 */
export function getIsLeader(): boolean {
  return isLeader;
}

/**
 * Get leader device ID
 */
export function getLeaderDeviceId(): string | null {
  return leaderDeviceId;
}


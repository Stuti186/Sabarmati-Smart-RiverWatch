/**
 * Temperature Sync Service
 * Syncs temperature state across all Expo devices in real-time
 */

import { API_CONFIG } from '@/constants';
import axios from 'axios';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/v1`,
  timeout: 5000,
});

interface TemperatureState {
  temperature: number;
  heatMode: boolean;
  coolMode: boolean;
  lastUpdated: string;
  deviceId: string;
}

let currentState: TemperatureState | null = null;
let syncInterval: NodeJS.Timeout | null = null;
let updateCallbacks: Array<(state: TemperatureState) => void> = [];

/**
 * Get current temperature state from server
 */
export async function getTemperatureState(): Promise<TemperatureState | null> {
  try {
    const response = await api.get('/water-quality/temperature-state');
    return response.data;
  } catch (error: any) {
    // Silently fail if backend is offline - don't spam console
    if (error.code !== 'NETWORK_ERROR' && error.message !== 'Network Error') {
      // Only log non-network errors
      console.debug('Temperature sync: Backend offline or unavailable');
    }
    return null;
  }
}

/**
 * Update temperature state on server
 */
export async function updateTemperatureState(state: Partial<TemperatureState>): Promise<boolean> {
  try {
    const deviceId = `expo-${Date.now()}`; // Simple device ID
    const payload = {
      ...state,
      deviceId,
      lastUpdated: new Date().toISOString(),
    };
    
    await api.post('/water-quality/temperature-state', payload);
    return true;
  } catch (error: any) {
    // Silently fail if backend is offline - don't spam console
    if (error.code !== 'NETWORK_ERROR' && error.message !== 'Network Error') {
      // Only log non-network errors
      console.debug('Temperature sync: Backend offline or unavailable');
    }
    return false;
  }
}

/**
 * Start syncing temperature state (polling every 1 second)
 */
export function startTemperatureSync(
  onUpdate: (state: TemperatureState) => void
): () => void {
  // Add callback
  updateCallbacks.push(onUpdate);

  // Start polling if not already started
  if (!syncInterval) {
    let consecutiveFailures = 0;
    syncInterval = setInterval(async () => {
      try {
        const state = await getTemperatureState();
        if (state) {
          // Compare state properly (check if temperature or modes changed)
          // Use very small threshold (0.01°C) for perfect sync
          const hasChanged = !currentState || 
            Math.abs(state.temperature - currentState.temperature) > 0.01 ||
            state.heatMode !== currentState.heatMode ||
            state.coolMode !== currentState.coolMode;
          
          if (hasChanged) {
            currentState = state;
            consecutiveFailures = 0; // Reset on success
            // Notify all callbacks
            updateCallbacks.forEach(callback => callback(state));
          }
        }
      } catch (error) {
        consecutiveFailures++;
        // Reduce polling frequency if backend is consistently offline
        if (consecutiveFailures > 10) {
          // Backend seems offline, reduce to every 5 seconds
          clearInterval(syncInterval!);
          syncInterval = setInterval(async () => {
            try {
              const state = await getTemperatureState();
              if (state) {
                const hasChanged = !currentState || 
                  Math.abs(state.temperature - currentState.temperature) > 0.01 ||
                  state.heatMode !== currentState.heatMode ||
                  state.coolMode !== currentState.coolMode;
                
                if (hasChanged) {
                  currentState = state;
                  consecutiveFailures = 0;
                  updateCallbacks.forEach(callback => callback(state));
                }
              }
            } catch (error) {
              // Silently fail
            }
          }, 5000);
        }
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
}


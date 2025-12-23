/**
 * Offline Sync Service
 * Syncs queued sightings when backend comes online
 */

import { biodiversityApi } from './biodiversityApi';
import { getOfflineSightingsQueue, clearOfflineSightingsQueue } from './offlineData';
import { checkBackendHealth } from './backendHealth';
import { logger } from '@/utils/logger';

/**
 * Sync queued sightings when backend is online
 */
export async function syncQueuedSightings(): Promise<{ success: number; failed: number }> {
  const queue = await getOfflineSightingsQueue();
  
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }

  // Check if backend is online
  const health = await checkBackendHealth();
  if (!health.isOnline) {
    console.log('Backend still offline, keeping sightings in queue');
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const sighting of queue) {
    try {
      const result = await biodiversityApi.submitSighting(sighting);
      if (!result.queued) {
        success++;
        console.log(`✅ Synced queued sighting: ${sighting.speciesName || 'Unknown'}`);
      }
    } catch (error) {
      failed++;
      console.error('Failed to sync queued sighting:', error);
    }
  }

  // Clear queue if all synced successfully
  if (failed === 0) {
    await clearOfflineSightingsQueue();
    console.log(`✅ Synced ${success} queued sightings`);
  }

  return { success, failed };
}

/**
 * Auto-sync when app comes online
 */
export function startAutoSync(interval: number = 30000): () => void {
  const syncInterval = setInterval(async () => {
    const health = await checkBackendHealth();
    if (health.isOnline) {
      await syncQueuedSightings();
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(syncInterval);
}


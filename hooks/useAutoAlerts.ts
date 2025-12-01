/**
 * useAutoAlerts Hook
 * Monitors data thresholds and automatically triggers notifications
 */

import { useEffect, useRef } from 'react';
import { useStore } from '@/services/store';
import { checkAllThresholds } from '@/services/autoAlerts';

const CHECK_INTERVAL = 5000; // Check every 5 seconds (same as data updates)

export function useAutoAlerts() {
  const sensors = useStore((state) => state.sensors);
  const floodData = useStore((state) => state.floodData);
  const safetyAlerts = useStore((state) => state.safetyAlerts);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check thresholds immediately when data changes
    if (sensors.length > 0) {
      checkAllThresholds({
        sensors,
        floodData,
        safetyAlerts,
      });
    }

    // Set up interval to check thresholds periodically
    intervalRef.current = setInterval(() => {
      const state = useStore.getState();
      if (state.sensors.length > 0) {
        checkAllThresholds({
          sensors: state.sensors,
          floodData: state.floodData,
          safetyAlerts: state.safetyAlerts,
        });
      }
    }, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sensors.length, floodData?.currentRisk, safetyAlerts.length]); // Re-run when key data changes

  return null;
}

/**
 * Hook to start auto-alerts (call once in App.tsx)
 */
export function useStartAutoAlerts() {
  useAutoAlerts();
}


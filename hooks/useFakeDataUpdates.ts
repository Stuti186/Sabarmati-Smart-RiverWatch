/**
 * useFakeDataUpdates Hook
 * Manages automatic fake data updates every 5 seconds
 */

import { useEffect, useRef } from 'react';
import { useStore } from '@/services/store';
import {
  generateAllFakeData,
  updateAllFakeData,
} from '@/services/fakeData';

const UPDATE_INTERVAL = 5000; // 5 seconds

export function useFakeDataUpdates() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize data on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      const initialData = generateAllFakeData();
      
      useStore.setState({
        sensors: initialData.sensors,
        wasteDetections: initialData.wasteDetections,
        floodData: initialData.floodData,
        floodAlerts: initialData.floodAlerts,
        biodiversity: initialData.biodiversity,
        safetyAlerts: initialData.safetyAlerts,
        unsafeZones: initialData.unsafeZones,
        waterLevel: initialData.waterLevel,
        citizenReports: initialData.citizenReports,
        lastUpdateTime: new Date().toISOString(),
      });
      
      isInitializedRef.current = true;
    }
  }, []);

  // Set up update interval
  useEffect(() => {
    const updateData = () => {
      const state = useStore.getState();
      
      // Only update if we have initial data
      if (!state.floodData || !state.waterLevel) {
        return;
      }

      const currentData = {
        sensors: state.sensors,
        wasteDetections: state.wasteDetections,
        floodData: state.floodData,
        floodAlerts: state.floodAlerts,
        biodiversity: state.biodiversity,
        safetyAlerts: state.safetyAlerts,
        unsafeZones: state.unsafeZones,
        waterLevel: state.waterLevel,
        citizenReports: state.citizenReports,
      };

      const updatedData = updateAllFakeData(currentData);

      // Update all data in store
      useStore.setState({
        sensors: updatedData.sensors,
        wasteDetections: updatedData.wasteDetections,
        floodData: updatedData.floodData,
        floodAlerts: updatedData.floodAlerts,
        biodiversity: updatedData.biodiversity,
        safetyAlerts: updatedData.safetyAlerts,
        unsafeZones: updatedData.unsafeZones,
        waterLevel: updatedData.waterLevel,
        citizenReports: updatedData.citizenReports,
        lastUpdateTime: new Date().toISOString(),
      });
    };

    // Start interval
    intervalRef.current = setInterval(updateData, UPDATE_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - interval runs independently

  return {
    lastUpdateTime: useStore.getState().lastUpdateTime,
  };
}

/**
 * Hook to start fake data updates (call once in App.tsx or root component)
 */
export function useStartFakeDataEngine() {
  useFakeDataUpdates();
}


/**
 * Zustand Global State Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SensorData } from '@/utils/sensorData';
import type { WasteDetection } from '@/utils/wasteData';
import type { FloodRiskData } from '@/utils/floodPrediction';
import type { SafetyAlert } from '@/utils/safetyAlerts';
import type { FloodAlert } from '@/utils/floodAlerts';
import type { UnsafeZone } from '@/utils/unsafeZones';
import type { WaterLevelData } from '@/utils/waterLevel';
import type {
  BiodiversityData,
  MockCitizenReport,
} from './fakeData';

// Types
export interface WaterQualityData {
  pH: number;
  DO: number;
  BOD: number;
  COD: number;
  turbidity: number;
  temperature: number;
  tds: number;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Alert {
  id: string;
  type: 'water_quality' | 'flood' | 'safety' | 'waste' | 'maintenance';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences: {
    notifications: boolean;
    waterQualityAlerts: boolean;
    floodAlerts: boolean;
    safetyAlerts: boolean;
  };
}

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  
  // Water quality data
  waterQualityData: WaterQualityData[];
  setWaterQualityData: (data: WaterQualityData[]) => void;
  addWaterQualityData: (data: WaterQualityData) => void;
  
  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  
  // Fake data state
  sensors: SensorData[];
  setSensors: (sensors: SensorData[]) => void;
  
  wasteDetections: WasteDetection[];
  setWasteDetections: (detections: WasteDetection[]) => void;
  
  floodData: FloodRiskData | null;
  setFloodData: (data: FloodRiskData) => void;
  
  floodAlerts: FloodAlert[];
  setFloodAlerts: (alerts: FloodAlert[]) => void;
  
  biodiversity: BiodiversityData[];
  setBiodiversity: (data: BiodiversityData[]) => void;
  
  safetyAlerts: SafetyAlert[];
  setSafetyAlerts: (alerts: SafetyAlert[]) => void;
  
  unsafeZones: UnsafeZone[];
  setUnsafeZones: (zones: UnsafeZone[]) => void;
  
  waterLevel: WaterLevelData | null;
  setWaterLevel: (data: WaterLevelData) => void;
  
  citizenReports: MockCitizenReport[];
  setCitizenReports: (reports: MockCitizenReport[]) => void;
  
  // Data update state
  lastUpdateTime: string | null;
  setLastUpdateTime: (time: string) => void;
  
  // UI state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      // Water quality data
      waterQualityData: [],
      setWaterQualityData: (data) => set({ waterQualityData: data }),
      addWaterQualityData: (data) =>
        set((state) => ({
          waterQualityData: [data, ...state.waterQualityData].slice(0, 100), // Keep last 100 readings
        })),
      
      // Alerts
      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
        })),
      markAlertAsRead: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, read: true } : alert
          ),
        })),
      clearAllAlerts: () => set({ alerts: [] }),
      
      // Fake data state
      sensors: [],
      setSensors: (sensors) => set({ sensors }),
      
      wasteDetections: [],
      setWasteDetections: (detections) => set({ wasteDetections: detections }),
      
      floodData: null,
      setFloodData: (data) => set({ floodData: data }),
      
      floodAlerts: [],
      setFloodAlerts: (alerts) => set({ floodAlerts: alerts }),
      
      biodiversity: [],
      setBiodiversity: (data) => set({ biodiversity: data }),
      
      safetyAlerts: [],
      setSafetyAlerts: (alerts) => set({ safetyAlerts: alerts }),
      
      unsafeZones: [],
      setUnsafeZones: (zones) => set({ unsafeZones: zones }),
      
      waterLevel: null,
      setWaterLevel: (data) => set({ waterLevel: data }),
      
      citizenReports: [],
      setCitizenReports: (reports) => set({ citizenReports: reports }),
      
      // Data update state
      lastUpdateTime: null,
      setLastUpdateTime: (time) => set({ lastUpdateTime: time }),
      
      // UI state
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      // Loading states
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'smart-river-watch-storage',
      storage: createJSONStorage(() => 
        Platform.OS === 'web' 
          ? {
              getItem: (name: string) => {
                try {
                  return Promise.resolve(localStorage.getItem(name));
                } catch (e) {
                  return Promise.resolve(null);
                }
              },
              setItem: (name: string, value: string) => {
                try {
                  localStorage.setItem(name, value);
                  return Promise.resolve();
                } catch (e) {
                  return Promise.resolve();
                }
              },
              removeItem: (name: string) => {
                try {
                  localStorage.removeItem(name);
                  return Promise.resolve();
                } catch (e) {
                  return Promise.resolve();
                }
              },
            }
          : AsyncStorage
      ),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        alerts: state.alerts,
      }),
    }
  )
);


/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.smartriverwatch.com',
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Smart River Watch',
  VERSION: '1.0.0',
  DESCRIPTION: 'Smart management platform for Sabarmati Riverfront and urban water bodies',
};

// Water Quality Parameters
export const WATER_QUALITY_PARAMS = {
  pH: { min: 6.5, max: 8.5, unit: 'pH' },
  DO: { min: 5, max: 20, unit: 'mg/L' }, // Dissolved Oxygen
  BOD: { min: 0, max: 3, unit: 'mg/L' }, // Biological Oxygen Demand
  COD: { min: 0, max: 250, unit: 'mg/L' }, // Chemical Oxygen Demand
  TURBIDITY: { min: 0, max: 5, unit: 'NTU' },
  TEMPERATURE: { min: 15, max: 35, unit: '°C' },
  TDS: { min: 0, max: 500, unit: 'mg/L' }, // Total Dissolved Solids
};

// Alert Types
export const ALERT_TYPES = {
  WATER_QUALITY: 'water_quality',
  FLOOD: 'flood',
  SAFETY: 'safety',
  WASTE: 'waste',
  MAINTENANCE: 'maintenance',
} as const;

// Issue Report Types
export const ISSUE_TYPES = {
  WASTE: 'waste',
  POLLUTION: 'pollution',
  SAFETY: 'safety',
  VANDALISM: 'vandalism',
  OTHER: 'other',
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 23.0225, // Ahmedabad/Sabarmati Riverfront
  DEFAULT_LONGITUDE: 72.5714,
  DEFAULT_ZOOM: 13,
  REGION_DELTA: {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
};

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  WATER_QUALITY: 'water-quality-alerts',
  FLOOD: 'flood-alerts',
  SAFETY: 'safety-alerts',
  GENERAL: 'general-notifications',
} as const;

export default {
  API_CONFIG,
  APP_CONFIG,
  WATER_QUALITY_PARAMS,
  ALERT_TYPES,
  ISSUE_TYPES,
  MAP_CONFIG,
  NOTIFICATION_CHANNELS,
};


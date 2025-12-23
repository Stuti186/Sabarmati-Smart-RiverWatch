/**
 * Get Backend URL Utility
 * Handles monorepo-specific backend URL detection for Expo Go devices
 */

import { Platform } from 'react-native';

// Try to import expo-constants, fallback if not available
let Constants: any = null;
try {
  Constants = require('expo-constants').default;
} catch {
  // expo-constants not available, use fallback
  Constants = {
    isDevice: true,
    executionEnvironment: 'standalone',
  };
}

/**
 * Get the backend URL, handling different environments
 */
export function getBackendUrl(): string {
  // 1. Check environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // 2. For development, try to detect the correct URL
  if (__DEV__) {
    // On Android emulator, use 10.0.2.2 instead of localhost
    if (Platform.OS === 'android') {
      // Check if we're in an emulator
      const isEmulator = Constants.executionEnvironment === 'standalone' || 
                        Constants.executionEnvironment === 'storeClient';
      
      if (isEmulator || Constants.isDevice === false) {
        return 'http://10.0.2.2:3000';
      }
      
      // For physical Android device, need actual IP (will be set via env)
      return 'http://localhost:3000';
    }
    
    // iOS simulator can use localhost
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000';
    }
    
    // Web can use localhost
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    }
  }

  // 3. Production fallback
  return 'https://api.smartriverwatch.com';
}

/**
 * Get backend URL with logging for debugging
 */
export function getBackendUrlWithLogging(): string {
  const url = getBackendUrl();
  
  if (__DEV__) {
    console.log('🌐 Backend URL Configuration:');
    console.log('  - Platform:', Platform.OS);
    console.log('  - Environment:', __DEV__ ? 'development' : 'production');
    console.log('  - EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'not set');
    console.log('  - Final Backend URL:', url);
    console.log('  - Device Info:', {
      isDevice: Constants.isDevice,
      executionEnvironment: Constants.executionEnvironment,
    });
  }
  
  return url;
}

/**
 * Validate backend URL format
 */
export function isValidBackendUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}


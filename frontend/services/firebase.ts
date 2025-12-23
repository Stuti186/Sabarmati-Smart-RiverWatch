/**
 * Firebase Configuration and Services
 */

import Constants from 'expo-constants';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// Firebase configuration
// TODO: Replace with your actual Firebase config
// Get these values from Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'your-app-id',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only log Firebase config if it's actually configured (not placeholder values)
// Suppress logging when using placeholder values to reduce console noise
const isConfigured = firebaseConfig.apiKey !== 'your-api-key' && 
                     firebaseConfig.projectId !== 'your-project-id' &&
                     firebaseConfig.apiKey !== undefined &&
                     firebaseConfig.projectId !== undefined;

if (isConfigured) {
  console.log('🔥 Firebase Config Loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
}

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | null = null;

// Check if Firebase config is valid (not placeholder values)
const isFirebaseConfigured = 
  firebaseConfig.apiKey !== 'your-api-key' &&
  firebaseConfig.projectId !== 'your-project-id' &&
  firebaseConfig.apiKey !== undefined &&
  firebaseConfig.projectId !== undefined &&
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.projectId.length > 0;

if (isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      // Initialize Auth with persistence
      try {
        const ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
        const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
      } catch (e) {
        console.warn('Failed to initialize Auth with persistence, falling back to default:', e);
        auth = getAuth(app);
      }
      
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Initialize Analytics only on web (and only if config is valid)
      if (Constants.platform?.web && firebaseConfig.measurementId) {
        try {
          analytics = getAnalytics(app);
        } catch (analyticsError) {
          console.warn('Firebase Analytics initialization failed:', analyticsError);
          analytics = null;
        }
      }
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      if (Constants.platform?.web && firebaseConfig.measurementId) {
        try {
          analytics = getAnalytics(app);
        } catch (analyticsError) {
          console.warn('Firebase Analytics initialization failed:', analyticsError);
          analytics = null;
        }
      }
    }
  } catch (error) {
    console.warn('Firebase initialization error:', error);
    console.warn('App will continue without Firebase features. Please configure Firebase for full functionality.');
    // Don't throw - let the app continue without Firebase
  }
} else {
  // Suppress warnings when Firebase is not configured - this is expected in development
  // Users can configure Firebase when ready by following ENV_SETUP_GUIDE.md
  // Only log once on app start to avoid console spam
  if (__DEV__ && !global._firebaseWarningShown) {
    global._firebaseWarningShown = true;
    console.log('ℹ️  Firebase not configured. Running in development mode.');
    console.log('ℹ️  To enable Firebase, see ENV_SETUP_GUIDE.md');
  }
}

export { analytics, app, auth, db, storage };
export default app;


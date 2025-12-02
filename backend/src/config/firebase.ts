import admin from 'firebase-admin';
import { config } from './config';
import { logger } from '../utils/logger';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

export const initializeFirebase = (): void => {
  try {
    // Initialize with service account if provided, otherwise use default credentials
    if (config.firebaseServiceAccount) {
      const serviceAccount = JSON.parse(config.firebaseServiceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // For development, you can use application default credentials
      admin.initializeApp();
    }

    db = admin.firestore();
    auth = admin.auth();
    
    logger.info('✅ Firebase initialized successfully');
  } catch (error) {
    logger.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return db;
};

export const getAuth = (): admin.auth.Auth => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
  }
  return auth;
};

export { admin };

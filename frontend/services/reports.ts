/**
 * Reports Service
 * Submit citizen reports via Backend API (bypasses Firestore permissions)
 */

import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL
const BACKEND_URL = 'http://10.170.5.243:3000/api/v1';

export interface CitizenReport {
  id?: string;
  userId: string;
  userEmail?: string;
  issueType: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
  timestamp: Date | any; // Can be Timestamp or Date
  status: 'pending' | 'reviewed' | 'resolved';
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadReportImage(
  imageUri: string,
  reportId: string
): Promise<string> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    if (!storage) throw new Error('Storage not initialized');
    const imageRef = ref(storage, `reports/${reportId}/${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Submit a citizen report
 * Attempts Firestore write first, always mirrors data in AsyncStorage.
 */
export async function submitReport(
  issueType: string,
  description: string,
  location: { latitude: number; longitude: number },
  imageUri?: string
): Promise<string> {
  try {
    console.log('=== SUBMIT REPORT DEBUG ===');
    console.log('Submitting report...');
    
    // Get current user ID (DEV or Firebase)
    const userId = auth?.currentUser?.uid || 'dev-user-123';
    const userEmail = auth?.currentUser?.email || 'test@example.com';
    
    console.log('👤 User ID:', userId);
    console.log('📧 User Email:', userEmail);
    
    // Generate unique local report ID
    const localReportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let firestoreDocId: string | null = null;

    // Write to Firestore when available so cloud + local remain in sync.
    if (db) {
      try {
        const reportPayload = {
          userId,
          userEmail,
          issueType,
          description,
          location,
          imageUrl: imageUri || '',
          status: 'pending' as const,
          timestamp: Timestamp.now(),
          createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'reports'), reportPayload);
        firestoreDocId = docRef.id;
        console.log('🌐 Firestore report created:', firestoreDocId);
      } catch (firestoreError: any) {
        console.warn('⚠️ Firestore write skipped:', firestoreError?.message || firestoreError);
      }
    } else {
      console.warn('⚠️ Firestore not initialized — skipping cloud write');
    }

    // Prepare data for local persistence (always stored)
    const reportData = {
      id: firestoreDocId || localReportId,
      userId,
      userEmail,
      issueType,
      description,
      location,
      imageUrl: imageUri || '',
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
      syncedWithCloud: Boolean(firestoreDocId),
    };

    console.log('📝 Report data prepared:', reportData);
    
    // Save to AsyncStorage
    const reportsKey = '@smart_river_watch_reports';
    const existingReportsJson = await AsyncStorage.getItem(reportsKey);
    const existingReports = existingReportsJson ? JSON.parse(existingReportsJson) : [];
    
    existingReports.push(reportData);
    
    await AsyncStorage.setItem(reportsKey, JSON.stringify(existingReports));
    console.log('✅ Report saved locally! ID:', reportData.id);
    console.log('📦 Total reports stored:', existingReports.length);

    return reportData.id;
  } catch (error: any) {
    console.error('❌ ERROR SUBMITTING REPORT ❌');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    throw new Error(
      `Failed to submit report: ${error?.message || 'Unknown error'}`
    );
  }
}

/**
 * Fetch user's reports from Firebase
 */
export async function getUserReports(): Promise<CitizenReport[]> {
  try {
    if (!auth) throw new Error('Auth not initialized');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to fetch reports');
    }

    if (!db) throw new Error('Firestore not initialized');

    const reportsQuery = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(reportsQuery);
    const reports: CitizenReport[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate
        ? data.timestamp.toDate()
        : data.timestamp || new Date();

      reports.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        issueType: data.issueType,
        description: data.description,
        location: data.location,
        imageUrl: data.imageUrl,
        timestamp,
        status: data.status || 'pending',
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
}

/**
 * Get status color
 */
export function getReportStatusColor(
  status: CitizenReport['status']
): string {
  switch (status) {
    case 'pending':
      return '#FFCC00'; // Warning Yellow
    case 'reviewed':
      return '#1E90FF'; // Primary Blue
    case 'resolved':
      return '#32CD32'; // Eco Green
  }
}

/**
 * Get status label
 */
export function getReportStatusLabel(status: CitizenReport['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'reviewed':
      return 'In Review';
    case 'resolved':
      return 'Resolved';
  }
}


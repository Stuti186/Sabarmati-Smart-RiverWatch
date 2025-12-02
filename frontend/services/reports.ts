/**
 * Reports Service
 * Submit citizen reports to Firebase
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
 * Submit a citizen report to Firebase
 */
export async function submitReport(
  issueType: string,
  description: string,
  location: { latitude: number; longitude: number },
  imageUri?: string
): Promise<string> {
  try {
    if (!auth) throw new Error('Auth not initialized');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to submit reports');
    }

    // Create report document
    const reportData = {
      userId: user.uid,
      userEmail: user.email,
      issueType,
      description,
      location,
      timestamp: Timestamp.now(),
      status: 'pending',
      imageUrl: '',
    };

    if (!db) throw new Error('Firestore not initialized');
    // Add report to Firestore
    const docRef = await addDoc(collection(db, 'reports'), reportData);

    // Upload image if provided
    if (imageUri) {
      try {
        const imageUrl = await uploadReportImage(imageUri, docRef.id);
        // Update report with image URL
        await updateDoc(doc(db, 'reports', docRef.id), {
          imageUrl,
        });
      } catch (imageError) {
        console.error('Error uploading image, but report saved:', imageError);
        // Report is saved even if image upload fails
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
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


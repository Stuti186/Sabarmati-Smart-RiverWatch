/**
 * Expo Notifications Service
 * Complete notification system with permission flow, foreground/background handlers, and triggerNotification
 */

import { NOTIFICATION_CHANNELS } from '@/constants';
import { Platform, Alert as RNAlert } from 'react-native';
import { Alert } from './store';

import Constants, { ExecutionEnvironment } from 'expo-constants';

// Navigation handler that will be set by a React component
let navigationHandler: ((path: string) => void) | null = null;

/**
 * Set the navigation handler from a React component context
 * This should be called from a component that has access to the router
 */
export function setNotificationNavigationHandler(handler: (path: string) => void): void {
  navigationHandler = handler;
}

/**
 * Clear the navigation handler (call on unmount)
 */
export function clearNotificationNavigationHandler(): void {
  navigationHandler = null;
}

/**
 * Get the navigation path for a notification type
 */
export function getNavigationPathForNotification(data: NotificationData): string {
  switch (data.type) {
    case 'flood':
      return '/alerts/flood';
    case 'water_quality':
      return '/(tabs)/monitor';
    case 'safety':
      return '/alerts/safety';
    case 'waste':
      return '/(tabs)/reports';
    case 'citizen_report':
      return '/(tabs)/reports/my-reports';
    default:
      return '/(tabs)';
  }
}

// Conditionally import expo-notifications (not available on web or Expo Go for some features)
let Notifications: typeof import('expo-notifications') | null = null;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (Platform.OS !== 'web' && !isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    // expo-notifications not available
    console.warn('expo-notifications not available');
  }
} else if (isExpoGo) {
  console.log('Notifications disabled in Expo Go to prevent crashes (SDK 53+)');
}

// Helper to check if notifications are available
function isNotificationsAvailable(): boolean {
  return Platform.OS !== 'web' && Notifications !== null;
}

// Notification types
export type NotificationType =
  | 'water_quality'
  | 'flood'
  | 'safety'
  | 'waste'
  | 'biodiversity'
  | 'citizen_report'
  | 'general';

export interface NotificationData {
  type: NotificationType;
  alertId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
  };
  [key: string]: any; // Allow additional custom data
}

// Configure notification behavior for foreground (native only)
if (Platform.OS !== 'web' && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const isCritical =
        notification.request.content.data?.severity === 'critical' ||
        notification.request.content.data?.type === 'flood';

      return {
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: isCritical
          ? Notifications!.AndroidNotificationPriority.MAX
          : Notifications!.AndroidNotificationPriority.HIGH,
      };
    },
  });
}

/**
 * Request notification permissions with user-friendly flow
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) {
    return false; // Notifications not supported on web
  }

  try {
    // Check current permission status
    const { status: existingStatus } = await Notifications!.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If not granted, request permission
    if (existingStatus !== 'granted') {
      // On iOS, check if we can ask
      if (Platform.OS === 'ios') {
        const { status: iosStatus } =
          await Notifications!.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
        finalStatus = iosStatus;
      } else {
        // Android
        const { status: androidStatus } =
          await Notifications!.requestPermissionsAsync();
        finalStatus = androidStatus;
      }
    }

    // If still not granted, show helpful message
    if (finalStatus !== 'granted') {
      if (Platform.OS === 'ios') {
        RNAlert.alert(
          'Notifications Disabled',
          'Please enable notifications in Settings to receive important alerts about river conditions.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // On iOS, user needs to manually go to Settings
                console.log('User should go to Settings > Smart River Watch > Notifications');
              },
            },
          ]
        );
      }
      console.warn('Notification permissions not granted:', finalStatus);
      return false;
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Setup Android notification channels
 */
async function setupAndroidChannels(): Promise<void> {
  if (!isNotificationsAvailable()) {
    return; // Notifications not supported on web
  }

  await Notifications!.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.WATER_QUALITY,
    {
      name: 'Water Quality Alerts',
      description: 'Notifications about water quality issues',
      importance: Notifications!.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    }
  );

  await Notifications!.setNotificationChannelAsync(NOTIFICATION_CHANNELS.FLOOD, {
    name: 'Flood Alerts',
    description: 'Critical flood warnings and alerts',
    importance: Notifications!.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 500, 500],
    lightColor: '#EF4444',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  await Notifications!.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.SAFETY,
    {
      name: 'Safety Alerts',
      description: 'Safety warnings and alerts',
      importance: Notifications!.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    }
  );

  await Notifications!.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.GENERAL,
    {
      name: 'General Notifications',
      description: 'General app notifications',
      importance: Notifications!.AndroidImportance.DEFAULT,
      sound: 'default',
      enableVibrate: false,
      showBadge: true,
    }
  );
}

/**
 * Check if notification permissions are granted
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  if (!isNotificationsAvailable()) {
    return false; // Notifications not supported on web
  }

  const { status } = await Notifications!.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Trigger a notification with type and data
 * Main function for sending notifications throughout the app
 */
export async function triggerNotification(
  type: NotificationType,
  data: NotificationData,
  options?: {
    title?: string;
    body?: string;
    sound?: boolean;
    priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  }
): Promise<string | null> {
  if (!isNotificationsAvailable()) {
    return null; // Notifications not supported on web
  }

  try {
    // Check permissions first
    const hasPermission = await hasNotificationPermissions();
    if (!hasPermission) {
      console.warn('Cannot send notification: permissions not granted');
      return null;
    }

    // Get default title and body based on type
    const { title, body } = getNotificationContent(type, data, options);

    // Get channel ID for Android
    const channelId = getChannelIdForType(type);

    // Determine priority
    const priority =
      options?.priority ||
      (data.severity === 'critical' || type === 'flood'
        ? 'max'
        : data.severity === 'high'
        ? 'high'
        : 'default');

    // Schedule notification
    const notificationId = await Notifications!.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        sound: options?.sound !== false,
        priority:
          priority === 'max'
            ? Notifications!.AndroidNotificationPriority.MAX
            : priority === 'high'
            ? Notifications!.AndroidNotificationPriority.HIGH
            : Notifications!.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null, // Show immediately
    });

    console.log(`Notification triggered: ${type} - ${title}`);
    return notificationId;
  } catch (error) {
    console.error('Error triggering notification:', error);
    return null;
  }
}

/**
 * Get notification content based on type
 */
function getNotificationContent(
  type: NotificationType,
  data: NotificationData,
  options?: { title?: string; body?: string }
): { title: string; body: string } {
  // Use custom title/body if provided
  if (options?.title && options?.body) {
    return { title: options.title, body: options.body };
  }

  // Default content based on type
  switch (type) {
    case 'water_quality':
      return {
        title: options?.title || 'Water Quality Alert',
        body:
          options?.body ||
          data.severity === 'critical'
            ? 'Critical water quality issue detected'
            : 'Water quality alert - check details',
      };
    case 'flood':
      return {
        title: options?.title || '⚠️ Flood Alert',
        body:
          options?.body ||
          data.severity === 'high'
            ? 'High flood risk detected. Take immediate action.'
            : 'Flood risk alert - monitor conditions',
      };
    case 'safety':
      return {
        title: options?.title || 'Safety Alert',
        body:
          options?.body ||
          data.severity === 'critical'
            ? 'Critical safety issue - avoid area'
            : 'Safety alert - exercise caution',
      };
    case 'waste':
      return {
        title: options?.title || 'Waste Detection',
        body:
          options?.body ||
          `Waste detected: ${data.severity || 'medium'} severity`,
      };
    case 'biodiversity':
      return {
        title: options?.title || 'Biodiversity Update',
        body: options?.body || 'Biodiversity monitoring update available',
      };
    case 'citizen_report':
      return {
        title: options?.title || 'New Citizen Report',
        body: options?.body || 'A new citizen report has been submitted',
      };
    case 'general':
    default:
      return {
        title: options?.title || 'Smart River Watch',
        body: options?.body || 'You have a new notification',
      };
  }
}

/**
 * Schedule a local notification (legacy function, use triggerNotification instead)
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data?: any,
  channelId?: string
): Promise<string> {
  if (!isNotificationsAvailable()) {
    throw new Error('Notifications not supported on web');
  }

  try {
    const notificationId = await Notifications!.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Send notification for an alert
 */
export async function sendAlertNotification(alert: Alert): Promise<void> {
  const channelId = getChannelIdForAlertType(alert.type);
  
  await scheduleNotification(
    alert.title,
    alert.message,
    {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
    },
    channelId
  );
}

/**
 * Get notification channel ID for notification type
 */
function getChannelIdForType(type: NotificationType): string {
  switch (type) {
    case 'water_quality':
      return NOTIFICATION_CHANNELS.WATER_QUALITY;
    case 'flood':
      return NOTIFICATION_CHANNELS.FLOOD;
    case 'safety':
      return NOTIFICATION_CHANNELS.SAFETY;
    case 'waste':
    case 'biodiversity':
    case 'citizen_report':
    case 'general':
    default:
      return NOTIFICATION_CHANNELS.GENERAL;
  }
}

/**
 * Get notification channel ID for alert type (legacy)
 */
function getChannelIdForAlertType(type: Alert['type']): string {
  switch (type) {
    case 'water_quality':
      return NOTIFICATION_CHANNELS.WATER_QUALITY;
    case 'flood':
      return NOTIFICATION_CHANNELS.FLOOD;
    case 'safety':
      return NOTIFICATION_CHANNELS.SAFETY;
    default:
      return NOTIFICATION_CHANNELS.GENERAL;
  }
}

/**
 * Get Expo Push Token for remote notifications
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!isNotificationsAvailable()) {
    return null; // Notifications not supported on web
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const tokenData = await Notifications!.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });

    return tokenData.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Cancel a notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (!isNotificationsAvailable()) {
    return; // Notifications not supported on web
  }

  await Notifications!.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNotificationsAvailable()) {
    return; // Notifications not supported on web
  }

  await Notifications!.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<any[]> {
  if (!isNotificationsAvailable()) {
    return []; // Notifications not supported on web
  }

  return await Notifications!.getAllScheduledNotificationsAsync();
}

/**
 * Setup foreground notification handler
 * Called when app is in foreground
 */
export function setupForegroundNotificationHandler(
  onNotificationReceived?: (notification: any) => void
): any {
  if (!isNotificationsAvailable()) {
    return null; // Notifications not supported on web
  }

  return Notifications!.addNotificationReceivedListener((notification) => {
    console.log('Foreground notification received:', notification);
    
    // Call custom handler if provided
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });
}

/**
 * Setup background notification handler
 * Called when user taps on notification while app is in background
 */
export function setupBackgroundNotificationHandler(
  onNotificationTapped?: (response: any) => void
): any {
  if (!isNotificationsAvailable()) {
    return null; // Notifications not supported on web
  }

  return Notifications!.addNotificationResponseReceivedListener((response) => {
    console.log('Background notification tapped:', response);
    
    const notification = response.notification;
    const data = notification.request.content.data as NotificationData;
    
    // Call custom handler if provided
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
    
    // Handle navigation based on notification type
    handleNotificationNavigation(data);
  });
}

/**
 * Handle navigation when notification is tapped
 * Uses the registered navigation handler from React component context
 */
function handleNotificationNavigation(data: NotificationData): void {
  const path = getNavigationPathForNotification(data);
  
  if (navigationHandler) {
    try {
      navigationHandler(path);
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  } else {
    console.warn(
      'Navigation handler not set. Call setNotificationNavigationHandler() from a React component.',
      'Attempted navigation to:', path
    );
  }
}

/**
 * Setup all notification handlers (foreground + background)
 * Call this once in App.tsx or root component
 */
export function setupNotificationHandlers(options?: {
  onForegroundNotification?: (notification: any) => void;
  onBackgroundNotification?: (response: any) => void;
}): {
  foregroundSubscription: any;
  backgroundSubscription: any;
} {
  if (!isNotificationsAvailable()) {
    return {
      foregroundSubscription: null,
      backgroundSubscription: null,
    };
  }

  const foregroundSubscription = setupForegroundNotificationHandler(
    options?.onForegroundNotification
  );
  
  const backgroundSubscription = setupBackgroundNotificationHandler(
    options?.onBackgroundNotification
  );
  
  return {
    foregroundSubscription,
    backgroundSubscription,
  };
}

/**
 * Remove notification handlers
 */
export function removeNotificationHandlers(
  subscriptions: {
    foregroundSubscription: any;
    backgroundSubscription: any;
  }
): void {
  if (!isNotificationsAvailable()) {
    return; // Notifications not supported on web
  }

  if (subscriptions.foregroundSubscription) {
    subscriptions.foregroundSubscription.remove();
  }
  if (subscriptions.backgroundSubscription) {
    subscriptions.backgroundSubscription.remove();
  }
}


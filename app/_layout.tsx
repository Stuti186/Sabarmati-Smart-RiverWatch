import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../global.css';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useStartFakeDataEngine } from '../hooks/useFakeDataUpdates';

// Only import notification services on native platforms
let requestNotificationPermissions: (() => Promise<void>) | null = null;
let setupNotificationHandlers: any = null;
let removeNotificationHandlers: any = null;
let setNotificationNavigationHandler: ((handler: (path: string) => void) => void) | null = null;
let clearNotificationNavigationHandler: (() => void) | null = null;

if (Platform.OS !== 'web') {
  try {
    const notifications = require('../services/notifications');
    requestNotificationPermissions = notifications.requestNotificationPermissions;
    setupNotificationHandlers = notifications.setupNotificationHandlers;
    removeNotificationHandlers = notifications.removeNotificationHandlers;
    setNotificationNavigationHandler = notifications.setNotificationNavigationHandler;
    clearNotificationNavigationHandler = notifications.clearNotificationNavigationHandler;
  } catch (e) {
    console.warn('Failed to load notification services:', e);
  }
}

// Component to start fake data engine
function FakeDataProvider() {
  useStartFakeDataEngine();
  return null;
}

// Component to start auto-alerts monitoring
function AutoAlertsProvider() {
  // useStartAutoAlerts();
  return null;
}

// Component to setup notification handlers (native only)
// This component MUST be inside a component that has access to the router
function NotificationProvider() {
  const router = useRouter();
  const subscriptionsRef = useRef<{
    foregroundSubscription: any;
    backgroundSubscription: any;
  } | null>(null);

  // Create a stable navigation handler that uses the router from React context
  const handleNavigation = useCallback((path: string) => {
    try {
      router.push(path as Href);
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  }, [router]);

  useEffect(() => {
    // Only setup on native platforms
    if (Platform.OS === 'web') {
      return;
    }

    // Register the navigation handler so notifications can navigate
    if (setNotificationNavigationHandler) {
      setNotificationNavigationHandler(handleNavigation);
    }

    // Setup notification handlers if available
    if (setupNotificationHandlers) {
      const subscriptions = setupNotificationHandlers({
        onForegroundNotification: (notification: any) => {
          // Handle foreground notifications
          console.log('Foreground notification:', notification);
          // You can show custom UI, update state, etc.
        },
        onBackgroundNotification: (response: any) => {
          // Handle background notification taps
          console.log('Background notification tapped:', response);
          // Navigation will be handled by handleNotificationNavigation
        },
      });

      subscriptionsRef.current = subscriptions;
    }

    // Cleanup on unmount
    return () => {
      if (clearNotificationNavigationHandler) {
        clearNotificationNavigationHandler();
      }
      if (subscriptionsRef.current && removeNotificationHandlers) {
        removeNotificationHandlers(subscriptionsRef.current);
      }
    };
  }, [handleNavigation]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the login page if the user is not signed in
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to the tabs page if the user is signed in
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  useEffect(() => {
    // Request notification permissions on app start (native only)
    if (requestNotificationPermissions && Platform.OS !== 'web') {
      requestNotificationPermissions();
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Entry Point */}
        <Stack.Screen name="index" />
        
        {/* Auth Flow */}
        <Stack.Screen name="(auth)" />
        
        {/* Main Tabs */}
        <Stack.Screen name="(tabs)" />
        
        {/* Alerts Module */}
        <Stack.Screen name="alerts" />
        
        {/* Global Stack Screens */}
        <Stack.Screen 
          name="submit-report" 
          options={{ 
            title: 'Submit Report',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="awareness" 
          options={{ 
            title: 'Awareness Blog',
            headerShown: false,
          }} 
        />
        
        {/* 404 */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FakeDataProvider />
      <AutoAlertsProvider />
      <NotificationProvider />
      <RootLayoutNav />
    </AuthProvider>
  );
}

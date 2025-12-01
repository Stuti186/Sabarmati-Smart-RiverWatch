/**
 * Alerts Stack Layout
 * Handles navigation within the Alerts module (Flood, Safety, CCTV)
 */

import { Stack } from 'expo-router';

export default function AlertsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTintColor: '#FFFFFF',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="flood" 
        options={{ 
          title: 'Flood Alerts',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="flood-prediction" 
        options={{ 
          title: 'Flood Prediction',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="safety" 
        options={{ 
          title: 'Safety Alerts',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="cctv" 
        options={{ 
          title: 'CCTV Monitoring',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}


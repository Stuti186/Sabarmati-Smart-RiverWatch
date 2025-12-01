/**
 * Monitor Tab Stack Layout
 * Handles navigation within the Water Quality module
 */

import { Stack } from 'expo-router';

export default function MonitorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Water Quality' }} 
      />
      <Stack.Screen 
        name="graphs" 
        options={{ 
          title: 'Quality Trends',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="water-level" 
        options={{ 
          title: 'Water Level',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}


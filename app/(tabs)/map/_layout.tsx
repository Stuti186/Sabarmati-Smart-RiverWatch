/**
 * Map Tab Stack Layout
 * Handles navigation within the Maps module
 */

import { Stack } from 'expo-router';

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Sensor Map' }} 
      />
      <Stack.Screen 
        name="unsafe-zones" 
        options={{ 
          title: 'Unsafe Zones',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="waste-hotspots" 
        options={{ 
          title: 'Waste Hotspots',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}


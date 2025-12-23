/**
 * Biodiversity Tab Stack Layout
 * Handles navigation within the Biodiversity module
 */

import { Stack } from 'expo-router';

export default function BiodiversityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Biodiversity' }} 
      />
      <Stack.Screen 
        name="species-catalog" 
        options={{ 
          title: 'Species Catalog',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="species-details" 
        options={{ 
          title: 'Species Details',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="submit-sighting" 
        options={{ 
          title: 'Submit Sighting',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="ai-identification" 
        options={{ 
          title: 'AI Species ID',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="migration-map" 
        options={{ 
          title: 'Migration Map',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="invasive-alerts" 
        options={{ 
          title: 'Invasive Alerts',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}


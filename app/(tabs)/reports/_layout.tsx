/**
 * Reports Tab Stack Layout
 * Handles navigation within the Reports & Waste module
 */

import { Stack } from 'expo-router';

export default function ReportsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Waste Feed' }} 
      />
      <Stack.Screen 
        name="upload" 
        options={{ 
          title: '',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="trends" 
        options={{ 
          title: '',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="my-reports" 
        options={{ 
          title: '',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}


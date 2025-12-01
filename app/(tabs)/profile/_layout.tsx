/**
 * Profile Tab Stack Layout
 * Handles navigation within the Profile module
 */

import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Profile' }} 
      />
      <Stack.Screen 
        name="rewards" 
        options={{ 
          title: 'Reward Points',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="volunteer" 
        options={{ 
          title: 'Volunteer Events',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}


/**
 * LoadingScreen Component
 * Shows while app is initializing auth state
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '@/theme';

export default function LoadingScreen() {
  return (
    <LinearGradient
      colors={gradients.water.flow.colors as unknown as readonly [string, string, ...string[]]}
      start={gradients.water.flow.start}
      end={gradients.water.flow.end}
      style={styles.container}>
      <ActivityIndicator size="large" color={colors.text.inverse.light} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


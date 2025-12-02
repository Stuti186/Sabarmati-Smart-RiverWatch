/**
 * GlassCard Component
 * Premium glassmorphism card with blur effect
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, shadows } from '@/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark';
  borderRadius?: number;
}

export default function GlassCard({
  children,
  intensity = 80,
  tint = 'light',
  borderRadius = 20,
  style,
  ...props
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        shadows.lg, // Improved shadow
        style,
      ]}
      {...props}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blurView, { borderRadius }]}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Enhanced opacity
    borderWidth: 1.5, // Slightly thicker border
    borderColor: 'rgba(255, 255, 255, 0.3)', // Enhanced border
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});


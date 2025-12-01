/**
 * GradientCard Component
 * Premium card with blue to green gradient
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, shadows } from '@/theme';

interface GradientCardProps extends ViewProps {
  children: React.ReactNode;
  gradient?: 'default' | 'water' | 'nature' | 'primary';
  borderRadius?: number;
}

export default function GradientCard({
  children,
  gradient = 'water',
  borderRadius = 20,
  style,
  ...props
}: GradientCardProps) {
  const gradientConfig =
    gradient === 'water'
      ? gradients.water.flow
      : gradient === 'nature'
      ? gradients.nature.forest
      : gradient === 'primary'
      ? gradients.primary.default
      : gradients.water.flow;

  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        shadows.xl, // Enhanced shadow
        style,
      ]}
      {...props}>
      <LinearGradient
        colors={gradientConfig.colors as unknown as readonly [string, string, ...string[]]}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={[styles.gradient, { borderRadius }]}>
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle border
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
});


/**
 * ModernCard Component
 * Premium reusable card with glass effect and gradient support
 * Consistent with the 2024/2025 design system
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/theme/designSystem';

type CardVariant = 'glass' | 'solid' | 'gradient' | 'outline';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  gradientColors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  blurIntensity?: number;
  noPadding?: boolean;
}

export default function ModernCard({
  children,
  variant = 'glass',
  gradientColors,
  style,
  contentStyle,
  blurIntensity = 85,
  noPadding = false,
}: ModernCardProps) {
  const containerStyle = [
    styles.container,
    style,
  ];

  const innerContentStyle = [
    styles.content,
    noPadding && styles.noPadding,
    contentStyle,
  ];

  // Gradient variant
  if (variant === 'gradient' && gradientColors) {
    return (
      <View style={containerStyle}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, StyleSheet.absoluteFillObject]}
        />
        <View style={innerContentStyle}>{children}</View>
      </View>
    );
  }

  // Glass variant (with blur)
  if (variant === 'glass') {
    return (
      <View style={containerStyle}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={blurIntensity}
            tint="light"
            style={[StyleSheet.absoluteFillObject, styles.blur]}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.androidGlass]} />
        )}
        <View style={innerContentStyle}>{children}</View>
      </View>
    );
  }

  // Outline variant
  if (variant === 'outline') {
    return (
      <View style={[containerStyle, styles.outline]}>
        <View style={innerContentStyle}>{children}</View>
      </View>
    );
  }

  // Solid variant (default)
  return (
    <View style={[containerStyle, styles.solid]}>
      <View style={innerContentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.radius.card,
    overflow: 'hidden',
    ...DesignSystem.shadows.card,
  },
  content: {
    padding: DesignSystem.spacing.cardPadding,
  },
  noPadding: {
    padding: 0,
  },
  gradient: {
    borderRadius: DesignSystem.radius.card,
  },
  blur: {
    borderRadius: DesignSystem.radius.card,
  },
  androidGlass: {
    backgroundColor: DesignSystem.colors.card.background,
    borderWidth: 1,
    borderColor: DesignSystem.colors.card.border,
    borderRadius: DesignSystem.radius.card,
  },
  solid: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.card.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.card.borderLight,
  },
});


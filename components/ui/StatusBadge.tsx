/**
 * StatusBadge Component
 * Modern pill-shaped status indicator with consistent styling
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/theme/designSystem';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: BadgeSize;
  variant?: 'filled' | 'outline' | 'gradient';
  style?: ViewStyle;
}

const statusConfig = {
  success: {
    bgColor: DesignSystem.colors.success.light,
    textColor: DesignSystem.colors.success.dark,
    borderColor: '#A7F3D0',
    gradient: DesignSystem.gradients.success,
    icon: 'checkmark-circle' as const,
  },
  warning: {
    bgColor: DesignSystem.colors.warning.light,
    textColor: '#D97706',
    borderColor: '#FDE68A',
    gradient: DesignSystem.gradients.warning,
    icon: 'alert-circle' as const,
  },
  danger: {
    bgColor: DesignSystem.colors.danger.light,
    textColor: DesignSystem.colors.danger.dark,
    borderColor: '#FECACA',
    gradient: DesignSystem.gradients.danger,
    icon: 'close-circle' as const,
  },
  info: {
    bgColor: DesignSystem.colors.info.light,
    textColor: DesignSystem.colors.info.dark,
    borderColor: '#BAE6FD',
    gradient: DesignSystem.gradients.info,
    icon: 'information-circle' as const,
  },
  neutral: {
    bgColor: '#F1F5F9',
    textColor: '#64748B',
    borderColor: '#E2E8F0',
    gradient: ['#94A3B8', '#64748B'] as const,
    icon: 'ellipse' as const,
  },
};

const sizeConfig = {
  sm: {
    paddingH: 8,
    paddingV: 4,
    fontSize: 10,
    iconSize: 12,
    borderRadius: 10,
    gap: 4,
  },
  md: {
    paddingH: 12,
    paddingV: 6,
    fontSize: 12,
    iconSize: 14,
    borderRadius: 14,
    gap: 5,
  },
  lg: {
    paddingH: 16,
    paddingV: 8,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 18,
    gap: 6,
  },
};

export default function StatusBadge({
  status,
  label,
  icon,
  size = 'md',
  variant = 'filled',
  style,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const displayIcon = icon || config.icon;

  const containerStyles = [
    styles.container,
    {
      paddingHorizontal: sizeStyles.paddingH,
      paddingVertical: sizeStyles.paddingV,
      borderRadius: sizeStyles.borderRadius,
      gap: sizeStyles.gap,
    },
    variant === 'filled' && { backgroundColor: config.bgColor },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: config.borderColor,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: sizeStyles.fontSize,
      color: variant === 'gradient' ? '#FFFFFF' : config.textColor,
    },
  ];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            paddingHorizontal: sizeStyles.paddingH,
            paddingVertical: sizeStyles.paddingV,
            borderRadius: sizeStyles.borderRadius,
            gap: sizeStyles.gap,
          },
          style,
        ]}
      >
        <Ionicons
          name={displayIcon}
          size={sizeStyles.iconSize}
          color="#FFFFFF"
        />
        <Text style={textStyles}>{label}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={containerStyles}>
      <Ionicons
        name={displayIcon}
        size={sizeStyles.iconSize}
        color={config.textColor}
      />
      <Text style={textStyles}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});


/**
 * StatusChip Component
 * Premium status indicator chip with success/warning/danger variants
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@/theme';

type StatusType = 'success' | 'warning' | 'danger' | 'info';

interface StatusChipProps extends ViewProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  success: {
    bg: colors.ecoGreen[100],
    text: colors.ecoGreen[700],
    border: colors.ecoGreen[300],
    icon: 'checkmark-circle' as const,
  },
  warning: {
    bg: colors.warning[100],
    text: colors.warning[700],
    border: colors.warning[300],
    icon: 'warning' as const,
  },
  danger: {
    bg: colors.alert[100],
    text: colors.alert[700],
    border: colors.alert[300],
    icon: 'alert-circle' as const,
  },
  info: {
    bg: colors.primary[100],
    text: colors.primary[700],
    border: colors.primary[300],
    icon: 'information-circle' as const,
  },
};

export default function StatusChip({
  status,
  label,
  showIcon = true,
  size = 'md',
  style,
  ...props
}: StatusChipProps) {
  const config = statusConfig[status];
  const sizeStyles = {
    sm: { padding: 6, fontSize: 12, iconSize: 14 },
    md: { padding: 8, fontSize: 14, iconSize: 16 },
    lg: { padding: 10, fontSize: 16, iconSize: 18 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          padding: currentSize.padding,
        },
        shadows.sm,
        style,
      ]}
      {...props}>
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={currentSize.iconSize}
          color={config.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: config.text,
            fontSize: currentSize.fontSize,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
  },
});


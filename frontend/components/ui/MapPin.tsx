/**
 * MapPin Component
 * Premium map pin marker with status indicator
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, gradients } from '@/theme';

type PinStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical' | 'default';

interface MapPinProps extends ViewProps {
  status?: PinStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const statusConfig = {
  excellent: {
    color: colors.waterQuality.excellent,
    icon: 'checkmark-circle' as const,
    gradient: gradients.status.success,
  },
  good: {
    color: colors.waterQuality.good,
    icon: 'water' as const,
    gradient: gradients.primary.default,
  },
  fair: {
    color: colors.waterQuality.fair,
    icon: 'warning' as const,
    gradient: gradients.status.warning,
  },
  poor: {
    color: colors.waterQuality.poor,
    icon: 'alert-circle' as const,
    gradient: gradients.status.warning,
  },
  critical: {
    color: colors.waterQuality.critical,
    icon: 'close-circle' as const,
    gradient: gradients.status.alert,
  },
  default: {
    color: colors.primary[500],
    icon: 'location' as const,
    gradient: gradients.primary.default,
  },
};

export default function MapPin({
  status = 'default',
  label,
  size = 'md',
  showPulse = false,
  style,
  ...props
}: MapPinProps) {
  const config = statusConfig[status];
  const sizeStyles = {
    sm: { pin: 32, icon: 16, label: 10 },
    md: { pin: 40, icon: 20, label: 12 },
    lg: { pin: 48, icon: 24, label: 14 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, style]} {...props}>
      {showPulse && (
        <View
          style={[
            styles.pulse,
            {
              width: currentSize.pin + 20,
              height: currentSize.pin + 20,
              borderRadius: (currentSize.pin + 20) / 2,
            },
          ]}
        />
      )}
      <LinearGradient
        colors={config.gradient.colors}
        start={config.gradient.start}
        end={config.gradient.end}
        style={[
          styles.pin,
          {
            width: currentSize.pin,
            height: currentSize.pin,
            borderRadius: currentSize.pin / 2,
          },
          shadows.lg,
        ]}>
        <Ionicons
          name={config.icon}
          size={currentSize.icon}
          color={colors.text.inverse.light}
        />
      </LinearGradient>
      {label && (
        <View style={styles.labelContainer}>
          <View style={styles.labelBubble}>
            <Text
              style={[
                styles.labelText,
                { fontSize: currentSize.label },
              ]}>
              {label}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    backgroundColor: colors.primary[500],
    opacity: 0.3,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.light,
  },
  labelContainer: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
  },
  labelBubble: {
    backgroundColor: colors.background.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  labelText: {
    color: colors.text.primary.light,
    fontWeight: '600',
  },
});


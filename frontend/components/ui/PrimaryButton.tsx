/**
 * PrimaryButton Component
 * Premium gradient button with soft shadow
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, shadows, colors, typography } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const gradientConfig =
    variant === 'primary'
      ? gradients.primary.default
      : variant === 'success'
      ? gradients.status.success
      : variant === 'warning'
      ? gradients.status.warning
      : gradients.status.alert;

  const sizeStyles = {
    sm: { padding: 10, fontSize: 14, iconSize: 16 },
    md: { padding: 14, fontSize: 16, iconSize: 20 },
    lg: { padding: 18, fontSize: 18, iconSize: 24 },
  };

  const currentSize = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}>
      <LinearGradient
        colors={
          isDisabled
            ? [colors.gray[400], colors.gray[500]]
            : gradientConfig.colors
        }
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={[
          styles.gradient,
          {
            padding: currentSize.padding,
            borderRadius: 16,
          },
          shadows.md,
        ]}>
        {loading ? (
          <ActivityIndicator color={colors.text.inverse.light} />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={colors.text.inverse.light}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  fontSize: currentSize.fontSize,
                },
                textStyle,
              ]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={colors.text.inverse.light}
                style={styles.iconRight}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.textStyles.button,
    color: colors.text.inverse.light,
    fontWeight: '700',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});


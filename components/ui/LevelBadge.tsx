/**
 * LevelBadge Component
 * Badge displaying reward level (Bronze/Silver/Gold/Platinum)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, shadows } from '@/theme';
import { RewardLevel, REWARD_LEVELS } from '@/utils/rewardPoints';

interface LevelBadgeProps extends ViewProps {
  level: RewardLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  delay?: number;
}

const sizeConfig = {
  sm: {
    padding: 8,
    fontSize: 12,
    iconSize: 16,
    borderRadius: 12,
  },
  md: {
    padding: 12,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 16,
  },
  lg: {
    padding: 16,
    fontSize: 20,
    iconSize: 24,
    borderRadius: 20,
  },
};

export default function LevelBadge({
  level,
  size = 'md',
  showIcon = true,
  delay = 0,
  style,
  ...props
}: LevelBadgeProps) {
  const config = REWARD_LEVELS[level];
  const sizeStyles = sizeConfig[size];

  const iconName: keyof typeof Ionicons.glyphMap =
    config.icon === 'medal'
      ? 'medal'
      : config.icon === 'trophy'
      ? 'trophy'
      : config.icon === 'star'
      ? 'star'
      : 'diamond';

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={[styles.container, style]}
      {...props}>
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            padding: sizeStyles.padding,
            borderRadius: sizeStyles.borderRadius,
          },
        ]}>
        {showIcon && (
          <Ionicons
            name={iconName}
            size={sizeStyles.iconSize}
            color={colors.text.inverse.light}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeStyles.fontSize,
            },
          ]}>
          {config.name}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shadows.md,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '700',
    color: colors.text.inverse.light,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});


/**
 * SkeletonLoader Component
 * Animated skeleton loader for loading states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '@/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'default' | 'card' | 'text' | 'circle';
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  variant = 'default',
}: SkeletonLoaderProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-300, 300]);
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return { width: '100%', height: 200, borderRadius: 20 };
      case 'text':
        return { width: '100%', height: 16, borderRadius: 4 };
      case 'circle':
        return {
          width: typeof width === 'number' ? width : 60,
          height: typeof width === 'number' ? width : 60,
          borderRadius: typeof width === 'number' ? width / 2 : 30,
        };
      default:
        return { width, height, borderRadius };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        variantStyles,
        style,
        { overflow: 'hidden' },
      ]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

/**
 * SkeletonCard - Pre-configured skeleton for cards
 */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.cardContainer, style]}>
      <SkeletonLoader variant="card" />
      <View style={styles.cardContent}>
        <SkeletonLoader variant="text" height={20} style={styles.title} />
        <SkeletonLoader variant="text" height={16} style={styles.text} />
        <SkeletonLoader variant="text" width="60%" height={16} />
      </View>
    </View>
  );
}

/**
 * SkeletonList - Pre-configured skeleton for lists
 */
export function SkeletonList({
  count = 3,
  style,
}: {
  count?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader variant="circle" width={50} />
          <View style={styles.listContent}>
            <SkeletonLoader variant="text" height={18} style={styles.title} />
            <SkeletonLoader variant="text" height={14} width="80%" />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[200],
    overflow: 'hidden',
  },
  shimmer: {
    width: '200%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    position: 'absolute',
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
    backgroundColor: colors.gray[50],
  },
  title: {
    marginBottom: 8,
  },
  text: {
    marginBottom: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
});


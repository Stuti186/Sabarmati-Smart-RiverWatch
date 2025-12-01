/**
 * CircularProgress Component
 * Animated circular progress indicator
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, gradients } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  gradient?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function CircularProgress({
  value,
  size = 200,
  strokeWidth = 20,
  label,
  showPercentage = true,
  gradient = 'primary',
}: CircularProgressProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    progress.value = withTiming(value, { duration: 1500 });
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const animatedProps = useAnimatedProps(() => {
    const animatedValue = progress.value;
    const offset = circumference - (animatedValue / 100) * circumference;
    return {
      strokeDashoffset: offset,
    };
  });

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradientColors =
    gradient === 'primary'
      ? gradients.primary.default.colors
      : gradient === 'success'
      ? gradients.status.success.colors
      : gradient === 'warning'
      ? gradients.status.warning.colors
      : gradients.status.alert.colors;

  const getStatusColor = (val: number) => {
    if (val >= 80) return colors.ecoGreen[500];
    if (val >= 60) return colors.primary[500];
    if (val >= 40) return colors.warning[500];
    return colors.alert[500];
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.gray[200]}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStatusColor(value)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Animated.View
        style={[
          styles.content,
          {
            width: size - strokeWidth * 2.5,
            height: size - strokeWidth * 2.5,
            borderRadius: (size - strokeWidth * 2.5) / 2,
          },
          scaleAnimatedStyle,
        ]}>
        <LinearGradient
          colors={gradientColors as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: size - strokeWidth * 2.5,
              height: size - strokeWidth * 2.5,
              borderRadius: (size - strokeWidth * 2.5) / 2,
            },
          ]}>
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(value)}%</Text>
          )}
          {label && <Text style={styles.label}>{label}</Text>}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.inverse.light,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse.light,
    marginTop: 4,
    opacity: 0.9,
  },
});


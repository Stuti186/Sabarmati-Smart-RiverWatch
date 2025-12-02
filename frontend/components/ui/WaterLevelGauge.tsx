/**
 * WaterLevelGauge Component
 * Circular animated gauge for water level display
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, gradients } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

interface WaterLevelGaugeProps {
  level: number; // Current water level in meters
  capacity: number; // Maximum capacity in meters
  size?: number;
  strokeWidth?: number;
}

export default function WaterLevelGauge({
  level,
  capacity,
  size = 280,
  strokeWidth = 24,
}: WaterLevelGaugeProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  const percentage = Math.min(100, Math.max(0, (level / capacity) * 100));

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 2000 });
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    rotation.value = withSpring(1, { damping: 15, stiffness: 80 });
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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

  const rotationAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  // Get color based on water level percentage
  const getLevelColor = (percent: number) => {
    if (percent >= 80) return colors.alert[500]; // High - Red
    if (percent >= 60) return colors.warning[500]; // Medium-High - Yellow
    if (percent >= 40) return colors.primary[500]; // Medium - Blue
    if (percent >= 20) return colors.ecoGreen[500]; // Low-Medium - Green
    return colors.deepBlue[500]; // Low - Deep Blue
  };

  const levelColor = getLevelColor(percentage);

  const gradientColors =
    percentage >= 80
      ? gradients.status.alert.colors
      : percentage >= 60
      ? gradients.status.warning.colors
      : percentage >= 40
      ? gradients.primary.default.colors
      : percentage >= 20
      ? gradients.status.success.colors
      : gradients.water.deep.colors;

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
          stroke={levelColor}
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
          <Text style={styles.levelValue}>{level.toFixed(1)}m</Text>
          <Text style={styles.levelLabel}>Current Level</Text>
          <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
          <Text style={styles.capacityLabel}>of {capacity}m capacity</Text>
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
  levelValue: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.text.inverse.light,
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse.light,
    opacity: 0.9,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.inverse.light,
    marginTop: 4,
  },
  capacityLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.inverse.light,
    opacity: 0.8,
    marginTop: 4,
  },
});


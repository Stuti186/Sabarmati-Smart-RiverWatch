/**
 * AnimatedCounter Component
 * Animated number counter with smooth transitions
 */

import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '@/theme';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

export default function AnimatedCounter({
  value,
  duration = 1500,
  style,
  prefix = '',
  suffix = '',
  formatter,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const progress = useSharedValue(0);
  const targetValue = useSharedValue(value);

  useEffect(() => {
    targetValue.value = value;
    progress.value = 0;
    progress.value = withTiming(1, { duration });
  }, [value, duration]);

  useAnimatedReaction(
    () => progress.value,
    (currentProgress) => {
      const currentValue = interpolate(currentProgress, [0, 1], [0, targetValue.value]);
      runOnJS(setDisplayValue)(Math.floor(currentValue));
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0.5, 1]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.1, 1]),
        },
      ],
    };
  });

  const formatValue = (val: number): string => {
    if (formatter) {
      return formatter(val);
    }
    return val.toLocaleString('en-US');
  };

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </Animated.Text>
  );
}

// Alternative implementation using Reanimated's useDerivedValue
export function AnimatedCounterV2({
  value,
  duration = 1500,
  style,
  prefix = '',
  suffix = '',
  formatter,
}: AnimatedCounterProps) {
  const progress = useSharedValue(0);
  const targetValue = useSharedValue(value);

  useEffect(() => {
    targetValue.value = value;
    progress.value = 0;
    progress.value = withTiming(1, { duration });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentValue = interpolate(progress.value, [0, 1], [0, targetValue.value]);
    const formatted = formatter
      ? formatter(Math.floor(currentValue))
      : Math.floor(currentValue).toLocaleString('en-US');

    return {
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0.5, 1]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]}>
      {prefix}
      {formatter ? formatter(Math.floor(progress.value * value)) : Math.floor(progress.value * value).toLocaleString('en-US')}
      {suffix}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.text.primary.light,
    fontWeight: '700',
  },
});


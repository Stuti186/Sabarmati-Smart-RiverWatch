/**
 * useScreenAnimation Hook
 * Provides fade-in animation for screens
 */

import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

/**
 * Hook for screen fade-in animation
 */
export function useScreenAnimation(delay: number = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}

/**
 * Pre-configured fade-in animations
 */
export const screenAnimations = {
  fadeIn: FadeIn.duration(600),
  fadeInDown: FadeInDown.duration(600),
  fadeInDelayed: (delay: number) => FadeIn.duration(600).delay(delay),
  fadeInDownDelayed: (delay: number) => FadeInDown.duration(600).delay(delay),
};


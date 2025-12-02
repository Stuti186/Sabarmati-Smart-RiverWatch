/**
 * Web fallback for BlurView
 * Provides a simple View with semi-transparent background for web
 * This file replaces expo-blur on web platform
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface BlurViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark';
  children?: React.ReactNode;
}

// Export as named export to match expo-blur structure
export const BlurView = React.forwardRef<View, BlurViewProps>(({
  intensity = 80,
  tint = 'light',
  style,
  children,
  ...props
}, ref) => {
  const opacity = intensity / 100;
  const backgroundColor =
    tint === 'dark'
      ? `rgba(0, 0, 0, ${opacity * 0.3})`
      : `rgba(255, 255, 255, ${opacity * 0.3})`;

  return (
    <View
      ref={ref}
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
});

BlurView.displayName = 'BlurView';

// Also export as default for compatibility
export default BlurView;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});


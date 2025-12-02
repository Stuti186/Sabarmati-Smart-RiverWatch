/**
 * BlurView Wrapper
 * Handles platform-specific BlurView imports
 */

import { Platform } from 'react-native';
import { View, ViewProps } from 'react-native';

// Conditionally import based on platform
let BlurViewComponent: any;

if (Platform.OS === 'web') {
  // Use web fallback
  BlurViewComponent = require('./BlurView.web').default;
} else {
  // Use native BlurView
  BlurViewComponent = require('expo-blur').BlurView;
}

interface BlurViewWrapperProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark';
  children?: React.ReactNode;
}

export default function BlurViewWrapper(props: BlurViewWrapperProps) {
  return <BlurViewComponent {...props} />;
}

export { BlurViewWrapper as BlurView };


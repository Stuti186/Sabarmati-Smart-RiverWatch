/**
 * Theme Configuration - Smart River Watch
 * Central theme export combining all theme modules
 */

export { colors, type Colors } from './colors';
export { gradients, type Gradients } from './gradients';
export { shadows, type Shadows } from './shadows';
export { typography, type Typography } from './typography';

// New 2025 UI System
export {
  SPACING,
  RADIUS,
  SHADOWS as UI_SHADOWS,
  COLORS as UI_COLORS,
  GRADIENTS as UI_GRADIENTS,
  TYPOGRAPHY as UI_TYPOGRAPHY,
  DIMENSIONS,
  COMMON_STYLES,
  getStatusColor,
  getSeverityColor,
  responsiveSpacing,
} from './uiSystem';

// Spacing scale
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  64: 256,
};

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Complete theme object
import { colors } from './colors';
import { gradients } from './gradients';
import { shadows } from './shadows';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  shadows,
  gradients,
  spacing,
  borderRadius,
};

export type Theme = typeof theme;
export default theme;

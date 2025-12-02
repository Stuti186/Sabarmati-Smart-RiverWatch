/**
 * Color Palette - Nature-Friendly Theme
 * Smart River Watch Color System
 */

export const colors = {
  // Primary Blue - Main brand color (River/Water theme)
  primary: {
    50: '#E6F2FF',
    100: '#CCE5FF',
    200: '#99CBFF',
    300: '#66B1FF',
    400: '#3397FF',
    500: '#1E90FF', // Primary Blue - Main brand color
    600: '#1873CC',
    700: '#125699',
    800: '#0C3A66',
    900: '#061D33',
  },

  // Deep Blue - Secondary brand color
  deepBlue: {
    50: '#E6F0F7',
    100: '#CCE1EF',
    200: '#99C3DF',
    300: '#66A5CF',
    400: '#3387BF',
    500: '#0057A7', // Deep Blue
    600: '#004586',
    700: '#003465',
    800: '#002244',
    900: '#001123',
  },

  // Eco Green - Nature/Environment theme
  ecoGreen: {
    50: '#F0FDF0',
    100: '#DCFBDC',
    200: '#B9F7B9',
    300: '#96F396',
    400: '#73EF73',
    500: '#32CD32', // Eco Green
    600: '#28A428',
    700: '#1E7B1E',
    800: '#145214',
    900: '#0A290A',
  },

  // Warning Yellow - Caution/Warning theme
  warning: {
    50: '#FFFBF0',
    100: '#FFF7E0',
    200: '#FFEFC1',
    300: '#FFE7A2',
    400: '#FFDF83',
    500: '#FFCC00', // Warning Yellow
    600: '#CCA300',
    700: '#997A00',
    800: '#665200',
    900: '#332900',
  },

  // Alert Red - Danger/Alert theme
  alert: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#FF3B30', // Alert Red
    600: '#CC2F26',
    700: '#99231D',
    800: '#661713',
    900: '#330C0A',
  },

  // Neutral Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  success: '#32CD32', // Eco Green
  error: '#FF3B30', // Alert Red

  info: '#1E90FF', // Primary Blue

  // Background Colors
  background: {
    light: '#FFFFFF',
    dark: '#0F172A',
    card: {
      light: '#FFFFFF',
      dark: '#1E293B',
    },
    surface: {
      light: '#F9FAFB',
      dark: '#1F2937',
    },
  },

  // Text Colors
  text: {
    primary: {
      light: '#111827',
      dark: '#F9FAFB',
    },
    secondary: {
      light: '#6B7280',
      dark: '#9CA3AF',
    },
    muted: {
      light: '#9CA3AF',
      dark: '#6B7280',
    },
    inverse: {
      light: '#FFFFFF',
      dark: '#000000',
    },
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    dark: '#374151',
    focus: '#1E90FF',
    error: '#FF3B30',
  },

  // Water Quality Status Colors
  waterQuality: {
    excellent: '#32CD32', // Eco Green
    good: '#1E90FF', // Primary Blue
    fair: '#FFCC00', // Warning Yellow
    poor: '#FF9500', // Orange
    critical: '#FF3B30', // Alert Red
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
    lightBlue: 'rgba(30, 144, 255, 0.1)',
    lightGreen: 'rgba(50, 205, 50, 0.1)',
  },
};

export type Colors = typeof colors;
export default colors;


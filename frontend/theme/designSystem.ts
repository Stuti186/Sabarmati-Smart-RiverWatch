/**
 * Global Design System
 * Unified design tokens for the Sabarmati Riverfront Monitoring App
 * 2024/2025 Premium Modern UI
 */

export const DesignSystem = {
  // ===========================================
  // COLOR PALETTE
  // ===========================================
  colors: {
    // Primary Blues
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Main primary
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },

    // Sky Blue (Light accents)
    sky: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8', // Accent light
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
    },

    // Status Colors
    success: {
      light: '#D1FAE5',
      main: '#22C55E',
      dark: '#16A34A',
      gradient: ['#4ADE80', '#22C55E'] as const,
    },
    warning: {
      light: '#FEF3C7',
      main: '#FACC15',
      dark: '#EAB308',
      gradient: ['#FDE047', '#EAB308'] as const,
    },
    danger: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#DC2626',
      gradient: ['#F87171', '#EF4444'] as const,
    },
    info: {
      light: '#E0F2FE',
      main: '#0EA5E9',
      dark: '#0284C7',
      gradient: ['#38BDF8', '#0EA5E9'] as const,
    },

    // Text Colors
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },

    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      blue: '#E0F2FE',
      gradient: {
        start: '#38BDF8',
        end: '#1E3A8A',
      },
      softGradient: {
        start: '#E0F2FE',
        mid: '#F0F9FF',
        end: '#FFFFFF',
      },
    },

    // Card & Surface
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: 'rgba(255, 255, 255, 0.6)',
      borderLight: 'rgba(255, 255, 255, 0.3)',
      shadow: '#1E3A8A',
    },

    // Overlay & Glass
    overlay: {
      light: 'rgba(255, 255, 255, 0.9)',
      medium: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(0, 0, 0, 0.5)',
      blue: 'rgba(59, 130, 246, 0.1)',
    },
  },

  // ===========================================
  // GRADIENTS
  // ===========================================
  gradients: {
    // Primary blue gradient (main)
    primary: ['#38BDF8', '#2563EB'] as const,
    primaryDark: ['#2563EB', '#1E3A8A'] as const,
    primaryLight: ['#60A5FA', '#38BDF8'] as const,

    // Background gradients
    background: ['#38BDF8', '#1E3A8A'] as const,
    backgroundSoft: ['#E0F2FE', '#F0F9FF', '#FFFFFF'] as const,
    backgroundVertical: ['#38BDF8', '#2563EB', '#1E3A8A'] as const,

    // Status gradients
    success: ['#4ADE80', '#22C55E'] as const,
    warning: ['#FDE047', '#EAB308'] as const,
    danger: ['#F87171', '#EF4444'] as const,
    info: ['#38BDF8', '#0EA5E9'] as const,

    // Card gradients
    card: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'] as const,
    cardGlass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)'] as const,

    // Water quality
    excellent: ['#4ADE80', '#22C55E'] as const,
    good: ['#60A5FA', '#3B82F6'] as const,
    fair: ['#FACC15', '#EAB308'] as const,
    poor: ['#F87171', '#EF4444'] as const,
  },

  // ===========================================
  // SPACING
  // ===========================================
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,

    // Semantic spacing
    screenPadding: 20,
    cardPadding: 18,
    sectionGap: 16,
    itemGap: 12,
  },

  // ===========================================
  // BORDER RADIUS
  // ===========================================
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 26,
    full: 9999,

    // Semantic radius
    card: 22,
    button: 20,
    badge: 16,
    pill: 24,
    avatar: 50,
    input: 14,
  },

  // ===========================================
  // SHADOWS
  // ===========================================
  shadows: {
    sm: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    card: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    button: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
  },

  // ===========================================
  // TYPOGRAPHY
  // ===========================================
  typography: {
    // Font weights
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },

    // Font sizes
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },

    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Letter spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.3,
      wider: 0.5,
    },
  },

  // ===========================================
  // BLUR
  // ===========================================
  blur: {
    light: 40,
    medium: 60,
    heavy: 85,
    intense: 100,
  },

  // ===========================================
  // ANIMATION
  // ===========================================
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
    entrance: 600,
  },
} as const;

// Type exports
export type DesignSystemType = typeof DesignSystem;
export type Colors = typeof DesignSystem.colors;
export type Gradients = typeof DesignSystem.gradients;
export type Spacing = typeof DesignSystem.spacing;
export type Radius = typeof DesignSystem.radius;
export type Shadows = typeof DesignSystem.shadows;
export type Typography = typeof DesignSystem.typography;

export default DesignSystem;


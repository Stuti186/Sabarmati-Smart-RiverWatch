/**
 * Global UI Design System
 * Modern 2025-level design constants for consistent UI across the app
 * 
 * DO NOT modify business logic - this file is ONLY for styling constants
 */

// ============================================
// SPACING SCALE (8px base unit)
// ============================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20, // Standard screen horizontal padding
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
  full: 9999,
  button: 16,
  card: 20,
  input: 16,
  badge: 12,
  chip: 20,
  modal: 24,
} as const;

// ============================================
// SHADOWS
// ============================================
export const SHADOWS = {
  // Light shadows for cards
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  // Medium shadows for elevated cards
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  // Large shadows for floating elements
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  // Extra large for modals/bottom sheets
  xl: {
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  // Blue-tinted shadows for primary elements
  blue: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  // Glass effect shadow
  glass: {
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

// ============================================
// COLOR PALETTE
// ============================================
export const COLORS = {
  // Primary Blues
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Accent Colors
  accent: {
    cyan: '#06B6D4',
    sky: '#0EA5E9',
    teal: '#14B8A6',
  },
  
  // Status Colors
  status: {
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  
  // Severity Colors
  severity: {
    critical: '#DC2626',
    high: '#EF4444',
    moderate: '#FACC15',
    low: '#22C55E',
  },
  
  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    light: '#CBD5E1',
    white: '#FFFFFF',
    inverse: '#FFFFFF',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    card: 'rgba(255, 255, 255, 0.95)',
    cardSolid: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Border Colors
  border: {
    light: 'rgba(255, 255, 255, 0.3)',
    medium: '#E2E8F0',
    dark: '#CBD5E1',
    glass: 'rgba(255, 255, 255, 0.2)',
  },
} as const;

// ============================================
// GRADIENTS
// ============================================
export const GRADIENTS = {
  // Main app background
  background: {
    colors: ['#38BDF8', '#2563EB'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Primary button gradient
  primary: {
    colors: ['#3B82F6', '#2563EB'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Success gradient
  success: {
    colors: ['#22C55E', '#16A34A'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Danger gradient
  danger: {
    colors: ['#EF4444', '#DC2626'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Warning gradient
  warning: {
    colors: ['#F59E0B', '#D97706'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Header card gradient
  header: {
    colors: ['#3B82F6', '#1E40AF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Cyan accent
  cyan: {
    colors: ['#06B6D4', '#0891B2'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Purple accent
  purple: {
    colors: ['#8B5CF6', '#7C3AED'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const TYPOGRAPHY = {
  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
  },
} as const;

// ============================================
// COMPONENT DIMENSIONS
// ============================================
export const DIMENSIONS = {
  // Button heights
  button: {
    sm: 40,
    md: 48,
    lg: 54,
  },
  
  // Input heights
  input: {
    sm: 44,
    md: 52,
    lg: 56,
  },
  
  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
  
  // Avatar sizes
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  },
  
  // Card icon container
  iconContainer: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Bottom navigation
  bottomNav: {
    height: 70,
    bottomPadding: 24, // iOS safe area
  },
} as const;

// ============================================
// COMMON STYLES
// ============================================
export const COMMON_STYLES = {
  // Screen container
  screenContainer: {
    flex: 1,
  },
  
  // Screen content with padding
  screenContent: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
  },
  
  // Standard card
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  
  // Glass card
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border.glass,
    padding: SPACING.lg,
    ...SHADOWS.glass,
  },
  
  // Section header
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  
  // Row layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  // Center content
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Flex fill
  flex1: {
    flex: 1,
  },
  
  // Bottom spacer for tab bar
  bottomSpacer: {
    height: 100,
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status color based on status string
 */
export const getStatusColor = (status: 'success' | 'warning' | 'danger' | 'info') => {
  return COLORS.status[status];
};

/**
 * Get severity color based on severity level
 */
export const getSeverityColor = (severity: 'critical' | 'high' | 'moderate' | 'low') => {
  return COLORS.severity[severity];
};

/**
 * Create responsive spacing based on screen width
 */
export const responsiveSpacing = (baseValue: number, screenWidth: number) => {
  if (screenWidth < 360) return baseValue * 0.85;
  if (screenWidth > 428) return baseValue * 1.1;
  return baseValue;
};

export default {
  SPACING,
  RADIUS,
  SHADOWS,
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  DIMENSIONS,
  COMMON_STYLES,
  getStatusColor,
  getSeverityColor,
  responsiveSpacing,
};


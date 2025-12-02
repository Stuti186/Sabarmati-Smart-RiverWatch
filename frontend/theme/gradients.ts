/**
 * Gradient System
 * Smart River Watch Gradient Configuration
 * Ready-to-use gradient definitions for LinearGradient components
 */

import { colors } from './colors';

export const gradients = {
  // Primary Blue Gradients
  primary: {
    // Light to dark blue
    default: {
      colors: [colors.primary[400], colors.primary[600]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Deep blue gradient
    deep: {
      colors: [colors.primary[500], colors.deepBlue[500]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Light primary
    light: {
      colors: [colors.primary[300], colors.primary[500]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Dark primary
    dark: {
      colors: [colors.primary[600], colors.primary[800]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Eco Green Gradients
  eco: {
    // Default green gradient
    default: {
      colors: [colors.ecoGreen[400], colors.ecoGreen[600]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Light green
    light: {
      colors: [colors.ecoGreen[300], colors.ecoGreen[500]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Dark green
    dark: {
      colors: [colors.ecoGreen[600], colors.ecoGreen[800]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Water/River Theme Gradients
  water: {
    // Blue to cyan (water effect)
    flow: {
      colors: [colors.primary[500], '#00CED1'], // DodgerBlue to DarkTurquoise
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Deep water
    deep: {
      colors: [colors.deepBlue[500], colors.primary[700]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Ocean blue
    ocean: {
      colors: ['#1E90FF', '#0066CC', '#003366'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Nature/Environment Gradients
  nature: {
    // Sky gradient
    sky: {
      colors: ['#87CEEB', colors.primary[300]], // SkyBlue to Light Blue
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Forest gradient
    forest: {
      colors: [colors.ecoGreen[500], '#228B22'], // LimeGreen to ForestGreen
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Sunset gradient
    sunset: {
      colors: [colors.warning[500], '#FF6B35', '#C44536'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  },

  // Status Gradients
  status: {
    // Success gradient
    success: {
      colors: [colors.ecoGreen[400], colors.ecoGreen[600]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Warning gradient
    warning: {
      colors: [colors.warning[400], colors.warning[600]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Alert/Danger gradient
    alert: {
      colors: [colors.alert[400], colors.alert[600]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Info gradient
    info: {
      colors: [colors.primary[400], colors.primary[600]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Card/Background Gradients (improved)
  card: {
    // Subtle card gradient (enhanced)
    subtle: {
      colors: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Premium card gradient
    premium: {
      colors: [
        'rgba(255, 255, 255, 0.9)',
        'rgba(240, 248, 255, 0.8)',
        'rgba(230, 240, 255, 0.7)',
      ],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Dark card gradient
    dark: {
      colors: [colors.gray[800], colors.gray[900]],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Primary card (enhanced)
    primary: {
      colors: [
        'rgba(30, 144, 255, 0.1)',
        'rgba(30, 144, 255, 0.05)',
        'rgba(255, 255, 255, 0.9)',
      ],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Glass card gradient
    glass: {
      colors: [
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0.15)',
        'rgba(255, 255, 255, 0.05)',
      ],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Special Effect Gradients
  effects: {
    // Shimmer effect
    shimmer: {
      colors: [colors.gray[200], colors.gray[100], colors.gray[200]],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    // Glass morphism
    glass: {
      colors: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Overlay gradient
    overlay: {
      colors: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
} as const;

export type Gradients = typeof gradients;
export default gradients;


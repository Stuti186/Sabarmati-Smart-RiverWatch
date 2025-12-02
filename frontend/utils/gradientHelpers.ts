/**
 * Gradient Helpers
 * Utility functions for working with gradients
 */

/**
 * Type-safe gradient colors helper
 * Converts string[] to readonly tuple for LinearGradient
 */
export function getGradientColors(
  colors: readonly string[] | string[]
): readonly [string, string, ...string[]] {
  if (colors.length < 2) {
    throw new Error('Gradient must have at least 2 colors');
  }
  return colors as readonly [string, string, ...string[]];
}


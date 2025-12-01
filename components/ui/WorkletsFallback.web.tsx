/**
 * Web fallback for react-native-worklets
 * Worklets are not supported on web, so we provide empty implementations
 */

// Empty exports to prevent import errors
export const createWorklet = () => {};
export const runOnJS = (fn: any) => fn;
export const useWorklet = (fn: any) => fn;
export const useSharedValue = (value: any) => ({ value });
export const useAnimatedStyle = (fn: any) => ({});

export default {};


const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Store original resolver
const originalResolveRequest = config.resolver.resolveRequest;

// Add resolver for web platform to alias native modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, alias native modules to web fallbacks
  if (platform === 'web') {
    if (moduleName === 'expo-blur') {
      return {
        filePath: path.resolve(__dirname, 'components/ui/BlurView.web.tsx'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-maps') {
      return {
        filePath: path.resolve(__dirname, 'components/ui/MapView.web.tsx'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-worklets') {
      return {
        filePath: path.resolve(__dirname, 'components/ui/WorkletsFallback.web.tsx'),
        type: 'sourceFile',
      };
    }
  }
  // Use default resolution for other cases
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  // Fallback to default Metro resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Configure transformer for better web compatibility
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  // Enable source maps for better debugging
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Configure resolver to handle ESM modules better
config.resolver.unstable_enablePackageExports = true;
// Add source extensions if not already present
if (config.resolver.sourceExts && !config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs', 'cjs');
}

module.exports = withNativeWind(config, { input: './global.css' });


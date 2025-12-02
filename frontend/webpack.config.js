/**
 * Webpack config for Expo Web
 * This helps resolve platform-specific modules
 */

const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add resolve aliases for web fallbacks
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'expo-blur': path.resolve(__dirname, 'components/ui/BlurView.web.tsx'),
    'react-native-maps': path.resolve(__dirname, 'components/ui/MapView.web.tsx'),
  };

  return config;
};


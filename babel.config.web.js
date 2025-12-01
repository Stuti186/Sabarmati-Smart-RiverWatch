/**
 * Babel config for web platform
 * This helps transform imports for web compatibility
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          alias: {
            "expo-blur": "./components/ui/BlurView.web.tsx",
            "react-native-maps": "./components/ui/MapView.web.tsx",
          },
          extensions: [".web.tsx", ".web.ts", ".tsx", ".ts", ".jsx", ".js"],
        },
      ],
    ],
  };
};


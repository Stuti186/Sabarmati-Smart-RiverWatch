module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
      // Note: Module aliasing is handled by Metro resolver in metro.config.js
      // This ensures platform-specific resolution (web vs native)
    ],
  };
};


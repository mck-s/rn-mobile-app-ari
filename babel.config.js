console.error('>>> USING BABEL CONFIG FROM:', __filename);
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};

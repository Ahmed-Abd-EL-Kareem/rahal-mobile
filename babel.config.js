module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      'react-native-reanimated/plugin',
      ['module-resolver', {
        alias: {
          '@': './src',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@types': './src/types',
          '@utils': './src/utils',
          '@api': './src/api',
          '@constants': './src/constants',
          '@i18n': './src/i18n',
        },
      }],
    ],
  };
};
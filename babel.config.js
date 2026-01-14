module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/components': './src/components',
            '@/components/*': './src/components/*',
            '@/screens': './src/screens',
            '@/screens/*': './src/screens/*',
            '@/services': './src/services',
            '@/services/*': './src/services/*',
            '@/utils': './src/utils',
            '@/utils/*': './src/utils/*',
            '@/types': './src/types',
            '@/types/*': './src/types/*',
            '@/hooks': './src/hooks',
            '@/hooks/*': './src/hooks/*',
            '@/constants': './src/constants',
            '@/constants/*': './src/constants/*',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};


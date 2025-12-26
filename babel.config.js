module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/hooks': './src/hooks',
            '@/constants': './src/constants',
            '@/store': './src/store',
            '@/providers': './src/providers',
          },
        },
      ],
    ],
  };
};


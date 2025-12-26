// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ajouter la résolution des alias
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/screens': path.resolve(__dirname, 'src/screens'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/constants': path.resolve(__dirname, 'src/constants'),
    '@/store': path.resolve(__dirname, 'src/store'),
    '@/providers': path.resolve(__dirname, 'src/providers'),
  },
  sourceExts: [...(config.resolver.sourceExts || []), 'ts', 'tsx', 'css'],
};

module.exports = withNativeWind(config, { input: './global.css' });


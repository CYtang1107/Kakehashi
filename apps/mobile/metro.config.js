const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@kakehashi/shared': path.resolve(__dirname, '../../packages/shared'),
};

module.exports = config;

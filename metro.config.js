const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');

// This might resolve issues with certain packages, including Firebase
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;

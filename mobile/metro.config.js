const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  'bin',
  'txt',
  'jpg',
  'png',
  'json',
  'mp3',
  'otf',
  'ttf'
);

module.exports = config;
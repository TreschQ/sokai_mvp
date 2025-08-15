const { getDefaultConfig } = require('expo/webpack-config');

const config = getDefaultConfig(__dirname);

// Add React Native Web alias
config.resolve.alias = {
  ...config.resolve.alias,
  'react-native$': 'react-native-web',
  'react-native-web/dist/exports/View': 'react-native-web/dist/exports/View',
  'react-native-web/dist/exports/Text': 'react-native-web/dist/exports/Text',
  'react-native-web/dist/exports/StyleSheet': 'react-native-web/dist/exports/StyleSheet',
  'react-native-web/dist/exports/TouchableOpacity': 'react-native-web/dist/exports/TouchableOpacity',
  'react-native-web/dist/exports/SafeAreaView': 'react-native-web/dist/exports/SafeAreaView',
  'react-native-web/dist/exports/ScrollView': 'react-native-web/dist/exports/ScrollView',
  'react-native-web/dist/exports/ActivityIndicator': 'react-native-web/dist/exports/ActivityIndicator',
  'react-native-web/dist/exports/Alert': 'react-native-web/dist/exports/Alert',
  'react-native-web/dist/exports/Dimensions': 'react-native-web/dist/exports/Dimensions',
};

module.exports = config;
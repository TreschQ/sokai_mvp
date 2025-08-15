import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const navItems = [
  { route: 'Home' as keyof RootStackParamList, label: 'Home', icon: 'home' },
  { route: 'Profile' as keyof RootStackParamList, label: 'Player', icon: 'person' },
  { route: 'Exercises' as keyof RootStackParamList, label: 'Training', icon: 'fitness-center' },
];

const BottomBar = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const handleNav = (routeName: keyof RootStackParamList) => {
    if (route.name !== routeName) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => handleNav(item.route)}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={item.icon as any}
              size={22}
              color={route.name === item.route ? '#90CB25' : 'white'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  navbar: {
    width: '85%',
    maxWidth: 384,
    height: 48,
    backgroundColor: '#1C2127',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default BottomBar;
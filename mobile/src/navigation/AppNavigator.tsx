import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import TrainingScreen from '../screens/TrainingScreen';
import SokaiCardScreen from '../screens/SokaiCardScreen';
import AdminScreen from '../screens/AdminScreen';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Exercises: undefined;
  Training: undefined;
  SokaiCard: undefined;
  Admin: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0D0F11" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Exercises" component={ExercisesScreen} />
        <Stack.Screen name="Training" component={TrainingScreen} />
        <Stack.Screen name="SokaiCard" component={SokaiCardScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
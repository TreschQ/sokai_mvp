import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import BottomBar from '../components/BottomBar';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleConnectWallet = () => {
    // Simulate wallet connection for now
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0F11', '#006B15']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Sokai Club</Text>
          <Text style={styles.subtitle}>
            Join the club and track your football journey on-chain.
          </Text>
          <View style={styles.connectButtonContainer}>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectWallet}
            >
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomBar />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  connectButtonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  connectButton: {
    backgroundColor: '#3AA93A',
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3AA93A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomBar from '../components/BottomBar';
import Header from '../components/Header';

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#71E582', '#71E582']}
        style={styles.gradient}
      >
        <Header performanceScore={85} />
        
        <View style={styles.content}>
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>SOKAI Player Card</Text>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>Wallet Address:</Text>
                  <Text style={styles.address}>0x1234...5678</Text>
                  
                  <Text style={styles.label}>Performance Score:</Text>
                  <Text style={styles.score}>85 points</Text>
                  
                  <Text style={styles.label}>Level:</Text>
                  <Text style={styles.level}>Expert</Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>🏆 SOKAI Club Member</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => console.log('Refresh pressed')}
          >
            <Text style={styles.refreshButtonText}>🔄 Actualiser</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  infoContainer: {
    width: '100%',
    gap: 8,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  address: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  score: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  level: {
    color: '#90CB25',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerText: {
    color: '#90CB25',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
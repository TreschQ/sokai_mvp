import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomBar from '../components/BottomBar';

export default function AdminScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0F11', '#006B15']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Administration</Text>
            <Text style={styles.subtitle}>
              Panneau d'administration
            </Text>
            
            <View style={styles.adminContainer}>
              <View style={styles.adminCard}>
                <Text style={styles.adminTitle}>🔧 Outils d'administration</Text>
                <Text style={styles.adminDescription}>
                  Accès réservé aux administrateurs
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Fonctionnalités :</Text>
                <Text style={styles.infoText}>
                  • Gestion des utilisateurs{'\n'}
                  • Mint d'NFT pour utilisateurs{'\n'}
                  • Mise à jour des statistiques{'\n'}
                  • Monitoring du système
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
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
  },
  scrollContent: {
    flexGrow: 1,
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
  adminContainer: {
    width: '100%',
    gap: 16,
  },
  adminCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  adminDescription: {
    fontSize: 14,
    color: '#E5F3E5',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#E5F3E5',
    lineHeight: 20,
  },
});
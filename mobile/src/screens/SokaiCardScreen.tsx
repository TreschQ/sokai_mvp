import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomBar from '../components/BottomBar';

export default function SokaiCardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0F11', '#006B15']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Sokai Card</Text>
            <Text style={styles.subtitle}>
              Découvre ta carte personnalisée
            </Text>
            
            <View style={styles.cardPlaceholder}>
              <Text style={styles.cardText}>
                Votre carte SOKAI apparaîtra ici
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>À propos de votre carte :</Text>
              <Text style={styles.infoText}>
                • Carte unique et non-transférable{'\n'}
                • Stockée sur la blockchain Chiliz{'\n'}
                • Reflète vos performances{'\n'}
                • Preuve de vos compétences
              </Text>
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
  cardPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
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
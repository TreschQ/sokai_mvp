import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import BottomBar from '../components/BottomBar';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ExercisesScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleStartTraining = () => {
    navigation.navigate('Training');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0F11', '#006B15']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Exercices d'entraînement</Text>
          <Text style={styles.subtitle}>
            Améliore tes compétences avec nos exercices de football
          </Text>
          
          <View style={styles.exerciseContainer}>
            <TouchableOpacity 
              style={styles.exerciseCard}
              onPress={handleStartTraining}
            >
              <Text style={styles.exerciseTitle}>🏃‍♂️ Entraînement libre</Text>
              <Text style={styles.exerciseDescription}>
                Utilise ta caméra pour t'entraîner avec le ballon
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.exerciseCard, styles.disabledCard]}
              disabled
            >
              <Text style={styles.exerciseTitle}>🎯 Précision</Text>
              <Text style={styles.exerciseDescription}>
                Bientôt disponible
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.exerciseCard, styles.disabledCard]}
              disabled
            >
              <Text style={styles.exerciseTitle}>⚡ Vitesse</Text>
              <Text style={styles.exerciseDescription}>
                Bientôt disponible
              </Text>
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
  exerciseContainer: {
    width: '100%',
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledCard: {
    opacity: 0.5,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#E5F3E5',
  },
});
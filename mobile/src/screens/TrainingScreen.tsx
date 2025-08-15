import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'expo-camera';
import BottomBar from '../components/BottomBar';
import CameraTraining from '../components/CameraTraining';

export default function TrainingScreen() {
  const navigation = useNavigation();
  const [showCamera, setShowCamera] = useState(false);

  const handleStartCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de l\'accès à la caméra pour l\'entraînement.');
      return;
    }
    
    setShowCamera(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  if (showCamera) {
    return <CameraTraining onClose={handleCloseCamera} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0F11', '#006B15']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Entraînement</Text>
          <Text style={styles.subtitle}>
            Prêt à t'entraîner avec ton ballon ?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleStartCamera}
            >
              <Text style={styles.primaryButtonText}>📹 Démarrer la caméra</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>← Retour</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Instructions :</Text>
            <Text style={styles.infoText}>
              • Assure-toi d'avoir suffisamment de lumière{'\n'}
              • Garde ton ballon bien visible{'\n'}
              • Garde une distance d'environ 2 mètres{'\n'}
              • Reste dans le cadre de la caméra
            </Text>
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
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3AA93A',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#3AA93A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
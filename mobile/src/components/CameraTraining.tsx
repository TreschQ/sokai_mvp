import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraTrainingProps {
  onClose: () => void;
}

const CameraTraining: React.FC<CameraTrainingProps> = ({ onClose }) => {
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef<Camera>(null);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const recordedVideo = await cameraRef.current.recordAsync({
          quality: '720p',
          maxDuration: 60, // 60 seconds max
        });
        
        console.log('Video recorded:', recordedVideo.uri);
        // TODO: Process video for AI ball detection
        Alert.alert('Enregistrement terminé', 'Analyse en cours...');
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo');
      } finally {
        setIsRecording(false);
        setRecordingTime(0);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Entraînement</Text>
            <TouchableOpacity onPress={toggleCameraType} style={styles.flipButton}>
              <MaterialIcons name="flip-camera-ios" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Detection Area */}
          <View style={styles.detectionArea}>
            <View style={styles.detectionBox}>
              <Text style={styles.detectionText}>
                Garde le ballon dans cette zone
              </Text>
            </View>
          </View>

          {/* Footer Controls */}
          <View style={styles.footer}>
            {isRecording && (
              <View style={styles.recordingInfo}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <MaterialIcons 
                name={isRecording ? "stop" : "fiber-manual-record"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
            
            <Text style={styles.instructionText}>
              {isRecording ? 'Appuyez pour arrêter' : 'Appuyez pour commencer'}
            </Text>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flipButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  detectionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionBox: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.4,
    borderWidth: 2,
    borderColor: '#90CB25',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(144, 203, 37, 0.1)',
  },
  detectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: '#FF4444',
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CameraTraining;
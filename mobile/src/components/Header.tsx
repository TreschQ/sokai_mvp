import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  performanceScore?: number;
}

const Header: React.FC<HeaderProps> = ({ performanceScore = 0 }) => {
  return (
    <View style={styles.header}>
      <View style={styles.scoreContainer}>
        <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
        <Text style={styles.scoreText}>Score: {performanceScore}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>SOKAI</Text>
        <Text style={styles.subtitle}>Club</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
});

export default Header;
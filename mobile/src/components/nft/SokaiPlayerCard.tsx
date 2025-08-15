import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface SokaiPlayerCardProps {
  walletAddress: string;
  contractAddress: string;
}

const SokaiPlayerCard: React.FC<SokaiPlayerCardProps> = ({ walletAddress, contractAddress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>SOKAI Player Card</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Wallet Address:</Text>
          <Text style={styles.address}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Text>
          
          <Text style={styles.label}>Contract:</Text>
          <Text style={styles.address}>
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>🏆 SOKAI Club Member</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    maxWidth: 300,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
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
  footer: {
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
});

export default SokaiPlayerCard;
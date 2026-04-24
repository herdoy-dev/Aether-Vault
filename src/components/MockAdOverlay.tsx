import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useAdStore } from '../ads/adStore';

const { width, height } = Dimensions.get('window');

export function MockAdOverlay() {
  const { isViewing, timeLeft, type } = useAdStore();

  if (!isViewing) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ADVERTISEMENT ({type})</Text>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.message}>Please wait while the mock ad plays...</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.timer}>Reward in {Math.ceil(timeLeft / 1000)}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 9999,
    justifyContent: 'space-between',
    padding: 40,
    elevation: 10,
  },
  header: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 20,
  },
  message: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  timer: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

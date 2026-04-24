import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function BannerAd() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ADVERTISEMENT BANNER</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: '#2a2a35',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3a3a45',
  },
  text: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});

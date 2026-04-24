import React, { useEffect, useRef, useState } from 'react';
import { AppState, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import mobileAds from 'react-native-google-mobile-ads';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { useGameStore } from './src/gameStore';
import { AdManager, initializeAds } from './src/ads/AdManager';

type Scene = 'home' | 'game';

export default function App() {
  const loadFromDisk = useGameStore((s) => s.loadFromDisk);
  const [scene, setScene] = useState<Scene>('home');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadFromDisk();

    try {
      mobileAds()
        .initialize()
        .then(() => {
          initializeAds();
        });
    } catch (err) {
      console.error('[AdMob] Initialization skipped natively:', err);
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (scene === 'home') {
          AdManager.showAppOpenAd();
        }
      }
      appState.current = nextAppState;
    });

    setTimeout(() => {
      AdManager.showAppOpenAd();
    }, 2000);

    return () => {
      subscription.remove();
    };
  }, [loadFromDisk, scene]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {scene === 'home' && <HomeScreen onPlay={() => setScene('game')} />}
      {scene === 'game' && <GameScreen onHome={() => setScene('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
});

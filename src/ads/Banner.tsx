import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const BANNER_UNIT_ID = 'ca-app-pub-7106488480723857/9992010470';

export function BannerAd() {
  const [failed, setFailed] = useState(false);

  // Exits gracefully for internal dev cycles rather than triggering native hard-locks
  if (isExpoGo || failed) {
    return (
      <View style={[styles.container, styles.mockContainer]}>
        <Text style={styles.mockText}>Banner Ad (Disabled in Expo Go)</Text>
      </View>
    );
  }

  let AdMobBanner: any;
  let BannerAdSize: any;
  try {
    const admob = require('react-native-google-mobile-ads');
    AdMobBanner = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
  } catch (err) {
    return (
      <View style={[styles.container, styles.mockContainer]}>
        <Text style={styles.mockText}>AdMob SDK Missing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdMobBanner
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05050f',
  },
  mockContainer: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mockText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});

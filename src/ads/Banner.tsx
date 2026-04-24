import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as AdMobBanner, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_UNIT_ID = 'ca-app-pub-7106488480723857/9992010470';

export function BannerAd() {
  const [failed, setFailed] = useState(false);

  // If it fails to load natively (e.g. adblocker or no network), gracefully collapse
  if (failed) return null;

  return (
    <View style={styles.container}>
      <AdMobBanner
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // Safer default assuming no EU consent forms are wired
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
});

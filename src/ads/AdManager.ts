import { useGameStore } from '../gameStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const INTERSTITIAL_ID = 'ca-app-pub-7106488480723857/7365847138';
const REWARDED_ID = 'ca-app-pub-7106488480723857/5522904546';
const APP_OPEN_ID = 'ca-app-pub-7106488480723857/9302367452';

const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; 
const APP_OPEN_COOLDOWN_MS = 30 * 1000;         

// Dynamically bind classes if native is available
let InterstitialAd: any, RewardedAd: any, AppOpenAd: any, AdEventType: any, RewardedAdEventType: any;

if (!isExpoGo) {
  try {
    const admob = require('react-native-google-mobile-ads');
    InterstitialAd = admob.InterstitialAd;
    RewardedAd = admob.RewardedAd;
    AppOpenAd = admob.AppOpenAd;
    AdEventType = admob.AdEventType;
    RewardedAdEventType = admob.RewardedAdEventType;
  } catch (err) {
    console.log('[AdManager] Caught missing native binding.');
  }
}

let interstitial: any;
let rewarded: any;
let appOpen: any;

export function initializeAds() {
  if (isExpoGo || !InterstitialAd) return;

  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
  rewarded = RewardedAd.createForAdRequest(REWARDED_ID);
  appOpen = AppOpenAd.createForAdRequest(APP_OPEN_ID);

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    interstitial.load();
  });

  rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    rewarded.load();
  });

  appOpen.addAdEventListener(AdEventType.CLOSED, () => {
    appOpen.load();
  });

  interstitial.load();
  rewarded.load();
  appOpen.load();
}

export const AdManager = {
  showRewardedAd: (onReward: () => void) => {
    return new Promise<void>((resolve) => {
      if (isExpoGo || !RewardedAd) {
        console.log('[AdManager: ExpoGo] Resolving mock rewarded ad.');
        useGameStore.getState().recordAdWatch();
        onReward();
        return resolve();
      }

      if (!rewarded || !rewarded.loaded) {
        console.log('[AdMob] Rewarded Ad not loaded yet. Granting reward fallback.');
        onReward();
        return resolve();
      }

      const rewardListener = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        useGameStore.getState().recordAdWatch();
        onReward();
      });

      const closeListener = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        rewardListener(); 
        closeListener();
        resolve();
      });

      rewarded.show();
    });
  },

  showInterstitialAd: () => {
    return new Promise<void>((resolve) => {
      const { lastInterstitialTime, setLastInterstitialTime, recordAdWatch } = useGameStore.getState();
      const now = Date.now();

      if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
        return resolve();
      }

      if (isExpoGo || !InterstitialAd) {
        console.log('[AdManager: ExpoGo] Skipping Interstitial mock.');
        setLastInterstitialTime(Date.now());
        recordAdWatch();
        return resolve();
      }

      if (!interstitial || !interstitial.loaded) {
        return resolve();
      }

      const closeListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        setLastInterstitialTime(Date.now());
        recordAdWatch();
        closeListener();
        resolve();
      });

      interstitial.show();
    });
  },

  showAppOpenAd: () => {
    return new Promise<void>((resolve) => {
      const { lastAppOpenTime, setLastAppOpenTime, recordAdWatch } = useGameStore.getState();
      const now = Date.now();

      if (now - lastAppOpenTime < APP_OPEN_COOLDOWN_MS) {
        return resolve();
      }

      if (isExpoGo || !AppOpenAd) {
        console.log('[AdManager: ExpoGo] Skipping AppOpen mock.');
        setLastAppOpenTime(Date.now());
        recordAdWatch();
        return resolve();
      }

      if (!appOpen || !appOpen.loaded) {
        return resolve();
      }

      const closeListener = appOpen.addAdEventListener(AdEventType.CLOSED, () => {
        setLastAppOpenTime(Date.now());
        recordAdWatch();
        closeListener();
        resolve();
      });

      appOpen.show();
    });
  }
};

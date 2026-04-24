import { useGameStore } from '../gameStore';
import { InterstitialAd, RewardedAd, AppOpenAd, AdEventType, RewardedAdEventType } from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID = 'ca-app-pub-7106488480723857/7365847138';
const REWARDED_ID = 'ca-app-pub-7106488480723857/5522904546';
const APP_OPEN_ID = 'ca-app-pub-7106488480723857/9302367452';

const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; 
const APP_OPEN_COOLDOWN_MS = 30 * 1000;         

let interstitial: InterstitialAd;
let rewarded: RewardedAd;
let appOpen: AppOpenAd;

export function initializeAds() {
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
      // If ad isn't loaded (e.g., rapid clicks or bad connectivity), 
      // we can choose to grant the reward instead of bricking the flow,
      // or reject. We gracefully grant it here so UI is never stuck.
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
        // Unsubscribe to avoid memory leaks
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

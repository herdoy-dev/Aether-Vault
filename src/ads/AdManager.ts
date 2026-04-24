import { useGameStore } from '../gameStore';
import { useAdStore } from './adStore';

const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const APP_OPEN_COOLDOWN_MS = 30 * 1000;         // 30 seconds

export const AdManager = {
  showRewardedAd: (onReward: () => void) => {
    return new Promise<void>((resolve) => {
      useAdStore.getState().playAd('rewarded', 3000, () => {
        useGameStore.getState().recordAdWatch();
        onReward();
        resolve();
      });
    });
  },

  showInterstitialAd: () => {
    return new Promise<void>((resolve) => {
      const { lastInterstitialTime, setLastInterstitialTime, recordAdWatch } = useGameStore.getState();
      const now = Date.now();

      if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
        console.log('[AdManager] Interstitial skipped (cooldown active)');
        return resolve();
      }

      useAdStore.getState().playAd('interstitial', 2000, () => {
        setLastInterstitialTime(Date.now());
        recordAdWatch();
        resolve();
      });
    });
  },

  showAppOpenAd: () => {
    return new Promise<void>((resolve) => {
      const { lastAppOpenTime, setLastAppOpenTime, recordAdWatch } = useGameStore.getState();
      const now = Date.now();

      if (now - lastAppOpenTime < APP_OPEN_COOLDOWN_MS) {
        console.log('[AdManager] AppOpen Ad skipped (cooldown active)');
        return resolve();
      }

      useAdStore.getState().playAd('appOpen', 2000, () => {
        setLastAppOpenTime(Date.now());
        recordAdWatch();
        resolve();
      });
    });
  }
};

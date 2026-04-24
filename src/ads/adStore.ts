import { create } from 'zustand';

type AdState = {
  isViewing: boolean;
  timeLeft: number;
  type: 'rewarded' | 'interstitial' | 'appOpen' | null;
};

type AdActions = {
  playAd: (type: AdState['type'], durationMs: number, onComplete: () => void) => void;
  tick: () => void;
};

export const useAdStore = create<AdState & AdActions>((set, get) => ({
  isViewing: false,
  timeLeft: 0,
  type: null,

  playAd: (type, durationMs, onComplete) => {
    set({ isViewing: true, timeLeft: durationMs, type });
    
    const interval = setInterval(() => {
      const left = get().timeLeft - 1000;
      if (left <= 0) {
        clearInterval(interval);
        set({ isViewing: false, timeLeft: 0, type: null });
        onComplete();
      } else {
        set({ timeLeft: left });
      }
    }, 1000);
  },

  tick: () => {}, // unused
}));

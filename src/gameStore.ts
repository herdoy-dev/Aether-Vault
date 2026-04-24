import { create } from 'zustand';
import { kv } from './storage';

export type BoxState = 'closed' | 'points' | 'keys' | 'empty' | 'jackpot';

type State = {
  keys: number;
  points: number;
  currentLevel: number;
  levelBoxes: BoxState[]; // array of 10 statuses
  adsWatched: number;
  lastInterstitialTime: number;
  lastAppOpenTime: number;
};

type Actions = {
  loadFromDisk: () => void;
  addKeys: (amount: number) => void;
  useKey: () => boolean;
  addPoints: (amount: number) => void;
  openBox: (index: number, reward: BoxState) => void;
  nextLevel: () => void;
  recordAdWatch: () => void;
  setLastInterstitialTime: (time: number) => void;
  setLastAppOpenTime: (time: number) => void;
};

const INITIAL_LEVEL_BOXES: BoxState[] = Array(10).fill('closed');

const persist = (s: State) => {
  kv.setNumber('keys', s.keys);
  kv.setNumber('points', s.points);
  kv.setNumber('currentLevel', s.currentLevel);
  kv.setString('levelBoxes', JSON.stringify(s.levelBoxes));
  kv.setNumber('adsWatched', s.adsWatched);
  kv.setNumber('lastInterstitialTime', s.lastInterstitialTime);
  kv.setNumber('lastAppOpenTime', s.lastAppOpenTime);
};

export const useGameStore = create<State & Actions>((set, get) => ({
  keys: 3,
  points: 0,
  currentLevel: 1,
  levelBoxes: INITIAL_LEVEL_BOXES,
  adsWatched: 0,
  lastInterstitialTime: 0,
  lastAppOpenTime: 0,

  loadFromDisk: () => {
    let boxes = INITIAL_LEVEL_BOXES;
    try {
      const boxesStr = kv.getString('levelBoxes');
      if (boxesStr) boxes = JSON.parse(boxesStr);
    } catch {}

    const next: State = {
      keys: kv.getNumber('keys', 3),
      points: kv.getNumber('points', 0),
      currentLevel: kv.getNumber('currentLevel', 1),
      levelBoxes: boxes,
      adsWatched: kv.getNumber('adsWatched', 0),
      lastInterstitialTime: kv.getNumber('lastInterstitialTime', 0),
      lastAppOpenTime: kv.getNumber('lastAppOpenTime', 0),
    };
    set(next);
  },

  addKeys: (amount) => {
    const keys = get().keys + amount;
    set({ keys });
    persist(get());
  },

  useKey: () => {
    const { keys } = get();
    if (keys <= 0) return false;
    set({ keys: keys - 1 });
    persist(get());
    return true;
  },

  addPoints: (amount) => {
    const points = get().points + amount;
    set({ points });
    persist(get());
  },

  openBox: (index, reward) => {
    const newBoxes = [...get().levelBoxes];
    newBoxes[index] = reward;
    set({ levelBoxes: newBoxes });
    persist(get());
  },

  nextLevel: () => {
    const nextLevel = get().currentLevel + 1;
    set({ currentLevel: nextLevel, levelBoxes: INITIAL_LEVEL_BOXES });
    persist(get());
  },

  recordAdWatch: () => {
    const adsWatched = get().adsWatched + 1;
    set({ adsWatched });
    persist(get());
  },

  setLastInterstitialTime: (time) => {
    set({ lastInterstitialTime: time });
    persist(get());
  },

  setLastAppOpenTime: (time) => {
    set({ lastAppOpenTime: time });
    persist(get());
  },
}));

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import { useGameStore, BoxState } from '../gameStore';
import { AdManager } from '../ads/AdManager';
import { BannerAd } from '../ads/Banner';
import { NeonBackground } from '../components/NeonBackground';
import { NeonButton } from '../components/NeonButton';
import { StatPill } from '../components/StatPill';
import { CustomDialog, DialogAction } from '../components/CustomDialog';
import { colors, radius, glass } from '../theme';

// Local pure component for physical Treasure Box physics
const AnimatedBoxComponent = ({ state, onAttemptOpen }: { state: BoxState, onAttemptOpen: () => boolean }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const [fakeOpen, setFakeOpen] = useState(false); // Used to delay the payload reveal until animation hits apex

  const isOpen = state !== 'closed';
  const visuallyOpen = isOpen || fakeOpen;

  const handlePress = () => {
    if (visuallyOpen) return;
    
    // Check if we are allowed to open it (e.g. have keys)
    const success = onAttemptOpen();
    if (!success) {
      // Small locked wiggle
      rotate.value = withSequence(withTiming(-5, {duration: 50}), withTiming(5, {duration: 100}), withTiming(0, {duration: 50}));
      return;
    }

    // Full jump and crack open animation
    scale.value = withSequence(
      withTiming(0.85, { duration: 150 }), 
      withSpring(1.05, { damping: 12 }), 
      withSpring(1)
    );
    translateY.value = withSequence(
      withTiming(0, {duration: 150}),
      withTiming(-20, { duration: 150 }), 
      withSpring(0)
    );
    
    setTimeout(() => {
      setFakeOpen(true); // Reveal the payload exact at the jump apex visually!
    }, 250);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ]
  }));

  return (
    <Animated.View style={[styles.boxWrapper, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.box,
          visuallyOpen && styles.boxOpen,
          state === 'empty' && styles.boxEmpty,
          state === 'jackpot' && styles.boxJackpot
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {visuallyOpen ? (
          <View style={styles.rewardContainer}>
            {state === 'points' && <Ionicons name="star" size={42} color={colors.cyan} />}
            {state === 'keys' && <Text style={{fontSize: 38}}>🗝️</Text>}
            {state === 'jackpot' && <Ionicons name="diamond" size={42} color={colors.pink} />}
            {state === 'empty' && <Ionicons name="close-circle" size={42} color={colors.textFaint} />}
          </View>
        ) : (
          <Text style={styles.chestEmoji}>🧰</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

type Props = {
  onHome: () => void;
};

export function GameScreen({ onHome }: Props) {
  const { keys, points, currentLevel, levelBoxes, useKey, openBox, addKeys, addPoints, nextLevel } = useGameStore();

  // Custom Dialog State System
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actions: DialogAction[];
  }>({ visible: false, title: '', message: '', actions: [] });

  const closeDialog = () => setDialogConfig(prev => ({ ...prev, visible: false }));

  const handleBoxAttempt = (index: number): boolean => {
    if (keys <= 0) {
      setDialogConfig({
        visible: true,
        title: "OUT OF KEYS",
        message: "You need more ancient keys to pry this box open. View a quick scrying ad to get a key?",
        actions: [
          { text: "GET KEY", variant: 'cyan', onPress: () => {
              closeDialog();
              setTimeout(() => {
                AdManager.showRewardedAd(() => addKeys(1));
              }, 400); // Slight delay allowing modal to close visually
            } 
          },
          { text: "NOT NOW", variant: 'ghost', onPress: closeDialog }
        ]
      });
      return false; // Denied opening
    }

    if (!useKey()) return false; 

    const emptyChance = Math.min(0.7, 0.1 + (currentLevel * 0.015));
    const r = Math.random();
    
    let reward: BoxState = 'empty';
    let rewardPoints = 0;
    
    if (r < emptyChance) {
      reward = 'empty';
    } else if (r < emptyChance + 0.1) {
      reward = 'jackpot';
      rewardPoints = 1000;
      addPoints(1000);
    } else if (r < emptyChance + 0.2) {
      reward = 'keys';
      addKeys(1); 
    } else {
      reward = 'points';
      rewardPoints = 50 + (currentLevel * 10);
      addPoints(rewardPoints);
    }

    openBox(index, reward);

    // Give the box time to animate its jump before popping standard UI delays
    if (reward === 'points' || reward === 'jackpot') {
      setTimeout(() => {
        setDialogConfig({
          visible: true,
          title: "ENCHANTED FIND",
          message: `You tapped into a surge of ${rewardPoints} arcane points. Double it immediately?`,
          actions: [
            { text: "DOUBLE IT", variant: 'pink', onPress: () => {
                closeDialog();
                setTimeout(() => {
                  AdManager.showRewardedAd(() => addPoints(rewardPoints));
                }, 400);
              } 
            },
            { text: "COLLECT", variant: 'ghost', onPress: closeDialog }
          ]
        });
      }, 1000); 
    }

    return true; // Successfully consumed key and proceeded
  };

  const handleNextLevel = () => {
    nextLevel();
    AdManager.showInterstitialAd().then(() => onHome());
  };

  const hasOpenedBox = levelBoxes.some(b => b !== 'closed');

  return (
    <View style={styles.container}>
      <NeonBackground />

      <View style={[styles.header, glass.heavy]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => AdManager.showInterstitialAd().then(onHome)}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.levelText}>LEVEL {currentLevel}</Text>
        <StatPill
          accent="gold"
          label={keys.toString()}
          icon={<Ionicons name="key" size={14} color={colors.gold} />}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {levelBoxes.map((state, i) => (
             <AnimatedBoxComponent key={i} state={state} onAttemptOpen={() => handleBoxAttempt(i)} />
          ))}
        </View>

        {hasOpenedBox && (
          <NeonButton
            variant="cyan"
            size="lg"
            label="COMPLETE LEVEL"
            icon={<Ionicons name="chevron-forward" size={24} color="#000" />}
            onPress={handleNextLevel}
            style={styles.nextBtn}
          />
        )}
      </ScrollView>

      <BannerAd />

      <CustomDialog {...dialogConfig} onClose={closeDialog} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    zIndex: 10,
  },
  backBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
  },
  levelText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: colors.cyanGlow,
    textShadowRadius: 15,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Using mathematical spacing instead of unsupported gap issues
    width: '100%',
    marginBottom: 40,
  },
  boxWrapper: {
    width: '46%', // 46 + 46 = 92% leaving 8% center buffer inside `space-between`
    marginBottom: 16,
  },
  box: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  chestEmoji: {
    fontSize: 54,
    textShadowColor: colors.goldGlow,
    textShadowRadius: 15,
    textShadowOffset: { width: 0, height: 0 }
  },
  boxOpen: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.05)',
    shadowOpacity: 0,
    elevation: 0,
  },
  boxEmpty: {
    backgroundColor: 'rgba(10,10,15,0.8)',
  },
  boxJackpot: {
    borderColor: colors.pink,
    shadowColor: colors.pink,
    shadowOpacity: 0.7,
  },
  rewardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    width: '100%',
    shadowOpacity: 0.5,
  },
});

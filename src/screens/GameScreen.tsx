import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore, BoxState } from '../gameStore';
import { AdManager } from '../ads/AdManager';
import { BannerAd } from '../ads/Banner';
import { NeonBackground } from '../components/NeonBackground';
import { NeonButton } from '../components/NeonButton';
import { StatPill } from '../components/StatPill';
import { colors, radius, glass } from '../theme';

type Props = {
  onHome: () => void;
};

export function GameScreen({ onHome }: Props) {
  const { keys, points, currentLevel, levelBoxes, useKey, openBox, addKeys, addPoints, nextLevel } = useGameStore();

  const handleBoxPress = (index: number) => {
    if (levelBoxes[index] !== 'closed') return; 
    
    if (keys <= 0) {
      Alert.alert(
        "Out of Keys!",
        "Watch a short video ad to get a key and open this box.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Watch Ad", onPress: () => {
              AdManager.showRewardedAd(() => addKeys(1));
            }
          }
        ]
      );
      return;
    }

    if (!useKey()) return; 

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

    if (reward === 'points' || reward === 'jackpot') {
      setTimeout(() => {
        Alert.alert(
          "Nice Find!",
          `You found ${rewardPoints} points! Watch an ad to DOUBLE it?`,
          [
            { text: "No thanks", style: "cancel" },
            { 
              text: "Double It!", 
              onPress: () => {
                AdManager.showRewardedAd(() => {
                  addPoints(rewardPoints);
                  Alert.alert("Doubled!", `You received an extra ${rewardPoints} points.`);
                });
              }
            }
          ]
        );
      }, 500);
    }
  };

  const handleNextLevel = () => {
    nextLevel();
    AdManager.showInterstitialAd().then(() => onHome());
  };

  const hasOpenedBox = levelBoxes.some(b => b !== 'closed');

  return (
    <View style={styles.container}>
      <NeonBackground />

      {/* Floating Glass Header */}
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
          {levelBoxes.map((state, i) => {
            const isOpen = state !== 'closed';
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.box,
                  isOpen && styles.boxOpen,
                  state === 'empty' && styles.boxEmpty,
                  state === 'jackpot' && styles.boxJackpot
                ]}
                onPress={() => handleBoxPress(i)}
                activeOpacity={0.7}
              >
                {isOpen ? (
                  <View style={styles.rewardContainer}>
                    {state === 'points' && <Ionicons name="star" size={36} color={colors.cyan} />}
                    {state === 'keys' && <Ionicons name="key" size={36} color={colors.gold} />}
                    {state === 'jackpot' && <Ionicons name="diamond" size={36} color={colors.pink} />}
                    {state === 'empty' && <Ionicons name="close-circle" size={36} color={colors.textFaint} />}
                  </View>
                ) : (
                  <Ionicons name="cube" size={54} color={colors.gold} />
                )}
              </TouchableOpacity>
            );
          })}
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
    padding: 24,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 40,
  },
  box: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: colors.gold,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
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

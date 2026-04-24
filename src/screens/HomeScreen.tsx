import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../gameStore';
import { AdManager } from '../ads/AdManager';
import { BannerAd } from '../ads/Banner';
import { NeonBackground } from '../components/NeonBackground';
import { NeonButton } from '../components/NeonButton';
import { StatPill } from '../components/StatPill';
import { colors, glass } from '../theme';

type Props = {
  onPlay: () => void;
};

export function HomeScreen({ onPlay }: Props) {
  const { keys, points, currentLevel, addKeys } = useGameStore();

  const handleWatchAd = () => {
    AdManager.showRewardedAd(() => {
      addKeys(1);
    });
  };

  return (
    <View style={styles.container}>
      <NeonBackground />
      
      {/* Floating Island Header */}
      <View style={[styles.headerIsland, glass.container]}>
        <StatPill
          accent="gold"
          label={keys.toString()}
          sub="KEYS"
          icon={<Ionicons name="key" size={16} color={colors.gold} />}
        />
        <StatPill
          accent="cyan"
          label={points.toString()}
          sub="POINTS"
          icon={<Ionicons name="star" size={16} color={colors.cyan} />}
        />
      </View>

      <View style={styles.center}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleSubtitle}>THE</Text>
          <Text style={styles.title}>AETHER</Text>
          <Text style={styles.title}>VAULT</Text>
        </View>
        <Text style={styles.subtitle}>LEVEL {currentLevel}</Text>

        <NeonButton
          variant="cyan"
          size="lg"
          label={`PLAY LEVEL ${currentLevel}`}
          onPress={onPlay}
          style={styles.btn}
        />

        <NeonButton
          variant="outline-pink"
          size="md"
          label="WATCH AD"
          sub="FOR +1 KEY"
          icon={<Ionicons name="play-circle" size={24} color={colors.pink} />}
          onPress={handleWatchAd}
          style={styles.btnOutline}
        />
      </View>

      <BannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep, justifyContent: 'space-between' },
  headerIsland: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 30,
    marginTop: 60,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 2,
    lineHeight: 52,
    textShadowColor: colors.goldGlow,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
    textAlign: 'center',
  },
  titleSubtitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: -4,
  },
  subtitle: {
    fontSize: 20,
    color: colors.cyan,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: 8,
    marginBottom: 50,
    textShadowColor: colors.cyanGlow,
    textShadowRadius: 10,
  },
  btn: {
    width: '100%',
    marginBottom: 24,
  },
  btnOutline: {
    width: '80%',
    marginBottom: 10,
  },
});

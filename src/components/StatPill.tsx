import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, glass } from '../theme';

type Props = {
  accent: 'cyan' | 'pink' | 'gold';
  icon?: React.ReactNode;
  label: string;
  sub?: string;
};

const ACCENT = {
  cyan: { color: colors.cyan, glow: colors.cyanGlow },
  pink: { color: colors.pink, glow: colors.pinkGlow },
  gold: { color: colors.gold, glow: colors.goldGlow },
};

export function StatPill({ accent, icon, label, sub }: Props) {
  const a = ACCENT[accent];
  return (
    <View style={[styles.container, glass.container]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: a.color, textShadowColor: a.glow }]}>
          {label}
        </Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    overflow: 'hidden',
    // slight blur filter logic usually applies in styling conceptually 
    // but RN needs Expo BlurView. We simulate it via glass.container overlay setup here.
  },
  icon: { justifyContent: 'center', alignItems: 'center' },
  textCol: { flexDirection: 'column' },
  label: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowRadius: 10,
  },
  sub: { color: colors.textDim, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
});

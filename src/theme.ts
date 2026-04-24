export const colors = {
  bg: '#0a0a1a',
  bgDeep: '#05050f',
  card: '#12122a',
  cardBorder: '#1f1f3e',

  cyan: '#00f0ff',
  cyanDeep: '#0099ff',
  cyanGlow: 'rgba(0, 240, 255, 0.55)',

  pink: '#ff2277',
  pinkDeep: '#ff0066',
  pinkGlow: 'rgba(255, 34, 119, 0.55)',

  gold: '#ffd700',
  goldDeep: '#ff8c00',
  goldGlow: 'rgba(255, 215, 0, 0.55)',

  white: '#ffffff',
  text: '#e8e8ff',
  textDim: '#8888aa',
  textFaint: '#55557a',
};

export const gradients = {
  bg: ['#0a0a1a', '#15153a', '#0a0a1a'] as const,
  cyan: ['#00f0ff', '#0099ff'] as const,
  pink: ['#ff4488', '#ff0066'] as const,
  gold: ['#ffea00', '#ff8c00'] as const,
  dark: ['#1a1a3e', '#0a0a1a'] as const,
};

export const glass = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  heavy: {
    backgroundColor: 'rgba(10, 10, 26, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  }
};

export const shadows = {
  cyan: { shadowColor: colors.cyan, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  pink: { shadowColor: colors.pink, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  gold: { shadowColor: colors.gold, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  dark: { shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 15, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { NeonButton } from './NeonButton';
import { colors, glass, radius } from '../theme';

export type DialogAction = {
  text: string;
  onPress: () => void;
  variant?: 'cyan' | 'outline-pink' | 'ghost' | 'pink'; 
};

type Props = {
  visible: boolean;
  title: string;
  message: string;
  actions: DialogAction[];
  onClose?: () => void; // Called when background is tapped, optional
};

export function CustomDialog({ visible, title, message, actions, onClose }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const [internalVisible, setInternalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      opacity.value = withTiming(1, { duration: 250 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setInternalVisible)(false);
      });
      scale.value = withTiming(0.95, { duration: 200 });
    }
  }, [visible]);

  if (!internalVisible) return null;

  const bgStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal transparent visible={internalVisible} animationType="none">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, bgStyle]} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[styles.card, glass.heavy, cardStyle]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.actions}>
            {actions.map((act, i) => (
              <NeonButton
                key={i}
                variant={act.variant || 'cyan'}
                size="md"
                label={act.text}
                onPress={act.onPress}
                style={styles.btn}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: radius.xl,
    alignItems: 'center',
    elevation: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.gold,
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: colors.goldGlow,
    textShadowRadius: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  }
});

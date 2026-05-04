import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../utils/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient colors={disabled ? ['#75647d', '#66596f'] : ['#ff8fdc', '#8e64ff', '#33d6ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 24,
    shadowColor: theme.colors.blue,
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.65,
  },
  gradient: {
    minHeight: 58,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});

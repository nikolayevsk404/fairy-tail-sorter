import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { theme } from '../utils/theme';

type GlassCardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={38}
        tint="dark"
        blurMethod={Platform.OS === 'android' ? 'none' : undefined}
        style={styles.blur}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  blur: {
    padding: theme.spacing.lg,
  },
});

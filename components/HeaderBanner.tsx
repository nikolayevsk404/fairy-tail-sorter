import { Image, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from './GlassCard';
import { theme } from '../utils/theme';

type HeaderBannerProps = {
  title?: string;
};

export function HeaderBanner({
  title = 'Fairy Tail Art Guild',
}: HeaderBannerProps) {
  return (
    <GlassCard style={styles.wrapper}>
      <View style={styles.inner}>
        <View style={styles.badge}>
          <Image source={require('../assets/fairy-tail-mark.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.xl,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logo: {
    width: 70,
    height: 70,
  },
  texts: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.gold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../utils/theme';

type RemainingBadgeProps = {
  remaining: number;
  total: number;
};

export function RemainingBadge({ remaining, total }: RemainingBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Participantes restantes: {remaining}</Text>
      <Text style={styles.meta}>Total validos: {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  meta: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
});

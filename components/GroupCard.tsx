import { StyleSheet, Text, View } from 'react-native';

import { DrawGroup } from '../utils/types';
import { GlassCard } from './GlassCard';
import { theme } from '../utils/theme';

type GroupCardProps = {
  group: DrawGroup;
};

export function GroupCard({ group }: GroupCardProps) {
  return (
    <View style={styles.wrapper}>
      <GlassCard>
        <Text style={styles.title}>✨ Grupo {group.index}</Text>
        <View style={styles.members}>
          {group.members.map((member) => (
            <View key={`${group.id}-${member}`} style={styles.memberPill}>
              <Text style={styles.memberText}>{member}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.gold,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  members: {
    gap: 10,
  },
  memberPill: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  memberText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFairyTailDraw } from '../hooks/useFairyTailDraw';
import { CompletionBurst } from '../components/CompletionBurst';
import { GlassCard } from '../components/GlassCard';
import { GroupCard } from '../components/GroupCard';
import { HeaderBanner } from '../components/HeaderBanner';
import { MagicalBackground } from '../components/MagicalBackground';
import { ModeSelector } from '../components/ModeSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { RemainingBadge } from '../components/RemainingBadge';
import { theme } from '../utils/theme';

export function HomeScreen() {
  const {
    state,
    isHydrated,
    isSorting,
    shouldShowCompletionBurst,
    updateInputText,
    updateMode,
    sortNextGroup,
    resetLottery,
    copyResults,
    shareResults,
  } = useFairyTailDraw();

  const canSort = state.remainingParticipants.length >= state.mode;
  const hasGroups = state.groups.length > 0;

  return (
    <View style={styles.container}>
      <MagicalBackground />
      {shouldShowCompletionBurst ? <CompletionBurst /> : null}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <HeaderBanner />

          <GlassCard>
            <Text style={styles.sectionTitle}>Participantes</Text>
            <Text style={styles.helper}>Um nome por linha. O app remove linhas vazias, espacos extras e nomes duplicados.</Text>
            <TextInput
              multiline
              placeholder={'Armin\nCastiel\nLysandre\nNathaniel'}
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
              value={state.inputText}
              onChangeText={updateInputText}
              textAlignVertical="top"
            />
            <View style={styles.sectionGap}>
              <Text style={styles.label}>Modo de sorteio</Text>
              <ModeSelector value={state.mode} onChange={updateMode} />
              <Text style={styles.modeHint}>Cada grupo tera {state.mode} participante{state.mode > 1 ? 's' : ''}.</Text>
            </View>
            <View style={styles.sectionGap}>
              <RemainingBadge remaining={state.remainingParticipants.length} total={state.participants.length} />
            </View>
            <View style={styles.buttonStack}>
              <PrimaryButton label={isSorting ? 'Sorteando...' : 'Sortear'} onPress={sortNextGroup} disabled={!isHydrated || isSorting || !canSort} />
              <Pressable onPress={resetLottery} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Reiniciar Sorteio</Text>
              </Pressable>
            </View>
            <Text style={styles.statusText}>{state.statusMessage}</Text>
          </GlassCard>

          <GlassCard>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Grupos sorteados</Text>
              <View style={styles.actions}>
                <Pressable onPress={copyResults} disabled={!hasGroups} style={[styles.actionChip, !hasGroups && styles.actionChipDisabled]}>
                  <Text style={styles.actionText}>Copiar</Text>
                </Pressable>
                <Pressable onPress={shareResults} disabled={!hasGroups} style={[styles.actionChip, !hasGroups && styles.actionChipDisabled]}>
                  <Text style={styles.actionText}>Compartilhar</Text>
                </Pressable>
              </View>
            </View>

            {hasGroups ? (
              state.groups.map((group) => <GroupCard key={group.id} group={group} />)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhum grupo ainda</Text>
                <Text style={styles.emptyText}>Toque em Sortear para criar o primeiro card da guilda.</Text>
              </View>
            )}
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgTop,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 72,
    paddingHorizontal: 18,
    paddingBottom: 36,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  helper: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    minHeight: 190,
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(8, 7, 25, 0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: theme.colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    lineHeight: 22,
  },
  label: {
    color: theme.colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  modeHint: {
    marginTop: 10,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionGap: {
    marginTop: 18,
  },
  buttonStack: {
    marginTop: 18,
    gap: 12,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  statusText: {
    marginTop: 16,
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  resultsHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionChip: {
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  actionChipDisabled: {
    opacity: 0.4,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

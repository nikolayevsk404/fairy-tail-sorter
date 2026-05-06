import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '../components/GlassCard';
import { GroupCard } from '../components/GroupCard';
import { HeaderBanner } from '../components/HeaderBanner';
import { MagicalBackground } from '../components/MagicalBackground';
import { ModeSelector } from '../components/ModeSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { RemainingBadge } from '../components/RemainingBadge';
import { useFairyTailDraw } from '../hooks/useFairyTailDraw';
import { useGuildData } from '../hooks/useGuildData';
import { parseBackupPayload } from '../storage/lotteryStorage';
import { buildRankingTable, rankOrder } from '../utils/ranking';
import { Award, AwardCollaborator, Colab, Collaborator, GuildTab, RankTier } from '../utils/types';
import { theme } from '../utils/theme';

const tabs: Array<{ key: GuildTab; label: string; icon: string }> = [
  { key: 'sorteador', label: 'Sorteador', icon: '✦' },
  { key: 'ranking', label: 'Ranking', icon: '♜' },
  { key: 'awards', label: 'Awards', icon: '♚' },
  { key: 'banimento', label: 'Banimento', icon: '☠' },
];

type FormState = {
  id?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  entryDate?: string;
};

function formatDate(value?: string) {
  if (!value) {
    return '--';
  }

  const normalizedValue = value.trim();
  const brMatch = normalizedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return normalizedValue;
  }

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) {
    return normalizedValue;
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

function normalizeDateInput(value?: string) {
  if (!value?.trim()) {
    return todayString();
  }

  return formatDate(value.trim());
}

function todayString() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

function rankTone(rank: RankTier) {
  switch (rank) {
    case 'S':
      return '#ff72cb';
    case 'A':
      return '#b87cff';
    case 'B':
      return '#33d6ff';
    case 'C':
      return '#79e27d';
    case 'D':
      return '#ffd76a';
    case 'E':
      return '#ff9b54';
    default:
      return '#cfc2dd';
  }
}

function findParticipationLabel(
  collaborator: Collaborator,
  colab: Colab,
  participations: Array<{ collaboratorId: string; colabId: string; participated: boolean }>
) {
  const record = participations.find((item) => item.collaboratorId === collaborator.id && item.colabId === colab.id);
  return record?.participated ?? false;
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<GuildTab>('sorteador');
  const [showRankTable, setShowRankTable] = useState(false);
  const [colabForm, setColabForm] = useState<FormState>({
    name: '',
    startDate: todayString(),
    endDate: todayString(),
  });
  const [collaboratorForm, setCollaboratorForm] = useState<FormState>({
    name: '',
    entryDate: todayString(),
  });
  const [awardForm, setAwardForm] = useState<FormState>({
    name: '',
    description: '',
  });
  const [openAwardId, setOpenAwardId] = useState<string | null>(null);
  const [awardDrafts, setAwardDrafts] = useState<Record<string, { collaboratorId: string; notes: string }>>({});
  const [banSearch, setBanSearch] = useState('');
  const [banTargetId, setBanTargetId] = useState('');
  const [banReason, setBanReason] = useState('');

  const {
    state,
    isHydrated,
    isSorting,
    updateInputText,
    updateMode,
    sortNextGroup,
    resetLottery,
    replaceLotteryState,
    copyResults,
    shareResults,
  } = useFairyTailDraw();
  const {
    guildData,
    isHydrated: isGuildHydrated,
    collaboratorStats,
    upsertColab,
    deleteColab,
    toggleColabActive,
    upsertCollaborator,
    deleteCollaborator,
    updateCollaboratorStatus,
    toggleParticipation,
    upsertAward,
    deleteAward,
    upsertAwardCollaborator,
    removeAwardCollaborator,
    copyBackup,
    shareBackup,
    replaceGuildData,
  } = useGuildData();

  const appReady = isHydrated && isGuildHydrated;
  const canSort = state.remainingParticipants.length >= state.mode;
  const hasGroups = state.groups.length > 0;

  const activeCollaborators = useMemo(
    () => guildData.collaborators.filter((item) => item.active),
    [guildData.collaborators]
  );
  const rankingTable = useMemo(() => {
    return buildRankingTable(collaboratorStats);
  }, [collaboratorStats]);
  const filteredInactiveCollaborators = useMemo(() => {
    const search = banSearch.trim().toLocaleLowerCase('pt-BR');
    const inactive = guildData.inactiveCollaborators
      .map((item) => ({
        history: item,
        collaborator: guildData.collaborators.find((collaborator) => collaborator.id === item.collaboratorId),
      }))
      .filter((item) => item.collaborator);

    if (!search) {
      return inactive;
    }

    return inactive.filter((item) => item.collaborator?.name.toLocaleLowerCase('pt-BR').includes(search));
  }, [banSearch, guildData.collaborators, guildData.inactiveCollaborators]);

  const screenMeta = {
    sorteador: {
      title: 'Sorteador da Guilda',
    },
    ranking: {
      title: 'Ranking da Guilda',
    },
    awards: {
      title: 'Awards da Guilda',
    },
    banimento: {
      title: 'Banimento e Inatividade',
    },
  }[activeTab];

  function resetColabForm() {
    setColabForm({
      name: '',
      startDate: todayString(),
      endDate: todayString(),
    });
  }

  function resetCollaboratorForm() {
    setCollaboratorForm({
      name: '',
      entryDate: todayString(),
    });
  }

  function resetAwardForm() {
    setAwardForm({
      name: '',
      description: '',
    });
  }

  async function submitColab() {
    if (!colabForm.name?.trim()) {
      return;
    }

    await upsertColab({
      id: colabForm.id,
      name: colabForm.name,
      startDate: normalizeDateInput(colabForm.startDate),
      endDate: normalizeDateInput(colabForm.endDate),
    });
    resetColabForm();
  }

  async function submitCollaborator() {
    if (!collaboratorForm.name?.trim()) {
      return;
    }

    await upsertCollaborator({
      id: collaboratorForm.id,
      name: collaboratorForm.name,
      entryDate: normalizeDateInput(collaboratorForm.entryDate),
    });
    resetCollaboratorForm();
  }

  async function submitAward() {
    if (!awardForm.name?.trim()) {
      return;
    }

    await upsertAward({
      id: awardForm.id,
      name: awardForm.name,
      description: awardForm.description ?? '',
    });
    resetAwardForm();
  }

  async function submitAwardCollaborator(awardId: string) {
    const draft = awardDrafts[awardId];
    if (!draft?.collaboratorId) {
      return;
    }

    await upsertAwardCollaborator(
      awardId,
      draft.collaboratorId,
      draft.notes.split('\n').map((item) => item.trim())
    );

    setAwardDrafts((previous) => ({
      ...previous,
      [awardId]: {
        collaboratorId: '',
        notes: '',
      },
    }));
  }

  async function submitBan() {
    if (!banTargetId) {
      return;
    }

    await updateCollaboratorStatus(banTargetId, false, banReason);
    setBanTargetId('');
    setBanReason('');
  }

  async function importBackupFromClipboard() {
    try {
      const rawPayload = await Clipboard.getStringAsync();

      if (!rawPayload.trim()) {
        Alert.alert('Importar backup', 'Não encontrei JSON na área de transferência.');
        return;
      }

      const backup = parseBackupPayload(rawPayload);

      await replaceGuildData(backup.guildData);
      await replaceLotteryState(backup.lotteryState);

      Alert.alert('Backup importado', 'Os dados da guilda e do sorteador foram restaurados.');
    } catch {
      Alert.alert('Importação falhou', 'O conteúdo copiado não parece ser um backup JSON válido.');
    }
  }

  function renderRankingTableCard() {
    return (
      <GlassCard>
        <View style={styles.rankTableHeader}>
          <View style={styles.flexOne}>
            <Text style={styles.sectionTitle}>Tabela de Ranks</Text>
            <Text style={styles.helper}>Cada coluna mostra os colaboradores daquele rank, com quem mais participou no topo.</Text>
          </View>
          <Pressable style={styles.actionChip} onPress={() => setShowRankTable(false)}>
            <Text style={styles.actionText}>Fechar</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankTableScroll}>
          {rankOrder.map((rank) => (
            <View key={rank} style={styles.rankColumn}>
              <View style={[styles.rankColumnHeader, { borderColor: rankTone(rank) }]}>
                <Text style={[styles.rankColumnTitle, { color: rankTone(rank) }]}>{`Rank ${rank}`}</Text>
              </View>

              <View style={styles.rankColumnBody}>
                {rankingTable[rank].length ? (
                  rankingTable[rank].map((item, index) => (
                    <View key={item.collaborator.id} style={styles.rankRow}>
                      <Text style={styles.rankPosition}>{index + 1}</Text>
                      <View style={styles.flexOne}>
                        <Text style={styles.rankName}>{item.collaborator.name}</Text>
                        <Text style={styles.rankMeta}>{item.participationCount} collab(s)</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.rankEmpty}>Sem colaboradores</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </GlassCard>
    );
  }

  function renderSortTab() {
    return (
      <>
        <GlassCard>
          <Text style={styles.sectionTitle}>Participantes</Text>
          <Text style={styles.helper}>
            Um nome por linha. O app remove linhas vazias, espaços extras e nomes duplicados automaticamente.
          </Text>
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
            <Text style={styles.modeHint}>Cada grupo terá {state.mode} participante{state.mode > 1 ? 's' : ''}.</Text>
          </View>
          <View style={styles.sectionGap}>
            <RemainingBadge remaining={state.remainingParticipants.length} total={state.participants.length} />
          </View>
          <View style={styles.buttonStack}>
            <PrimaryButton
              label={isSorting ? 'Sorteando...' : 'Sortear'}
              onPress={sortNextGroup}
              disabled={!appReady || isSorting || !canSort}
            />
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
              <Pressable
                onPress={copyResults}
                disabled={!hasGroups}
                style={[styles.actionChip, !hasGroups && styles.actionChipDisabled]}
              >
                <Text style={styles.actionText}>Copiar</Text>
              </Pressable>
              <Pressable
                onPress={shareResults}
                disabled={!hasGroups}
                style={[styles.actionChip, !hasGroups && styles.actionChipDisabled]}
              >
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
      </>
    );
  }

  function renderRankingTab() {
    return (
      <>
        <GlassCard>
          <Text style={styles.sectionTitle}>Cadastro de Colabs</Text>
          <TextInput
            value={colabForm.name}
            onChangeText={(value) => setColabForm((previous) => ({ ...previous, name: value }))}
            placeholder="Nome da colab"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.singleInput}
          />
          <View style={styles.row}>
            <TextInput
              value={colabForm.startDate}
              onChangeText={(value) => setColabForm((previous) => ({ ...previous, startDate: value }))}
              placeholder="05/05/2026"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={[styles.singleInput, styles.rowInput]}
            />
            <TextInput
              value={colabForm.endDate}
              onChangeText={(value) => setColabForm((previous) => ({ ...previous, endDate: value }))}
              placeholder="20/05/2026"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={[styles.singleInput, styles.rowInput]}
            />
          </View>
          <View style={styles.buttonStack}>
            <PrimaryButton label={colabForm.id ? 'Salvar colab' : 'Criar colab'} onPress={submitColab} />
            {colabForm.id ? (
              <Pressable onPress={resetColabForm} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.sectionGap}>
            {guildData.colabs.length ? (
              guildData.colabs.map((colab) => (
                <View key={colab.id} style={styles.entityCard}>
                  <View style={styles.entityHeader}>
                    <View style={styles.flexOne}>
                      <Text style={styles.entityTitle}>{colab.name}</Text>
                      <Text style={styles.entityMeta}>
                        {formatDate(colab.startDate)} até {formatDate(colab.endDate)}
                      </Text>
                    </View>
                    <Text style={[styles.badge, colab.active ? styles.badgeSuccess : styles.badgeMuted]}>
                      {colab.active ? 'Ativa' : 'Inativa'}
                    </Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionChip}
                      onPress={() =>
                        setColabForm({
                          id: colab.id,
                          name: colab.name,
                          startDate: formatDate(colab.startDate),
                          endDate: formatDate(colab.endDate),
                        })
                      }
                    >
                      <Text style={styles.actionText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.actionChip} onPress={() => toggleColabActive(colab.id)}>
                      <Text style={styles.actionText}>{colab.active ? 'Desativar' : 'Ativar'}</Text>
                    </Pressable>
                    <Pressable style={styles.actionChip} onPress={() => deleteColab(colab.id)}>
                      <Text style={styles.actionText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma colab cadastrada ainda.</Text>
            )}
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionTitle}>Cadastro de Colaboradores</Text>
          <TextInput
            value={collaboratorForm.name}
            onChangeText={(value) => setCollaboratorForm((previous) => ({ ...previous, name: value }))}
            placeholder="Nome do colaborador"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.singleInput}
          />
          <TextInput
            value={collaboratorForm.entryDate}
            onChangeText={(value) => setCollaboratorForm((previous) => ({ ...previous, entryDate: value }))}
            placeholder="05/05/2026"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.singleInput}
          />
          <View style={styles.buttonStack}>
            <PrimaryButton
              label={collaboratorForm.id ? 'Salvar colaborador' : 'Criar colaborador'}
              onPress={submitCollaborator}
            />
            {collaboratorForm.id ? (
              <Pressable onPress={resetCollaboratorForm} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.sectionGap}>
            {collaboratorStats.length ? (
              collaboratorStats.map((item) => (
                <View key={item.collaborator.id} style={styles.entityCard}>
                  <View style={styles.entityHeader}>
                    <View style={styles.flexOne}>
                      <Text style={styles.entityTitle}>{item.collaborator.name}</Text>
                      <Text style={styles.entityMeta}>
                        Entrou em {formatDate(item.collaborator.entryDate)} • {item.participationCount} colab(s)
                      </Text>
                    </View>
                    <View style={styles.badgeRow}>
                      <Text style={[styles.badge, { backgroundColor: rankTone(item.rank), color: '#2b173f' }]}>
                        Rank {item.rank}
                      </Text>
                      <Text style={[styles.badge, item.collaborator.active ? styles.badgeSuccess : styles.badgeMuted]}>
                        {item.collaborator.active ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>

                  {guildData.colabs.length ? (
                    <View style={styles.participationList}>
                      {guildData.colabs.map((colab) => {
                        const participated = findParticipationLabel(
                          item.collaborator,
                          colab,
                          guildData.participations
                        );

                        return (
                          <Pressable
                            key={`${item.collaborator.id}-${colab.id}`}
                            style={[styles.participationChip, participated && styles.participationChipActive]}
                            onPress={() => toggleParticipation(item.collaborator.id, colab.id)}
                          >
                            <Text style={styles.participationTitle}>{colab.name}</Text>
                            <Text style={styles.participationStatus}>{participated ? '✅ Participou' : '❌ Não participou'}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Cadastre uma colab para começar o ranking.</Text>
                  )}

                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionChip}
                      onPress={() =>
                        setCollaboratorForm({
                          id: item.collaborator.id,
                          name: item.collaborator.name,
                          entryDate: formatDate(item.collaborator.entryDate),
                        })
                      }
                    >
                      <Text style={styles.actionText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionChip}
                      onPress={() => updateCollaboratorStatus(item.collaborator.id, !item.collaborator.active)}
                    >
                      <Text style={styles.actionText}>{item.collaborator.active ? 'Inativar' : 'Reativar'}</Text>
                    </Pressable>
                    <Pressable style={styles.actionChip} onPress={() => deleteCollaborator(item.collaborator.id)}>
                      <Text style={styles.actionText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum colaborador cadastrado ainda.</Text>
            )}
          </View>
        </GlassCard>
      </>
    );
  }

  function renderAwardAssignment(award: Award, assignment: AwardCollaborator) {
    const collaborator = guildData.collaborators.find((item) => item.id === assignment.collaboratorId);
    if (!collaborator) {
      return null;
    }

    return (
      <View key={assignment.id} style={styles.assignmentCard}>
        <View style={styles.entityHeader}>
          <View style={styles.flexOne}>
            <Text style={styles.entityTitle}>{collaborator.name}</Text>
            <Text style={styles.entityMeta}>Total: {assignment.notes.length}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionChip}
              onPress={() =>
                setAwardDrafts((previous) => ({
                  ...previous,
                  [award.id]: {
                    collaboratorId: collaborator.id,
                    notes: assignment.notes.join('\n'),
                  },
                }))
              }
            >
              <Text style={styles.actionText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.actionChip} onPress={() => removeAwardCollaborator(award.id, collaborator.id)}>
              <Text style={styles.actionText}>Excluir</Text>
            </Pressable>
          </View>
        </View>
        {assignment.notes.map((note, index) => (
          <Text key={`${assignment.id}-${index}`} style={styles.numberedLine}>
            {index + 1}. {note}
          </Text>
        ))}
      </View>
    );
  }

  function renderAwardsTab() {
    return (
      <>
        <GlassCard>
          <Text style={styles.sectionTitle}>Cadastro de Awards</Text>
          <TextInput
            value={awardForm.name}
            onChangeText={(value) => setAwardForm((previous) => ({ ...previous, name: value }))}
            placeholder="Nome do award"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.singleInput}
          />
          <TextInput
            value={awardForm.description}
            onChangeText={(value) => setAwardForm((previous) => ({ ...previous, description: value }))}
            placeholder="Descrição do award"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={[styles.singleInput, styles.tallInput]}
            multiline
          />
          <View style={styles.buttonStack}>
            <PrimaryButton label={awardForm.id ? 'Salvar award' : 'Criar award'} onPress={submitAward} />
            {awardForm.id ? (
              <Pressable onPress={resetAwardForm} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
              </Pressable>
            ) : null}
          </View>
        </GlassCard>

        {guildData.awards.length ? (
          guildData.awards.map((award) => {
            const isOpen = openAwardId === award.id;
            const draft = awardDrafts[award.id] ?? { collaboratorId: '', notes: '' };
            const assignments = guildData.awardCollaborators.filter((item) => item.awardId === award.id);

            return (
              <GlassCard key={award.id}>
                <Pressable style={styles.accordionHeader} onPress={() => setOpenAwardId(isOpen ? null : award.id)}>
                  <View style={styles.flexOne}>
                    <Text style={styles.sectionTitle}>{award.name}</Text>
                    <Text style={styles.helper}>{award.description || 'Sem descrição informada.'}</Text>
                  </View>
                  <Text style={styles.accordionIcon}>{isOpen ? '−' : '+'}</Text>
                </Pressable>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={styles.actionChip}
                    onPress={() => setAwardForm({ id: award.id, name: award.name, description: award.description })}
                  >
                    <Text style={styles.actionText}>Editar award</Text>
                  </Pressable>
                  <Pressable style={styles.actionChip} onPress={() => deleteAward(award.id)}>
                    <Text style={styles.actionText}>Excluir award</Text>
                  </Pressable>
                </View>

                {isOpen ? (
                  <View style={styles.sectionGap}>
                    <Text style={styles.label}>Selecionar colaborador</Text>
                    <View style={styles.selectorWrap}>
                      {guildData.collaborators.length ? (
                        guildData.collaborators.map((collaborator) => {
                          const selected = draft.collaboratorId === collaborator.id;
                          return (
                            <Pressable
                              key={collaborator.id}
                              style={[styles.selectorChip, selected && styles.selectorChipActive]}
                              onPress={() =>
                                setAwardDrafts((previous) => ({
                                  ...previous,
                                  [award.id]: {
                                    ...draft,
                                    collaboratorId: collaborator.id,
                                  },
                                }))
                              }
                            >
                              <Text style={styles.selectorText}>{collaborator.name}</Text>
                            </Pressable>
                          );
                        })
                      ) : (
                        <Text style={styles.emptyText}>Cadastre colaboradores antes de vincular awards.</Text>
                      )}
                    </View>

                    <TextInput
                      value={draft.notes}
                      onChangeText={(value) =>
                        setAwardDrafts((previous) => ({
                          ...previous,
                          [award.id]: {
                            ...draft,
                            notes: value,
                          },
                        }))
                      }
                      placeholder={'Um motivo por linha:\nCurtiu\nCompartilhou'}
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      style={[styles.singleInput, styles.notesInput]}
                      multiline
                      textAlignVertical="top"
                    />
                    <View style={styles.actionsRow}>
                      <Pressable style={styles.actionChipStrong} onPress={() => submitAwardCollaborator(award.id)}>
                        <Text style={styles.actionText}>Salvar motivos</Text>
                      </Pressable>
                    </View>

                    {assignments.length ? (
                      assignments.map((assignment) => renderAwardAssignment(award, assignment))
                    ) : (
                      <Text style={styles.emptyText}>Nenhum colaborador vinculado a este award ainda.</Text>
                    )}
                  </View>
                ) : null}
              </GlassCard>
            );
          })
        ) : (
          <GlassCard>
            <Text style={styles.emptyTitle}>Nenhum award ainda</Text>
            <Text style={styles.emptyText}>Crie o primeiro award para abrir os accordions de conquistas.</Text>
          </GlassCard>
        )}
      </>
    );
  }

  function renderBanimentoTab() {
    return (
      <>
        <GlassCard>
          <Text style={styles.sectionTitle}>Desativar colaborador</Text>
          <Text style={styles.helper}>
            Ao desativar, o app salva a data de saída, marca o colaborador como inativo e registra o motivo opcional.
          </Text>
          <View style={styles.selectorWrap}>
            {activeCollaborators.length ? (
              activeCollaborators.map((collaborator) => {
                const selected = banTargetId === collaborator.id;
                return (
                  <Pressable
                    key={collaborator.id}
                    style={[styles.selectorChip, selected && styles.selectorChipActive]}
                    onPress={() => setBanTargetId(collaborator.id)}
                  >
                    <Text style={styles.selectorText}>{collaborator.name}</Text>
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Não há colaboradores ativos disponíveis para desativação.</Text>
            )}
          </View>
          <TextInput
            value={banReason}
            onChangeText={setBanReason}
            placeholder="Motivo opcional da saída"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={[styles.singleInput, styles.tallInput]}
            multiline
          />
          <View style={styles.sectionGap}>
            <PrimaryButton label="Registrar banimento" onPress={submitBan} disabled={!banTargetId} />
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionTitle}>Histórico de inativos</Text>
          <TextInput
            value={banSearch}
            onChangeText={setBanSearch}
            placeholder="Buscar colaborador"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.singleInput}
          />
          <View style={styles.sectionGap}>
            {filteredInactiveCollaborators.length ? (
              filteredInactiveCollaborators.map((item) => (
                <View key={item.history.id} style={styles.entityCard}>
                  <View style={styles.entityHeader}>
                    <View style={styles.flexOne}>
                      <Text style={styles.entityTitle}>{item.collaborator?.name}</Text>
                      <Text style={styles.entityMeta}>Data de saída: {formatDate(item.history.inactiveDate)}</Text>
                    </View>
                    <Text style={[styles.badge, styles.badgeMuted]}>Inativo</Text>
                  </View>
                  <Text style={styles.entityMeta}>Motivo: {item.history.reason || 'Não informado'}</Text>
                  {item.collaborator ? (
                    <View style={styles.actionsRow}>
                      <Pressable
                        style={styles.actionChipStrong}
                        onPress={() => updateCollaboratorStatus(item.collaborator!.id, true)}
                      >
                        <Text style={styles.actionText}>Reativar colaborador</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum colaborador inativo encontrado.</Text>
            )}
          </View>
        </GlassCard>
      </>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'ranking':
        return renderRankingTab();
      case 'awards':
        return renderAwardsTab();
      case 'banimento':
        return renderBanimentoTab();
      case 'sorteador':
      default:
        return renderSortTab();
    }
  }

  return (
    <View style={styles.container}>
      <MagicalBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 128 + Math.max(insets.bottom, 12) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topActionRow}>
            <Pressable style={styles.backupButton} onPress={() => shareBackup(state)}>
              <Text style={styles.backupButtonText}>Exportar</Text>
            </Pressable>
            <Pressable style={styles.backupButton} onPress={importBackupFromClipboard}>
              <Text style={styles.backupButtonText}>Importar</Text>
            </Pressable>
            <Pressable style={styles.backupButton} onPress={() => setShowRankTable((previous) => !previous)}>
              <Text style={styles.backupButtonText}>{showRankTable ? 'Esconder ranks' : 'Exibir ranks'}</Text>
            </Pressable>
          </View>
          <HeaderBanner title={screenMeta.title} />
          {showRankTable ? renderRankingTableCard() : null}
          {renderTabContent()}
        </ScrollView>

        <View style={[styles.tabBar, { bottom: Math.max(insets.bottom, 12) }]}>
          {tabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <Pressable key={tab.key} style={[styles.tabButton, active && styles.tabButtonActive]} onPress={() => setActiveTab(tab.key)}>
                <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
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
    paddingBottom: 128,
    gap: theme.spacing.lg,
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: -4,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(7, 10, 24, 0.22)',
  },
  backupButtonIcon: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '900',
  },
  backupButtonText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rankTableHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rankTableScroll: {
    gap: 12,
    paddingTop: 18,
  },
  rankColumn: {
    width: 164,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(7, 10, 24, 0.24)',
    overflow: 'hidden',
  },
  rankColumnHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rankColumnTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  rankColumnBody: {
    padding: 12,
    gap: 10,
    minHeight: 112,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rankPosition: {
    width: 20,
    color: theme.colors.gold,
    fontSize: 13,
    fontWeight: '900',
  },
  rankName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  rankMeta: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  rankEmpty: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
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
  singleInput: {
    minHeight: 52,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 7, 25, 0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tallInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  notesInput: {
    minHeight: 132,
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
    flexWrap: 'wrap',
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  actionChipStrong: {
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,214,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(51,214,255,0.34)',
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  entityCard: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(10, 8, 26, 0.22)',
    padding: 14,
  },
  assignmentCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
  },
  entityHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  entityTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  entityMeta: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  flexOne: {
    flex: 1,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '900',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(158,247,214,0.18)',
    color: theme.colors.success,
  },
  badgeMuted: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: theme.colors.textMuted,
  },
  badgeRow: {
    alignItems: 'flex-end',
    gap: 6,
  },
  participationList: {
    marginTop: 14,
    gap: 10,
  },
  participationChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
  },
  participationChipActive: {
    borderColor: 'rgba(51,214,255,0.45)',
    backgroundColor: 'rgba(51,214,255,0.14)',
  },
  participationTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  participationStatus: {
    marginTop: 5,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accordionIcon: {
    color: theme.colors.gold,
    fontSize: 30,
    fontWeight: '400',
  },
  selectorWrap: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  selectorChip: {
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  selectorChipActive: {
    borderColor: 'rgba(255,114,203,0.48)',
    backgroundColor: 'rgba(255,114,203,0.2)',
  },
  selectorText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  numberedLine: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 10,
    borderRadius: 28,
    backgroundColor: 'rgba(18, 9, 33, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: theme.colors.blue,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  tabButton: {
    flex: 1,
    minHeight: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  tabIcon: {
    color: theme.colors.textMuted,
    fontSize: 19,
  },
  tabIconActive: {
    color: theme.colors.gold,
    textShadowColor: 'rgba(255,215,106,0.55)',
    textShadowRadius: 12,
  },
  tabLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: theme.colors.text,
  },
});

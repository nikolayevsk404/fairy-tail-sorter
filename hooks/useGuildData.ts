import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { exportBackupPayload, loadGuildData, normalizeGuildData, saveGuildData } from '../storage/lotteryStorage';
import { getRankTier } from '../utils/ranking';
import {
  Award,
  AwardCollaborator,
  Colab,
  Collaborator,
  GuildData,
  InactiveCollaborator,
  LotteryState,
  Participation,
  RankTier,
} from '../utils/types';

const defaultGuildData: GuildData = {
  colabs: [],
  collaborators: [],
  participations: [],
  awards: [],
  awardCollaborators: [],
  inactiveCollaborators: [],
};

type UpdateColabInput = {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  active?: boolean;
};

type UpdateCollaboratorInput = {
  id?: string;
  name: string;
  entryDate: string;
  active?: boolean;
};

type UpdateAwardInput = {
  id?: string;
  name: string;
  description: string;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function dedupeNotes(notes: string[]) {
  const seen = new Set<string>();

  return notes
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLocaleLowerCase('pt-BR');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

export function useGuildData() {
  const [guildData, setGuildData] = useState<GuildData>(defaultGuildData);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const savedData = await loadGuildData();
        setGuildData(savedData);
      } finally {
        setIsHydrated(true);
      }
    }

    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveGuildData(guildData).catch(() => undefined);
  }, [guildData, isHydrated]);

  const collaboratorStats = useMemo(() => {
    return guildData.collaborators.map((collaborator) => {
      const participations = guildData.participations.filter(
        (item) => item.collaboratorId === collaborator.id && item.participated
      );

      return {
        collaborator,
        participationCount: participations.length,
        rank: getRankTier(participations.length),
        participations,
      };
    });
  }, [guildData.collaborators, guildData.participations]);

  async function upsertColab(input: UpdateColabInput) {
    const nextColab: Colab = {
      id: input.id ?? createId('colab'),
      name: input.name.trim(),
      active: input.active ?? true,
      startDate: input.startDate.trim(),
      endDate: input.endDate.trim(),
      createdAt: input.id
        ? guildData.colabs.find((item) => item.id === input.id)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    setGuildData((previous) => {
      const colabs = previous.colabs.some((item) => item.id === nextColab.id)
        ? previous.colabs.map((item) => (item.id === nextColab.id ? nextColab : item))
        : [...previous.colabs, nextColab];

      return {
        ...previous,
        colabs,
      };
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function deleteColab(id: string) {
    setGuildData((previous) => ({
      ...previous,
      colabs: previous.colabs.filter((item) => item.id !== id),
      participations: previous.participations.filter((item) => item.colabId !== id),
    }));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function toggleColabActive(id: string) {
    setGuildData((previous) => ({
      ...previous,
      colabs: previous.colabs.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    }));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function upsertCollaborator(input: UpdateCollaboratorInput) {
    const previousItem = input.id ? guildData.collaborators.find((item) => item.id === input.id) : undefined;
    const nextCollaborator: Collaborator = {
      id: input.id ?? createId('collab'),
      name: input.name.trim(),
      active: input.active ?? previousItem?.active ?? true,
      entryDate: input.entryDate.trim(),
      inactiveDate: previousItem?.inactiveDate,
      createdAt: previousItem?.createdAt ?? new Date().toISOString(),
    };

    setGuildData((previous) => {
      const collaborators = previous.collaborators.some((item) => item.id === nextCollaborator.id)
        ? previous.collaborators.map((item) => (item.id === nextCollaborator.id ? nextCollaborator : item))
        : [...previous.collaborators, nextCollaborator];

      return {
        ...previous,
        collaborators,
      };
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function deleteCollaborator(id: string) {
    setGuildData((previous) => ({
      ...previous,
      collaborators: previous.collaborators.filter((item) => item.id !== id),
      participations: previous.participations.filter((item) => item.collaboratorId !== id),
      awardCollaborators: previous.awardCollaborators.filter((item) => item.collaboratorId !== id),
      inactiveCollaborators: previous.inactiveCollaborators.filter((item) => item.collaboratorId !== id),
    }));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function updateCollaboratorStatus(id: string, active: boolean, reason?: string) {
    const now = new Date().toISOString();

    setGuildData((previous) => {
      const collaborators = previous.collaborators.map((item) =>
        item.id === id ? { ...item, active, inactiveDate: active ? undefined : now } : item
      );

      const inactiveCollaborators = active
        ? previous.inactiveCollaborators.filter((item) => item.collaboratorId !== id)
        : [
            {
              id: createId('inactive'),
              collaboratorId: id,
              inactiveDate: now,
              reason: reason?.trim() || undefined,
            } satisfies InactiveCollaborator,
            ...previous.inactiveCollaborators.filter((item) => item.collaboratorId !== id),
          ];

      return {
        ...previous,
        collaborators,
        inactiveCollaborators,
      };
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function toggleParticipation(collaboratorId: string, colabId: string) {
    setGuildData((previous) => {
      const existing = previous.participations.find(
        (item) => item.collaboratorId === collaboratorId && item.colabId === colabId
      );

      let participations: Participation[];

      if (existing) {
        participations = previous.participations.map((item) =>
          item.id === existing.id ? { ...item, participated: !item.participated } : item
        );
      } else {
        participations = [
          {
            id: createId('part'),
            collaboratorId,
            colabId,
            participated: true,
            createdAt: new Date().toISOString(),
          },
          ...previous.participations,
        ];
      }

      return {
        ...previous,
        participations,
      };
    });

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function upsertAward(input: UpdateAwardInput) {
    const nextAward: Award = {
      id: input.id ?? createId('award'),
      name: input.name.trim(),
      description: input.description.trim(),
      createdAt: input.id
        ? guildData.awards.find((item) => item.id === input.id)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    setGuildData((previous) => {
      const awards = previous.awards.some((item) => item.id === nextAward.id)
        ? previous.awards.map((item) => (item.id === nextAward.id ? nextAward : item))
        : [...previous.awards, nextAward];

      return {
        ...previous,
        awards,
      };
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function deleteAward(id: string) {
    setGuildData((previous) => ({
      ...previous,
      awards: previous.awards.filter((item) => item.id !== id),
      awardCollaborators: previous.awardCollaborators.filter((item) => item.awardId !== id),
    }));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function upsertAwardCollaborator(awardId: string, collaboratorId: string, notes: string[]) {
    const cleanedNotes = dedupeNotes(notes);

    setGuildData((previous) => {
      const existing = previous.awardCollaborators.find(
        (item) => item.awardId === awardId && item.collaboratorId === collaboratorId
      );

      if (cleanedNotes.length === 0) {
        return {
          ...previous,
          awardCollaborators: previous.awardCollaborators.filter(
            (item) => !(item.awardId === awardId && item.collaboratorId === collaboratorId)
          ),
        };
      }

      const nextItem: AwardCollaborator = existing
        ? { ...existing, notes: cleanedNotes }
        : {
            id: createId('award-collab'),
            awardId,
            collaboratorId,
            notes: cleanedNotes,
          };

      return {
        ...previous,
        awardCollaborators: existing
          ? previous.awardCollaborators.map((item) => (item.id === existing.id ? nextItem : item))
          : [nextItem, ...previous.awardCollaborators],
      };
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function removeAwardCollaborator(awardId: string, collaboratorId: string) {
    setGuildData((previous) => ({
      ...previous,
      awardCollaborators: previous.awardCollaborators.filter(
        (item) => !(item.awardId === awardId && item.collaboratorId === collaboratorId)
      ),
    }));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function copyBackup(lotteryState: LotteryState) {
    const payload = await exportBackupPayload(lotteryState, guildData);
    await Clipboard.setStringAsync(payload);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async function shareBackup(lotteryState: LotteryState) {
    const payload = await exportBackupPayload(lotteryState, guildData);
    await Share.share({
      title: 'Fairy Tail Art Guild Backup',
      message: payload,
    });
  }

  async function replaceGuildData(nextGuildData?: Partial<GuildData> | null) {
    const normalized = normalizeGuildData(nextGuildData);
    setGuildData(normalized);
    await saveGuildData(normalized);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return {
    guildData,
    isHydrated,
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
  };
}

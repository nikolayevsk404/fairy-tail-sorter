import { BackupPayload, GuildData, LotteryState } from './types';

export const defaultGuildData: GuildData = {
  colabs: [],
  collaborators: [],
  participations: [],
  awards: [],
  awardCollaborators: [],
  inactiveCollaborators: [],
};

export function buildBackupPayload(lotteryState: LotteryState, guildData: GuildData, exportedAt = new Date().toISOString()) {
  return {
    exportedAt,
    lotteryState,
    guildData,
  } satisfies BackupPayload;
}

export function serializeBackupPayload(
  lotteryState: LotteryState,
  guildData: GuildData,
  exportedAt = new Date().toISOString()
) {
  return JSON.stringify(buildBackupPayload(lotteryState, guildData, exportedAt), null, 2);
}

export function normalizeGuildData(data?: Partial<GuildData> | null): GuildData {
  return {
    ...defaultGuildData,
    ...(data ?? {}),
  };
}

export function parseBackupPayload(rawValue: string): BackupPayload {
  const parsed = JSON.parse(rawValue) as BackupPayload;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup invalido.');
  }

  if (!('guildData' in parsed) && !('lotteryState' in parsed)) {
    throw new Error('Backup sem dados reconhecidos.');
  }

  return parsed;
}

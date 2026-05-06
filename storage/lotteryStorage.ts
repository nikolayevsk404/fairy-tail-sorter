import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultGuildData, normalizeGuildData, parseBackupPayload, serializeBackupPayload } from '../utils/backup';
import { GuildData, LotteryState } from '../utils/types';

const LOTTERY_STORAGE_KEY = '@fairy-tail-lottery/state';
const GUILD_STORAGE_KEY = '@fairy-tail-lottery/guild';

export async function loadLotteryState() {
  const rawValue = await AsyncStorage.getItem(LOTTERY_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as LotteryState;
}

export async function saveLotteryState(state: LotteryState) {
  await AsyncStorage.setItem(LOTTERY_STORAGE_KEY, JSON.stringify(state));
}

export async function clearLotteryState() {
  await AsyncStorage.removeItem(LOTTERY_STORAGE_KEY);
}

export async function loadGuildData() {
  const rawValue = await AsyncStorage.getItem(GUILD_STORAGE_KEY);
  if (!rawValue) {
    return defaultGuildData;
  }

  return normalizeGuildData(JSON.parse(rawValue) as Partial<GuildData>);
}

export async function saveGuildData(state: GuildData) {
  await AsyncStorage.setItem(GUILD_STORAGE_KEY, JSON.stringify(state));
}

export async function exportBackupPayload(lotteryState: LotteryState, guildData: GuildData) {
  return serializeBackupPayload(lotteryState, guildData);
}

export { normalizeGuildData, parseBackupPayload };

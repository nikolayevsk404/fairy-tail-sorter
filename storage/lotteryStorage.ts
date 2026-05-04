import AsyncStorage from '@react-native-async-storage/async-storage';

import { LotteryState } from '../utils/types';

const STORAGE_KEY = '@fairy-tail-lottery/state';

export async function loadLotteryState() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as LotteryState;
}

export async function saveLotteryState(state: LotteryState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearLotteryState() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

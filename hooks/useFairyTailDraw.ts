import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { clearLotteryState, loadLotteryState, saveLotteryState } from '../storage/lotteryStorage';
import { buildShareText, drawNextGroup, getStatusMessage, normalizeParticipants, sanitizeDrawMode } from '../utils/lottery';
import { DrawGroup, DrawMode, LotteryState } from '../utils/types';

const defaultState: LotteryState = {
  inputText: '',
  participants: [],
  remainingParticipants: [],
  groups: [],
  mode: 2,
  isComplete: false,
  statusMessage: 'Pronto para um novo sorteio magico ✨',
};

function buildStateFromInput(inputText: string, mode: DrawMode, previousGroups: DrawGroup[] = []): LotteryState {
  const normalizedMode = sanitizeDrawMode(mode);
  const participants = normalizeParticipants(inputText);
  const groups = previousGroups.filter((group) => group.members.every((member) => participants.includes(member)));
  const usedNames = new Set(groups.flatMap((group) => group.members));
  const remainingParticipants = participants.filter((name) => !usedNames.has(name));
  const isComplete = remainingParticipants.length === 0 && groups.length > 0;

  return {
    inputText,
    participants,
    remainingParticipants,
    groups,
    mode: normalizedMode,
    isComplete,
    statusMessage: getStatusMessage(remainingParticipants.length, normalizedMode, groups.length > 0),
  };
}

export function useFairyTailDraw() {
  const [state, setState] = useState<LotteryState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [showCompletionBurst, setShowCompletionBurst] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const savedState = await loadLotteryState();
        if (savedState) {
          setState(buildStateFromInput(savedState.inputText, savedState.mode, savedState.groups));
        }
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

    saveLotteryState(state).catch(() => undefined);
  }, [isHydrated, state]);

  const shareText = useMemo(
    () => buildShareText(state.groups, state.remainingParticipants.length, state.mode),
    [state.groups, state.mode, state.remainingParticipants.length]
  );

  async function updateInputText(inputText: string) {
    setState((previous) => buildStateFromInput(inputText, previous.mode, previous.groups));
  }

  async function updateMode(mode: DrawMode) {
    setState((previous) => buildStateFromInput(previous.inputText, mode, previous.groups));
  }

  async function sortNextGroup() {
    const nextGroupMembers = drawNextGroup(state.remainingParticipants, state.mode);

    if (!nextGroupMembers) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setState((previous) => ({
        ...previous,
        statusMessage: getStatusMessage(previous.remainingParticipants.length, previous.mode, previous.groups.length > 0),
      }));
      return;
    }

    setIsSorting(true);

    const nextGroups = [
      ...state.groups,
      {
        id: `${Date.now()}-${state.groups.length + 1}`,
        index: state.groups.length + 1,
        members: nextGroupMembers,
        createdAt: new Date().toISOString(),
      },
    ];

    const usedNames = new Set(nextGroups.flatMap((group) => group.members));
    const remainingParticipants = state.participants.filter((name) => !usedNames.has(name));
    const isComplete = remainingParticipants.length === 0;

    setState({
      ...state,
      groups: nextGroups,
      remainingParticipants,
      isComplete,
      statusMessage: getStatusMessage(remainingParticipants.length, state.mode, nextGroups.length > 0),
    });

    if (isComplete) {
      setShowCompletionBurst(true);
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => setIsSorting(false), 650);
  }

  async function resetLottery() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const freshState = buildStateFromInput(state.inputText, state.mode);
    setState(freshState);
    await clearLotteryState();
    await saveLotteryState(freshState);
  }

  async function copyResults() {
    await Clipboard.setStringAsync(shareText);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function shareResults() {
    await Share.share({
      message: shareText,
      title: 'Fairy Tail App',
    });
  }

  useEffect(() => {
    if (showCompletionBurst) {
      const timeout = setTimeout(() => {
        setShowCompletionBurst(false);
      }, 2400);

      return () => clearTimeout(timeout);
    }
  }, [showCompletionBurst]);

  return {
    state,
    isHydrated,
    isSorting,
    shouldShowCompletionBurst: showCompletionBurst && !isSorting,
    updateInputText,
    updateMode,
    sortNextGroup,
    resetLottery,
    copyResults,
    shareResults,
  };
}

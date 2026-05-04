import { DrawGroup, DrawMode } from './types';

export function sanitizeDrawMode(value: number) {
  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.max(1, Math.floor(value));
}

export function normalizeParticipants(input: string) {
  const seen = new Set<string>();

  return input
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((name) => {
      const key = name.toLocaleLowerCase('pt-BR');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

export function shuffleNames(names: string[]) {
  const cloned = [...names];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }

  return cloned;
}

export function drawNextGroup(remainingParticipants: string[], mode: DrawMode): string[] | null {
  const normalizedMode = sanitizeDrawMode(mode);

  if (remainingParticipants.length < normalizedMode) {
    return null;
  }

  return shuffleNames(remainingParticipants).slice(0, normalizedMode);
}

export function getStatusMessage(remainingCount: number, mode: DrawMode, hasGroups: boolean) {
  const normalizedMode = sanitizeDrawMode(mode);

  if (remainingCount === 0 && hasGroups) {
    return 'Todos os participantes ja foram sorteados ✨';
  }

  if (remainingCount > 0 && remainingCount < normalizedMode) {
    return 'Participantes insuficientes para formar novo grupo';
  }

  return 'Pronto para um novo sorteio magico ✨';
}

export function buildShareText(groups: DrawGroup[], remainingCount: number, mode: DrawMode) {
  const normalizedMode = sanitizeDrawMode(mode);
  const title = `Sorteador da Fairy Tail • grupos de ${normalizedMode}`;

  const groupsText = groups.length
    ? groups
        .map((group) => [`✨ Grupo ${group.index}`, ...group.members].join('\n'))
        .join('\n\n')
    : 'Nenhum grupo foi sorteado ainda.';

  return `${title}\n\n${groupsText}\n\nParticipantes restantes: ${remainingCount}`;
}

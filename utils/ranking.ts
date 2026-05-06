import { Collaborator, RankTier } from './types';

export type CollaboratorRankStat = {
  collaborator: Collaborator;
  participationCount: number;
  rank: RankTier;
};

export const rankOrder: RankTier[] = ['E', 'D', 'C', 'B', 'A', 'S'];

export function getRankTier(participationCount: number): RankTier {
  if (participationCount >= 10) {
    return 'S';
  }
  if (participationCount >= 7) {
    return 'A';
  }
  if (participationCount >= 4) {
    return 'B';
  }
  if (participationCount >= 2) {
    return 'C';
  }
  if (participationCount >= 1) {
    return 'D';
  }
  return 'E';
}

export function buildRankingTable(stats: CollaboratorRankStat[]) {
  const grouped = Object.fromEntries(rankOrder.map((rank) => [rank, [] as CollaboratorRankStat[]])) as Record<
    RankTier,
    CollaboratorRankStat[]
  >;

  const sortedStats = [...stats].sort((left, right) => {
    if (right.participationCount !== left.participationCount) {
      return right.participationCount - left.participationCount;
    }

    return left.collaborator.name.localeCompare(right.collaborator.name, 'pt-BR');
  });

  sortedStats.forEach((item) => {
    grouped[item.rank].push(item);
  });

  return grouped;
}

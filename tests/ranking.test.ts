import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRankingTable, getRankTier, rankOrder } from '../utils/ranking';
import { Collaborator } from '../utils/types';

function createCollaborator(id: string, name: string): Collaborator {
  return {
    id,
    name,
    active: true,
    entryDate: '05/05/2026',
    createdAt: '2026-05-05T00:00:00.000Z',
  };
}

test('getRankTier applies the full rule set from E to S', () => {
  assert.equal(getRankTier(0), 'E');
  assert.equal(getRankTier(1), 'D');
  assert.equal(getRankTier(2), 'C');
  assert.equal(getRankTier(3), 'C');
  assert.equal(getRankTier(4), 'B');
  assert.equal(getRankTier(6), 'B');
  assert.equal(getRankTier(7), 'A');
  assert.equal(getRankTier(9), 'A');
  assert.equal(getRankTier(10), 'S');
});

test('buildRankingTable groups by rank and sorts by highest participation first', () => {
  const stats = [
    { collaborator: createCollaborator('1', 'Bianca'), participationCount: 7, rank: getRankTier(7) },
    { collaborator: createCollaborator('2', 'Alice'), participationCount: 7, rank: getRankTier(7) },
    { collaborator: createCollaborator('3', 'Caio'), participationCount: 0, rank: getRankTier(0) },
    { collaborator: createCollaborator('4', 'Davi'), participationCount: 1, rank: getRankTier(1) },
    { collaborator: createCollaborator('5', 'Ester'), participationCount: 10, rank: getRankTier(10) },
  ];

  const table = buildRankingTable(stats);

  assert.deepEqual(Object.keys(table), rankOrder);
  assert.equal(table.E[0]?.collaborator.name, 'Caio');
  assert.equal(table.D[0]?.collaborator.name, 'Davi');
  assert.deepEqual(
    table.A.map((item) => item.collaborator.name),
    ['Alice', 'Bianca']
  );
  assert.equal(table.S[0]?.collaborator.name, 'Ester');
});

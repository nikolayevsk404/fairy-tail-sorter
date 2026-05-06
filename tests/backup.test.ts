import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBackupPayload,
  defaultGuildData,
  normalizeGuildData,
  parseBackupPayload,
  serializeBackupPayload,
} from '../utils/backup';
import { LotteryState } from '../utils/types';

const lotteryState: LotteryState = {
  inputText: 'Ana\nBruno',
  participants: ['Ana', 'Bruno'],
  remainingParticipants: ['Bruno'],
  groups: [
    {
      id: 'group-1',
      index: 1,
      members: ['Ana'],
      createdAt: '2026-05-05T00:00:00.000Z',
    },
  ],
  mode: 1,
  isComplete: false,
  statusMessage: 'Pronto para um novo sorteio mágico ✨',
};

test('normalizeGuildData fills missing collections with empty arrays', () => {
  const guildData = normalizeGuildData({ collaborators: [{ id: '1', name: 'Ana', active: true, entryDate: '05/05/2026', createdAt: '2026-05-05T00:00:00.000Z' }] });

  assert.equal(guildData.collaborators.length, 1);
  assert.deepEqual(guildData.colabs, []);
  assert.deepEqual(guildData.participations, []);
  assert.deepEqual(guildData.awards, []);
});

test('buildBackupPayload and serializeBackupPayload preserve the main data', () => {
  const exportedAt = '2026-05-05T12:00:00.000Z';
  const payload = buildBackupPayload(lotteryState, defaultGuildData, exportedAt);
  const serialized = serializeBackupPayload(lotteryState, defaultGuildData, exportedAt);
  const parsed = JSON.parse(serialized);

  assert.equal(payload.exportedAt, exportedAt);
  assert.deepEqual(payload.lotteryState, lotteryState);
  assert.deepEqual(payload.guildData, defaultGuildData);
  assert.deepEqual(parsed, payload);
});

test('parseBackupPayload accepts a valid backup and rejects payloads without recognized data', () => {
  const serialized = serializeBackupPayload(lotteryState, defaultGuildData, '2026-05-05T12:00:00.000Z');
  const parsed = parseBackupPayload(serialized);

  assert.equal(parsed.exportedAt, '2026-05-05T12:00:00.000Z');
  assert.deepEqual(parsed.lotteryState, lotteryState);

  assert.throws(() => parseBackupPayload('{"foo":"bar"}'), /Backup sem dados reconhecidos/);
});

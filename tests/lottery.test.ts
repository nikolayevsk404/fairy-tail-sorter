import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildShareText,
  drawNextGroup,
  getStatusMessage,
  normalizeParticipants,
  sanitizeDrawMode,
} from '../utils/lottery';
import { DrawGroup } from '../utils/types';

test('sanitizeDrawMode normalizes invalid and decimal values', () => {
  assert.equal(sanitizeDrawMode(Number.NaN), 2);
  assert.equal(sanitizeDrawMode(0), 1);
  assert.equal(sanitizeDrawMode(3.9), 3);
});

test('normalizeParticipants removes empty lines, extra spaces, and case-insensitive duplicates', () => {
  const participants = normalizeParticipants(' Ana  \n\nBruno\nana\n  Carla   Silva  \n');

  assert.deepEqual(participants, ['Ana', 'Bruno', 'Carla Silva']);
});

test('drawNextGroup returns null when there are not enough participants', () => {
  assert.equal(drawNextGroup(['Ana'], 2), null);
});

test('drawNextGroup returns a group with the expected size and valid names only', () => {
  const participants = ['Ana', 'Bruno', 'Carla', 'Diego'];
  const group = drawNextGroup(participants, 3);

  assert.ok(group);
  assert.equal(group.length, 3);
  assert.equal(new Set(group).size, 3);
  group.forEach((member) => assert.ok(participants.includes(member)));
});

test('getStatusMessage reflects the current draw state', () => {
  assert.equal(getStatusMessage(0, 2, true), 'Todos os participantes já foram sorteados ✨');
  assert.equal(getStatusMessage(1, 2, true), 'Participantes insuficientes para formar novo grupo');
  assert.equal(getStatusMessage(4, 2, false), 'Pronto para um novo sorteio mágico ✨');
});

test('buildShareText builds the textual group summary', () => {
  const groups: DrawGroup[] = [
    { id: 'g1', index: 1, members: ['Ana', 'Bruno'], createdAt: '2026-05-05T00:00:00.000Z' },
  ];

  const shareText = buildShareText(groups, 3, 2);

  assert.match(shareText, /Fairy Tail Art Guild • grupos de 2/);
  assert.match(shareText, /✨ Grupo 1/);
  assert.match(shareText, /Ana/);
  assert.match(shareText, /Bruno/);
  assert.match(shareText, /Participantes restantes: 3/);
});

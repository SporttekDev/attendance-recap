import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeTime } from '../lib/date';

describe('normalizeTime (jam 24 jam)', () => {
  const ok: [string, string][] = [
    ['08:30', '08:30'], ['8:30', '08:30'], ['08.30', '08:30'], ['0830', '08:30'], ['830', '08:30'],
    ['17:05', '17:05'], ['1705', '17:05'], ['8', '08:00'], ['17', '17:00'], ['00:00', '00:00'],
    ['23:59', '23:59'], [' 18:30 ', '18:30'], ['8,30', '08:30'], ['8:5', '08:05'],
  ];
  for (const [input, want] of ok) {
    it(`"${input}" jadi ${want}`, () => assert.equal(normalizeTime(input), want));
  }
  for (const bad of ['', '24:00', '25:00', '08:75', '8:30 PM', 'abc', '12345', '-']) {
    it(`"${bad}" ditolak`, () => assert.equal(normalizeTime(bad), null));
  }
});

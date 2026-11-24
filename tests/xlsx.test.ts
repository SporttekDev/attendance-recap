import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSheetRows, sheetName, SHEET_HEADER } from '../lib/xlsx';
import { summarize, buildRows } from '../lib/attendance';
import { periodOf } from '../lib/parse';
import { createSample } from '../lib/sample';
import type { Ctx } from '../lib/types';

const e = createSample();
const ctx: Ctx = { cfg: { masuk: '08:00', tol: 10, lemburMulai: '17:00', lemburBatas: '18:30' }, holidays: [], period: periodOf([e]) };

test('sheet berisi judul, header, satu baris per hari, dan total', () => {
    const aoa = buildSheetRows(e, ctx, 'OKTOBER 2026');
    const rows = buildRows(e, ctx);
    assert.equal(aoa[0][0], 'ABSEN BULAN : OKTOBER 2026');
    assert.equal(aoa[1][0], 'NAMA : KARYAWAN CONTOH');
    assert.deepEqual(aoa[3], SHEET_HEADER);
    assert.equal(aoa.length, 4 + rows.length + 1);
    const t = summarize(rows);
    assert.deepEqual(aoa[aoa.length - 1], ['', 'TOTAL', '', '', t.telat, t.lembur, t.hari, '']);
});

test('baris data: jam HH:MM, tanda minus bila kosong, nol dikosongkan', () => {
    const aoa = buildSheetRows(e, ctx, 'X');
    const first = aoa[4];
    assert.equal(first[0], 1);
    assert.match(String(first[2]), /^\d\d:\d\d$|^-$/);
    const sum = aoa.slice(4, -1).reduce((a, r) => a + (Number(r[4]) || 0), 0);
    assert.equal(sum, aoa[aoa.length - 1][4]);
});

test('nama sheet aman dan unik', () => {
    const used = new Set<string>();
    assert.equal(sheetName('A/B:C*D', used), 'A B C D');
    assert.equal(sheetName('A/B:C*D', used), 'A B C D (2)');
    const long = sheetName('X'.repeat(40), used);
    assert.equal(long.length, 31);
    assert.equal(sheetName('', used), 'Sheet');
});
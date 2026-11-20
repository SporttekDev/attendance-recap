import test from 'node:test';
import assert from 'node:assert/strict';
import type { jsPDF } from 'jspdf';
import { drawEmployee, PAGE_H, PAGE_W, TABLE_W } from '../lib/pdf';
import { periodOf } from '../lib/parse';
import { createSample } from '../lib/sample';
import type { Ctx, Employee } from '../lib/types';

interface Rec { rects: { x: number; y: number; w: number; h: number; page: number }[]; texts: { s: string; x: number; y: number; page: number }[]; pages: number }

function fake(): { doc: jsPDF; rec: Rec } {
  const rec: Rec = { rects: [], texts: [], pages: 1 };
  const doc = {
    setTextColor() {}, setDrawColor() {}, setLineWidth() {}, setFont() {}, setFontSize() {},
    splitTextToSize: (s: string) => [s],
    text: (s: string, x: number, y: number) => rec.texts.push({ s, x, y, page: rec.pages }),
    rect: (x: number, y: number, w: number, h: number) => rec.rects.push({ x, y, w, h, page: rec.pages }),
    addPage: () => { rec.pages++; },
  } as unknown as jsPDF;
  return { doc, rec };
}

function ctxFor(e: Employee): Ctx {
  return { cfg: { masuk: '08:00', tol: 10, lemburMulai: '17:30', lemburBatas: '18:30' }, holidays: [], period: periodOf([e]) };
}

test('konten satu halaman terpusat horizontal dan vertikal', () => {
  const e = createSample();
  const { doc, rec } = fake();
  drawEmployee(doc, e, ctxFor(e), 'OKTOBER 2026');
  assert.equal(rec.pages, 1);
  const minX = Math.min(...rec.rects.map((r) => r.x));
  const maxX = Math.max(...rec.rects.map((r) => r.x + r.w));
  assert.ok(Math.abs(minX - (PAGE_W - maxX)) < 0.01);
  assert.ok(Math.abs(maxX - minX - TABLE_W) < 0.01);
  const topText = Math.min(...rec.texts.map((t) => t.y));
  const bottomRect = Math.max(...rec.rects.map((r) => r.y + r.h));
  // baris judul 13pt berada ~10pt di bawah tepi atas blok
  assert.ok(Math.abs((topText - 10) - (PAGE_H - bottomRect)) < 0.01);
  // judul rata dengan tepi kiri tabel
  assert.equal(rec.texts[0].x, minX);
});

test('konten panjang berlanjut ke halaman berikutnya', () => {
  const e = createSample();
  for (let d = 1; d <= 28; d++) e.edits[`2026-11-${String(d).padStart(2, '0')}`] = { manual: true, status: 'Izin', note: 'x' };
  const { doc, rec } = fake();
  drawEmployee(doc, e, ctxFor(e), 'NOVEMBER 2026');
  assert.ok(rec.pages >= 2);
});

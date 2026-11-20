import type { jsPDF } from 'jspdf';
import { buildRows, bulanText, summarize } from './attendance';
import { fmt, idDate } from './date';
import type { Ctx, Employee } from './types';

export const PAGE_W = 841.89; // A4 landscape, satuan pt
export const PAGE_H = 595.28;
/** Margin aman atas/bawah. Konten yang muat satu halaman dipusatkan di antaranya. */
const SAFE = 36;
/** Margin atas pada halaman lanjutan (konten lebih dari satu halaman). */
const CONT_TOP = 40;
/** Lebar blok konten (judul + tabel). Dipusatkan secara horizontal. */
export const TABLE_W = 760;
/** Tinggi blok judul: baris bulan, baris nama, jarak ke tabel. */
const TITLE_H = 44;
const HEADER_H = 28;
const LINE_H = 10;
/** Lebar kolom: No, Tanggal, Masuk, Pulang, [label+nilai] telat, lembur, hari lembur. Sisanya Keterangan. */
const FIXED_COLS = [28, 70, 62, 62, 48, 36, 48, 36, 40, 36];

export function drawEmployee(doc: jsPDF, emp: Employee, ctx: Ctx, bulan: string): void {
  const rows = buildRows(emp, ctx);
  const t = summarize(rows);

  const left = (PAGE_W - TABLE_W) / 2;
  const cols = [...FIXED_COLS, TABLE_W - FIXED_COLS.reduce((a, b) => a + b, 0)];
  const xs = [left];
  for (const w of cols) xs.push(xs[xs.length - 1] + w);

  const body = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
  };

  /* Ukur dulu semua baris supaya tinggi total diketahui sebelum menggambar. */
  body();
  const measured = rows.map(({ iso, c }) => {
    const lines: string[] = c.ket ? doc.splitTextToSize(c.ket, cols[10] - 8) : [];
    return { iso, c, lines, h: Math.max(15, lines.length * LINE_H + 5) };
  });
  const total = TITLE_H + HEADER_H + measured.reduce((a, r) => a + r.h, 0);
  const avail = PAGE_H - SAFE * 2;

  /* Muat satu halaman: pusatkan vertikal. Kalau tidak, mulai dari atas dan lanjut ke halaman berikutnya. */
  let top = total <= avail ? (PAGE_H - total) / 2 : CONT_TOP;
  const bottom = PAGE_H - SAFE;

  doc.setTextColor(0);
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`ABSEN BULAN : ${bulan}`, xs[0], top + 10);
  doc.text(`NAMA : ${emp.full.toUpperCase()}`, xs[0], top + 28);
  let y = top + TITLE_H;

  const text = (lines: string[], from: number, to: number, boxTop: number, h: number, align: 'center' | 'left') => {
    const mid = boxTop + h / 2;
    lines.forEach((s, i) => {
      const yy = mid + (i - (lines.length - 1) / 2) * LINE_H;
      if (align === 'left') doc.text(s, xs[from] + 4, yy, { baseline: 'middle' });
      else doc.text(s, (xs[from] + xs[to]) / 2, yy, { align: 'center', baseline: 'middle' });
    });
  };

  const box = (from: number, to: number, boxTop: number, h: number, lines: string[], align: 'center' | 'left' = 'center') => {
    doc.rect(xs[from], boxTop, xs[to] - xs[from], h);
    if (lines.length) text(lines, from, to, boxTop, h, align);
  };

  const header = () => {
    const h = HEADER_H;
    body();
    box(0, 1, y, h, ['No']);
    box(1, 2, y, h, ['Tanggal']);
    box(2, 3, y, h, ['Jam Masuk']);
    box(3, 4, y, h, ['Jam Pulang']);
    box(4, 5, y, h, ['Menit', 'Telat']);
    box(5, 6, y, h, [String(t.telat)]);
    box(6, 7, y, h, ['Menit', 'Lembur']);
    box(7, 8, y, h, [String(t.lembur)]);
    box(8, 9, y, h, ['Hari', 'Lembur']);
    box(9, 10, y, h, [String(t.hari)]);
    box(10, 11, y, h, ['Keterangan']);
    y += h;
  };

  header();
  body();

  measured.forEach(({ iso, c, lines, h }, n) => {
    if (y + h > bottom) {
      doc.addPage();
      y = CONT_TOP;
      header();
      body();
    }
    box(0, 1, y, h, [String(n + 1)]);
    box(1, 2, y, h, [idDate(iso)]);
    box(2, 3, y, h, [c.masuk !== null ? `${fmt(c.masuk)}:00` : '-']);
    box(3, 4, y, h, [c.pulang !== null ? `${fmt(c.pulang)}:00` : '-']);
    box(4, 6, y, h, c.telat > 0 ? [String(c.telat)] : []);
    box(6, 8, y, h, c.lembur > 0 ? [String(c.lembur)] : []);
    box(8, 10, y, h, c.hari > 0 ? [String(c.hari)] : []);
    box(10, 11, y, h, lines, 'left');
    y += h;
  });
}

/** Buat satu PDF berisi satu bagian per karyawan, lalu unduh di browser. */
export async function downloadPdf(emps: Employee[], ctx: Ctx, bulanOverride: string, filename: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const bulan = bulanText(ctx.period, bulanOverride);
  emps.forEach((emp, i) => {
    if (i > 0) doc.addPage();
    drawEmployee(doc, emp, ctx, bulan);
  });
  doc.save(filename);
}

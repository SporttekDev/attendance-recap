import { MONTHS, addDays, dowOf, toMin } from './date';
import type { Ctx, DayCalc, DayRow, Edit, Edits, Employee, Period, Totals } from './types';

const MAX_DAYS = 400;

export const isHoliday = (iso: string, ctx: Ctx): boolean => ctx.holidays.includes(iso);

/** Sabtu, Minggu, atau tanggal merah. */
export function isOff(iso: string, ctx: Ctx): boolean {
  const d = dowOf(iso);
  return d === 0 || d === 6 || isHoliday(iso, ctx);
}

/**
 * Tanggal yang tampil di tabel: semua hari kerja dalam periode, ditambah hari libur yang punya scan,
 * ditambah baris manual.
 */
export function rowDates(emp: Employee, ctx: Ctx): string[] {
  const { start, end } = ctx.period;
  const set = new Set<string>();
  for (const iso of Object.keys(emp.scans)) if (iso >= start && iso <= end) set.add(iso);
  let n = 0;
  for (let iso = start; iso && end && iso <= end && n < MAX_DAYS; iso = addDays(iso, 1), n++) {
    if (!isOff(iso, ctx)) set.add(iso);
  }
  for (const [iso, e] of Object.entries(emp.edits)) if (e.manual) set.add(iso);
  return [...set].sort();
}

const has = (v: unknown): boolean => v !== undefined && v !== null && v !== '';

export function calc(emp: Employee, iso: string, ctx: Ctx): DayCalc {
  const scans = emp.scans[iso] ?? [];
  const e: Edit = emp.edits[iso] ?? {};
  const { cfg } = ctx;

  let autoMasuk: number | null = null;
  let autoPulang: number | null = null;
  if (scans.length === 1) {
    // Satu scan setelah jam 12:00 dianggap jam pulang (lupa scan pagi).
    if (scans[0] >= 720) autoPulang = scans[0];
    else autoMasuk = scans[0];
  } else if (scans.length > 1) {
    autoMasuk = Math.min(...scans);
    autoPulang = Math.max(...scans);
  }

  const pick = (ov: string | undefined, auto: number | null): number | null =>
    ov === undefined ? auto : ov === '-' ? null : toMin(ov);
  const masuk = pick(e.masuk, autoMasuk);
  const pulang = pick(e.pulang, autoPulang);

  const holiday = isHoliday(iso, ctx);
  const off = isOff(iso, ctx);
  const status = e.status ?? '';
  const note = e.note ?? '';

  const limit = (toMin(cfg.masuk) ?? 480) + Number(cfg.tol || 0);
  const autoTelat = !off && masuk !== null ? Math.max(0, masuk - limit) : 0;
  const autoHari = off && (masuk !== null || pulang !== null) && status !== 'Proyek' ? 1 : 0;

  const telat = has(e.telat) ? Number(e.telat) : autoTelat;
  const lembur = has(e.lembur) ? Number(e.lembur) : 0;
  const hari = has(e.hari) ? Number(e.hari) : autoHari;

  const batas = toMin(cfg.lemburBatas) ?? 1110;
  const mulai = toMin(cfg.lemburMulai) ?? 1050;
  const saran = !off && !lembur && pulang !== null && pulang > batas ? pulang - mulai : 0;

  const missing = !off && masuk === null && pulang === null && !status && !note.trim();
  const ket = status ? (status === 'Proyek' ? note || 'Proyek' : status + (note ? ': ' + note : '')) : note;

  return { masuk, pulang, telat, lembur, hari, autoTelat, autoHari, saran, off, holiday, missing, status, note, ket, edit: e };
}

export function buildRows(emp: Employee, ctx: Ctx): DayRow[] {
  return rowDates(emp, ctx).map((iso) => ({ iso, c: calc(emp, iso, ctx) }));
}

export function summarize(rows: DayRow[]): Totals {
  const t: Totals = { telat: 0, lembur: 0, hari: 0, hadir: 0, missing: 0 };
  for (const { c } of rows) {
    t.telat += c.telat;
    t.lembur += c.lembur;
    t.hari += c.hari;
    if (c.masuk !== null || c.pulang !== null) t.hadir++;
    if (c.missing) t.missing++;
  }
  return t;
}

/** Teks bulan di judul PDF. Memakai isian manual jika ada, kalau tidak dari bulan tanggal akhir periode. */
export function bulanText(period: Period, override: string): string {
  if (override) return override;
  if (!period.end) return '';
  const [y, m] = period.end.split('-');
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

/** Terapkan perubahan ke satu tanggal. Nilai undefined atau string kosong (status, note) menghapus field itu. */
export function applyPatch(edits: Edits, iso: string, patch: Partial<Edit>): Edits {
  const next: Edits = { ...edits };
  const e: Record<string, unknown> = { ...(edits[iso] ?? {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || ((k === 'note' || k === 'status') && v === '')) delete e[k];
    else e[k] = v;
  }
  if (Object.keys(e).length === 0) delete next[iso];
  else next[iso] = e as Edit;
  return next;
}

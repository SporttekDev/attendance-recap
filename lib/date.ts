export const MONTHS = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
] as const;

export const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

export const p2 = (n: number): string => String(n).padStart(2, '0');

export const isoOf = (y: number, m: number, d: number): string => `${y}-${p2(m)}-${p2(d)}`;

export function dateOf(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const dowOf = (iso: string): number => dateOf(iso).getDay();

/** 2026-10-21 -> 21/10/2026 */
export function idDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** "08:25" -> 505. Mengembalikan null jika format tidak valid. */
export function toMin(t: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(t ?? '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/**
 * Ubah ketikan jam menjadi "HH:MM" (24 jam). Menerima 8:30, 08.30, 0830, 830, dan 8 (jadi 08:00).
 * Mengembalikan null jika bukan jam yang valid, misalnya 25:00 atau 08:75.
 */
export function normalizeTime(raw: string): string | null {
  const s = raw.trim().replace(/[.,]/g, ':');
  let x: RegExpExecArray | null;
  let h: number;
  let m: number;
  if ((x = /^(\d{1,2}):(\d{1,2})$/.exec(s))) {
    h = Number(x[1]);
    m = Number(x[2]);
  } else if ((x = /^(\d{3,4})$/.exec(s))) {
    const d = x[1].padStart(4, '0');
    h = Number(d.slice(0, 2));
    m = Number(d.slice(2));
  } else if ((x = /^(\d{1,2})$/.exec(s))) {
    h = Number(x[1]);
    m = 0;
  } else {
    return null;
  }
  if (h > 23 || m > 59) return null;
  return `${p2(h)}:${p2(m)}`;
}

/** 505 -> "08:25" */
export const fmt = (min: number): string => `${p2(Math.floor(min / 60))}:${p2(min % 60)}`;

export function addDays(iso: string, n: number): string {
  const d = dateOf(iso);
  d.setDate(d.getDate() + n);
  return isoOf(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

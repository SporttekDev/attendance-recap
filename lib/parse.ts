import { isoOf } from './date';
import type { Edits, Employee, Period } from './types';

export interface ParsedFile {
  employees: Employee[];
  scanCount: number;
}

export interface ParseOptions {
  /** Nama lengkap yang pernah disimpan, dengan key karyawan. */
  names?: Record<string, string>;
  /** Pembaca perubahan manual yang pernah disimpan. */
  loadEdits?: (key: string) => Edits | null;
}

/** Ubah satu sel tanggal/waktu dari Excel menjadi tanggal ISO dan menit sejak tengah malam. */
export function parseStamp(v: unknown): { iso: string; min: number } | null {
  if (v === null || v === undefined || v === '') return null;

  if (typeof v === 'number') {
    // Serial Excel: hari sejak 1899-12-30, pecahan = waktu.
    if (!Number.isFinite(v) || v < 1) return null;
    const days = Math.floor(v);
    let mins = Math.round((v - days) * 1440);
    let extra = 0;
    if (mins >= 1440) {
      mins -= 1440;
      extra = 1;
    }
    const d = new Date(Date.UTC(1899, 11, 30 + days + extra));
    return { iso: isoOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()), min: mins };
  }

  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    const d = new Date(v.getTime() + 30000);
    return { iso: isoOf(d.getFullYear(), d.getMonth() + 1, d.getDate()), min: d.getHours() * 60 + d.getMinutes() };
  }

  const s = String(v).trim();
  // Format ISO dicek lebih dulu agar "2026-09-21" tidak terbaca sebagai "26-09-21".
  let m = /(?<!\d)(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})/.exec(s);
  if (m) {
    return { iso: isoOf(Number(m[1]), Number(m[2]), Number(m[3])), min: Number(m[4]) * 60 + Number(m[5]) };
  }
  m = /(?<!\d)(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\s+(\d{1,2})[:.](\d{2})/.exec(s);
  if (m) {
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return { iso: isoOf(y, Number(m[2]), Number(m[1])), min: Number(m[4]) * 60 + Number(m[5]) };
  }
  return null;
}

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim());

/** Baca baris-baris sheet (array of array) menjadi daftar karyawan beserta scan-nya. */
export function buildEmployees(rows: unknown[][], opts: ParseOptions = {}): ParsedFile {
  const h = rows.findIndex(
    (r) => Array.isArray(r) && r.some((c) => /tgl.*waktu|date.*time/i.test(str(c))),
  );
  if (h < 0) throw new Error('Kolom "Tgl/Waktu" tidak ditemukan di baris judul.');

  const head = rows[h].map((c) => str(c).toLowerCase());
  const col = (re: RegExp, def: number): number => {
    const i = head.findIndex((x) => re.test(x));
    return i < 0 ? def : i;
  };
  const iT = col(/tgl|date/, 3);
  const iN = col(/^nama|name/, 1);
  const iI = col(/no\.?\s*id|^id$/, 2);
  const iD = col(/depart/, 0);

  const map = new Map<string, Employee>();
  let scanCount = 0;

  for (let r = h + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    const st = parseStamp(row[iT]);
    if (!st) continue;

    const name = str(row[iN]);
    const id = str(row[iI]);
    const key = `${id || name || 'karyawan'}|${name}`;

    let emp = map.get(key);
    if (!emp) {
      emp = {
        key,
        name,
        dept: str(row[iD]),
        full: opts.names?.[key] || name.toUpperCase(),
        scans: {},
        edits: opts.loadEdits?.(key) ?? {},
      };
      map.set(key, emp);
    }
    const list = (emp.scans[st.iso] ??= []);
    if (!list.includes(st.min)) {
      list.push(st.min);
      scanCount++;
    }
  }

  if (map.size === 0) throw new Error('Tidak ada baris tanggal/waktu yang bisa dibaca.');
  return { employees: [...map.values()], scanCount };
}

/** Periode awal = tanggal scan paling awal sampai paling akhir dari semua karyawan. */
export function periodOf(emps: Employee[]): Period {
  const all = emps.flatMap((e) => Object.keys(e.scans)).sort();
  return { start: all[0] ?? '', end: all[all.length - 1] ?? '' };
}

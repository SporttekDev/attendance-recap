export const STATUSES = ['Izin', 'Sakit', 'Cuti', 'Proyek', 'Alpha', 'Libur'] as const;
export type Status = (typeof STATUSES)[number];

/** Perubahan manual pada satu tanggal. Field yang tidak ada berarti "pakai hitungan otomatis". */
export interface Edit {
  status?: Status;
  note?: string;
  /** "HH:MM", atau "-" untuk mengosongkan jam hasil mesin. */
  masuk?: string;
  pulang?: string;
  telat?: number;
  lembur?: number;
  hari?: number;
  /** Baris ditambah sendiri, tidak ada di Excel. */
  manual?: boolean;
}

export type Edits = Record<string, Edit>;

export interface Employee {
  key: string;
  name: string;
  dept: string;
  /** Nama lengkap yang tampil di PDF. */
  full: string;
  /** ISO date (YYYY-MM-DD) -> daftar scan dalam menit sejak tengah malam. */
  scans: Record<string, number[]>;
  edits: Edits;
  sample?: boolean;
}

export interface Config {
  /** Jam masuk resmi, "HH:MM". */
  masuk: string;
  /** Toleransi dalam menit. Telat dihitung dari jam masuk + toleransi. */
  tol: number;
  /** Lembur dihitung dari jam ini. */
  lemburMulai: string;
  /** Tombol saran lembur muncul jika pulang melewati jam ini. */
  lemburBatas: string;
}

export interface Period {
  start: string;
  end: string;
}

export interface Ctx {
  cfg: Config;
  holidays: string[];
  period: Period;
}

export interface DayCalc {
  masuk: number | null;
  pulang: number | null;
  telat: number;
  lembur: number;
  hari: number;
  autoTelat: number;
  autoHari: number;
  saran: number;
  off: boolean;
  holiday: boolean;
  missing: boolean;
  status: Status | '';
  note: string;
  /** Teks final untuk kolom Keterangan di PDF. */
  ket: string;
  edit: Edit;
}

export interface DayRow {
  iso: string;
  c: DayCalc;
}

export interface Totals {
  telat: number;
  lembur: number;
  hari: number;
  hadir: number;
  missing: number;
}

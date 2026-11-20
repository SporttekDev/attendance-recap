import type { Employee } from './types';

/**
 * Data contoh dengan pola yang sama seperti ekspor mesin sidik jari.
 * Nilai dalam menit sejak tengah malam (505 = 08:25).
 */
export function createSample(): Employee {
  return {
    key: 'sample',
    sample: true,
    name: 'KARYAWAN CONTOH',
    dept: '',
    full: 'KARYAWAN CONTOH',
    scans: {
      '2026-09-21': [505, 1134],
      '2026-09-22': [502],
      '2026-09-23': [489, 1114],
      '2026-09-24': [506, 1415],
      '2026-09-28': [515, 1108],
      '2026-09-29': [550, 1027],
      '2026-09-30': [483],
      '2026-10-01': [488, 1071],
      '2026-10-02': [492, 1041],
      '2026-10-05': [516, 1025],
      '2026-10-06': [502],
      '2026-10-07': [502, 1023],
      '2026-10-08': [516, 1030],
      '2026-10-09': [504],
      '2026-10-13': [513],
      '2026-10-14': [487],
      '2026-10-15': [490, 1101],
      '2026-10-16': [488],
      '2026-10-19': [470],
      '2026-10-20': [475, 1044],
    },
    edits: {
      '2026-09-24': { lembur: 365, note: 'Update data dan setup sistem' },
      '2026-09-25': { status: 'Proyek', note: 'Event contoh (dibayar proyek)' },
      '2026-09-26': { manual: true, status: 'Proyek', note: 'Event contoh (dibayar proyek)' },
    },
  };
}

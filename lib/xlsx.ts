import { buildRows, bulanText, summarize } from './attendance';
import { fmt, idDate } from './date';
import type { Ctx, Employee } from './types';

export const SHEET_HEADER = ['No', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Menit Telat', 'Menit Lembur', 'Hari Lembur', 'Keterangan'];

type Cell = string | number;

/** Isi satu sheet: judul, tabel seperti di PDF, lalu baris total. Angka nol dikosongkan seperti di PDF. */
export function buildSheetRows(emp: Employee, ctx: Ctx, bulan: string): Cell[][] {
    const rows = buildRows(emp, ctx);
    const t = summarize(rows);
    const nz = (n: number): Cell => (n > 0 ? n : '');
    return [
        [`ABSEN BULAN : ${bulan}`],
        [`NAMA : ${emp.full.toUpperCase()}`],
        [],
        SHEET_HEADER,
        ...rows.map(({ iso, c }, n): Cell[] => [
            n + 1,
            idDate(iso),
            c.masuk !== null ? fmt(c.masuk) : '-',
            c.pulang !== null ? fmt(c.pulang) : '-',
            nz(c.telat),
            nz(c.lembur),
            nz(c.hari),
            c.ket,
        ]),
        ['', 'TOTAL', '', '', t.telat, t.lembur, t.hari, ''],
    ];
}

/** Nama sheet Excel: maksimal 31 huruf, tanpa karakter terlarang, dan tidak boleh kembar. */
export function sheetName(name: string, used: Set<string>): string {
    const base = (name.replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim() || 'Sheet').slice(0, 31);
    let out = base;
    for (let i = 2; used.has(out.toLowerCase()); i++) {
        const suffix = ` (${i})`;
        out = base.slice(0, 31 - suffix.length) + suffix;
    }
    used.add(out.toLowerCase());
    return out;
}

/** Buat satu file Excel, satu sheet per karyawan, lalu unduh di browser. SheetJS dimuat saat dibutuhkan. */
export async function downloadXlsx(emps: Employee[], ctx: Ctx, bulanOverride: string, filename: string): Promise<void> {
    const XLSX = await import('xlsx');
    const bulan = bulanText(ctx.period, bulanOverride);
    const wb = XLSX.utils.book_new();
    const used = new Set<string>();
    for (const emp of emps) {
        const ws = XLSX.utils.aoa_to_sheet(buildSheetRows(emp, ctx, bulan));
        ws['!cols'] = [{ wch: 5 }, { wch: 14 }, { wch: 11 }, { wch: 11 }, { wch: 13 }, { wch: 14 }, { wch: 12 }, { wch: 48 }];
        XLSX.utils.book_append_sheet(wb, ws, sheetName(emp.name || emp.full || emp.key, used));
    }
    XLSX.writeFile(wb, filename);
}
'use client';

import { btn, btnPrimary, h2, panel } from '@/lib/ui';

interface Props {
  count: number;
  missing: number;
  busy: boolean;
  onPdf: () => void;
  onPdfAll: () => void;
  onExcel: () => void;
  onExcelAll: () => void;
}

export default function DownloadPanel({ count, missing, busy, onPdf, onPdfAll, onExcel, onExcelAll }: Props) {
  return (
    <section className={`${panel} flex-[1_1_420px]`}>
      <h2 className={h2}>Unduh</h2>
      <p className="mt-1 mb-2.5 text-xs text-muted">
        {missing > 0
          ? `${missing} hari kerja masih kosong. Isi status atau keterangannya sebelum mengunduh.`
          : 'PDF memakai tata letak A4 landscape seperti contoh Anda. Excel berisi tabel yang sama, satu sheet per orang.'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary} type="button" disabled={busy} onClick={onPdf}>
          {busy ? 'Membuat file...' : 'Unduh PDF'}
        </button>
        <button className={btn} type="button" disabled={busy} onClick={onExcel}>
          Unduh Excel
        </button>
        {count > 1 && (
          <>
            <button className={btn} type="button" disabled={busy} onClick={onPdfAll}>
              Unduh semua ({count} orang) dalam 1 PDF
            </button>
            <button className={btn} type="button" disabled={busy} onClick={onExcelAll}>
              Unduh semua ({count} orang) dalam 1 Excel
            </button>
          </>
        )}
      </div>
    </section>
  );
}
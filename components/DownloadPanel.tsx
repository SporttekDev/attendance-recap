'use client';

import { btn, btnPrimary, h2, panel } from '@/lib/ui';

interface Props {
  count: number;
  missing: number;
  busy: boolean;
  onOne: () => void;
  onAll: () => void;
}

export default function DownloadPanel({ count, missing, busy, onOne, onAll }: Props) {
  return (
    <section className={`${panel} flex-[1_1_420px]`}>
      <h2 className={h2}>Unduh</h2>
      <p className="mt-1 mb-2.5 text-xs text-muted">
        {missing > 0
          ? `${missing} hari kerja masih kosong. Isi status atau keterangannya sebelum mengunduh.`
          : 'PDF memakai tata letak A4 landscape seperti contoh Anda.'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary} type="button" disabled={busy} onClick={onOne}>
          {busy ? 'Membuat PDF...' : 'Unduh PDF'}
        </button>
        {count > 1 && (
          <button className={btn} type="button" disabled={busy} onClick={onAll}>
            Unduh semua ({count} orang) dalam 1 PDF
          </button>
        )}
      </div>
    </section>
  );
}
'use client';

import type { Totals } from '@/lib/types';

export default function Stats({ t, onGoMissing }: { t: Totals; onGoMissing: () => void }) {
  const items: [string, number][] = [
    ['Hari hadir', t.hadir],
    ['Menit telat', t.telat],
    ['Menit lembur', t.lembur],
    ['Hari lembur', t.hari],
  ];
  return (
    <section className="stats" aria-label="Ringkasan">
      {items.map(([label, value]) => (
        <div className="stat" key={label}>
          <b>{value}</b>
          <span>{label}</span>
        </div>
      ))}
      {t.missing > 0 && (
        <div className="stat alert">
          <button type="button" onClick={onGoMissing}>
            <b>{t.missing}</b>
            <span>hari kerja belum ada keterangan</span>
          </button>
        </div>
      )}
    </section>
  );
}

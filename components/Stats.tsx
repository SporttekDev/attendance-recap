'use client';

import type { Totals } from '@/lib/types';

const card = 'min-w-0 flex-[1_1_130px] rounded-[14px] border px-4 py-3';
const num = 'block text-[28px] leading-[1.1] font-bold tracking-[-0.03em] tabular-nums';

export default function Stats({ t, onGoMissing }: { t: Totals; onGoMissing: () => void }) {
  const items: [string, number][] = [
    ['Hari hadir', t.hadir],
    ['Menit telat', t.telat],
    ['Menit lembur', t.lembur],
    ['Hari lembur', t.hari],
  ];
  return (
    <section className="flex flex-wrap gap-3" aria-label="Ringkasan">
      {items.map(([label, value]) => (
        <div className={`${card} border-line bg-white`} key={label}>
          <b className={num}>{value}</b>
          <span className="text-xs text-muted">{label}</span>
        </div>
      ))}
      {t.missing > 0 && (
        <div className={`${card} border-bad bg-bad-soft`}>
          <button type="button" className="block w-full text-left focus-visible:outline-bad" onClick={onGoMissing}>
            <b className={`${num} text-bad`}>{t.missing}</b>
            <span className="text-xs text-muted">hari kerja belum ada keterangan</span>
          </button>
        </div>
      )}
    </section>
  );
}
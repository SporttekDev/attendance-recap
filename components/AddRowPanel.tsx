'use client';

import { useState } from 'react';
import { STATUSES, type Status } from '@/lib/types';
import { btnPrimary, h2, hint, input, inlineField, inlineRow, label, panel } from '@/lib/ui';

export default function AddRowPanel({ onAdd }: { onAdd: (iso: string, status: Status | undefined) => void }) {
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<Status | ''>('');

  return (
    <section className={`${panel} flex-[1_1_420px]`}>
      <h2 className={h2}>Tambah baris manual</h2>
      <p className={`${hint} mt-1`}>
        Untuk tanggal yang tidak ada di Excel: izin, sakit, proyek, atau kerja di akhir pekan tanpa scan.
      </p>
      <div className={`${inlineRow} mt-2.5`}>
        <div className={inlineField}>
          <label className={label} htmlFor="aDate">Tanggal</label>
          <input className={input} id="aDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={inlineField}>
          <label className={label} htmlFor="aStatus">Status</label>
          <select className={input} id="aStatus" value={status} onChange={(e) => setStatus(e.target.value as Status | '')}>
            <option value="">-</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          className={btnPrimary}
          type="button"
          disabled={!date}
          onClick={() => {
            onAdd(date, status || undefined);
            setDate('');
          }}
        >
          Tambah baris
        </button>
      </div>
    </section>
  );
}
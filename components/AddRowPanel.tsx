'use client';

import { useState } from 'react';
import { STATUSES, type Status } from '@/lib/types';

export default function AddRowPanel({ onAdd }: { onAdd: (iso: string, status: Status | undefined) => void }) {
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<Status | ''>('');

  return (
    <section className="panel">
      <h2>Tambah baris manual</h2>
      <p className="hint" style={{ marginTop: 4 }}>
        Untuk tanggal yang tidak ada di Excel: izin, sakit, proyek, atau kerja di akhir pekan tanpa scan.
      </p>
      <div className="row-inline" style={{ marginTop: 10 }}>
        <div className="field">
          <label htmlFor="aDate">Tanggal</label>
          <input id="aDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="aStatus">Status</label>
          <select id="aStatus" value={status} onChange={(e) => setStatus(e.target.value as Status | '')}>
            <option value="">-</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          className="btn primary"
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

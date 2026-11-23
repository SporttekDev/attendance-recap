'use client';

import type { Employee, Period } from '@/lib/types';
import { autoGrid, field, input, label, panel } from '@/lib/ui';

interface Props {
  emps: Employee[];
  cur: number;
  onCur: (i: number) => void;
  full: string;
  onFull: (v: string) => void;
  bulan: string;
  bulanPlaceholder: string;
  onBulan: (v: string) => void;
  period: Period;
  onPeriod: (p: Period) => void;
}

export default function IdentityPanel(p: Props) {
  return (
    <section className={panel}>
      <div className={autoGrid}>
        {p.emps.length > 1 && (
          <div className={field}>
            <label className={label} htmlFor="empSel">Karyawan</label>
            <select className={input} id="empSel" value={p.cur} onChange={(e) => p.onCur(Number(e.target.value))}>
              {p.emps.map((e, i) => (
                <option key={e.key} value={i}>{e.name || e.key}</option>
              ))}
            </select>
          </div>
        )}
        <div className={field}>
          <label className={label} htmlFor="fullName">Nama di PDF</label>
          <input className={input} id="fullName" type="text" autoComplete="off" value={p.full} onChange={(e) => p.onFull(e.target.value)} />
        </div>
        <div className={field}>
          <label className={label} htmlFor="bulan">Bulan di judul</label>
          <input
            className={input}
            id="bulan"
            type="text"
            autoComplete="off"
            value={p.bulan}
            placeholder={p.bulanPlaceholder}
            onChange={(e) => p.onBulan(e.target.value.toUpperCase())}
          />
        </div>
        <div className={field}>
          <label className={label} htmlFor="pStart">Periode mulai</label>
          <input
            className={input}
            id="pStart"
            type="date"
            value={p.period.start}
            onChange={(e) => e.target.value && p.onPeriod({ ...p.period, start: e.target.value })}
          />
        </div>
        <div className={field}>
          <label className={label} htmlFor="pEnd">Periode sampai</label>
          <input
            className={input}
            id="pEnd"
            type="date"
            value={p.period.end}
            onChange={(e) => e.target.value && p.onPeriod({ ...p.period, end: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
}
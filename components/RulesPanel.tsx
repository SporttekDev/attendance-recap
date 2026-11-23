'use client';

import { useState } from 'react';
import TimeInput from '@/components/TimeInput';
import { fmt, idDate, toMin } from '@/lib/date';
import type { Config } from '@/lib/types';
import { autoGrid, btn, field, hint, input, inlineField, inlineRow, label, panel } from '@/lib/ui';

interface Props {
  cfg: Config;
  onCfg: (c: Config) => void;
  holidays: string[];
  onHolidays: (h: string[]) => void;
}

export default function RulesPanel({ cfg, onCfg, holidays, onHolidays }: Props) {
  const [hDate, setHDate] = useState('');
  const limit = (toMin(cfg.masuk) ?? 480) + cfg.tol;
  const example = (toMin(cfg.masuk) ?? 480) + 25;

  const setTime = (key: 'masuk' | 'lemburMulai' | 'lemburBatas') => (v: string) => v && onCfg({ ...cfg, [key]: v });

  const addHoliday = () => {
    if (!hDate) return;
    if (!holidays.includes(hDate)) onHolidays([...holidays, hDate].sort());
    setHDate('');
  };

  return (
    <details className={`${panel} group`}>
      <summary className="text-[15px] font-bold tracking-[-0.01em] group-open:mb-3">Aturan hitung dan tanggal merah</summary>
      <div className={autoGrid}>
        <div className={field}>
          <label className={label} htmlFor="cMasuk">Jam masuk</label>
          <TimeInput className={input} id="cMasuk" value={cfg.masuk} allowEmpty={false} onChange={setTime('masuk')} />
        </div>
        <div className={field}>
          <label className={label} htmlFor="cTol">Toleransi (menit)</label>
          <input
            className={`${input} disabled:cursor-not-allowed disabled:bg-off disabled:text-muted`}
            id="cTol"
            type="number"
            value={cfg.tol}
            disabled
            readOnly
          />
        </div>
        <div className={field}>
          <label className={label} htmlFor="cMulai">Lembur dihitung dari jam</label>
          <TimeInput className={input} id="cMulai" value={cfg.lemburMulai} allowEmpty={false} onChange={setTime('lemburMulai')} />
        </div>
        <div className={field}>
          <label className={label} htmlFor="cBatas">Saran lembur muncul setelah jam</label>
          <TimeInput className={input} id="cBatas" value={cfg.lemburBatas} allowEmpty={false} onChange={setTime('lemburBatas')} />
        </div>
      </div>

      <p className={`${hint} mt-2.5`}>
        Telat dihitung dari jam {fmt(limit)} (jam masuk + toleransi): masuk {fmt(example)} jadi {example - limit} menit.
        Lembur tidak pernah terisi otomatis. Jika pulang setelah {cfg.lemburBatas}, tombol saran muncul di kolom lembur
        dan Anda tinggal klik. Scan di Sabtu, Minggu, atau tanggal merah dihitung 1 hari lembur, kecuali statusnya
        Proyek. Scan tunggal setelah 12:00 dianggap jam pulang.
      </p>

      <div className={`${inlineRow} mt-3.5`}>
        <div className={inlineField}>
          <label className={label} htmlFor="hDate">Tanggal merah</label>
          <input className={input} id="hDate" type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} />
        </div>
        <button className={btn} type="button" onClick={addHoliday}>Tambah</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {holidays.map((h) => (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-off py-[3px] pr-1 pl-2.5 text-xs" key={h}>
            {idDate(h)}
            <button
              type="button"
              className="px-1.5 text-sm leading-none text-muted"
              aria-label={`Hapus ${idDate(h)}`}
              onClick={() => onHolidays(holidays.filter((x) => x !== h))}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </details>
  );
}
'use client';

import { useState } from 'react';
import TimeInput from '@/components/TimeInput';
import { fmt, idDate, toMin } from '@/lib/date';
import type { Config } from '@/lib/types';

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
    <details className="panel">
      <summary>Aturan hitung dan tanggal merah</summary>
      <div className="grid">
        <div className="field">
          <label htmlFor="cMasuk">Jam masuk</label>
          <TimeInput id="cMasuk" value={cfg.masuk} allowEmpty={false} onChange={setTime('masuk')} />
        </div>
        <div className="field">
          <label htmlFor="cTol">Toleransi (menit)</label>
          <input
            id="cTol"
            type="number"
            min={0}
            step={1}
            value={cfg.tol}
            onChange={(e) => onCfg({ ...cfg, tol: Math.max(0, Number(e.target.value) || 0) })}
          />
        </div>
        <div className="field">
          <label htmlFor="cMulai">Lembur dihitung dari jam</label>
          <TimeInput id="cMulai" value={cfg.lemburMulai} allowEmpty={false} onChange={setTime('lemburMulai')} />
        </div>
        <div className="field">
          <label htmlFor="cBatas">Saran lembur muncul setelah jam</label>
          <TimeInput id="cBatas" value={cfg.lemburBatas} allowEmpty={false} onChange={setTime('lemburBatas')} />
        </div>
      </div>

      <p className="hint">
        Telat dihitung dari jam {fmt(limit)} (jam masuk + toleransi): masuk {fmt(example)} jadi {example - limit} menit.
        Lembur tidak pernah terisi otomatis. Jika pulang setelah {cfg.lemburBatas}, tombol saran muncul di kolom lembur
        dan Anda tinggal klik. Scan di Sabtu, Minggu, atau tanggal merah dihitung 1 hari lembur, kecuali statusnya
        Proyek. Scan tunggal setelah 12:00 dianggap jam pulang.
      </p>

      <div className="row-inline" style={{ marginTop: 14 }}>
        <div className="field">
          <label htmlFor="hDate">Tanggal merah</label>
          <input id="hDate" type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} />
        </div>
        <button className="btn" type="button" onClick={addHoliday}>Tambah</button>
      </div>
      <div className="chips">
        {holidays.map((h) => (
          <span className="chip" key={h}>
            {idDate(h)}
            <button type="button" aria-label={`Hapus ${idDate(h)}`} onClick={() => onHolidays(holidays.filter((x) => x !== h))}>
              &times;
            </button>
          </span>
        ))}
      </div>
    </details>
  );
}

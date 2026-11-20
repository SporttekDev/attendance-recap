'use client';

import TimeInput from '@/components/TimeInput';
import { DAYS, dowOf, fmt, idDate } from '@/lib/date';
import { STATUSES, type Config, type DayRow, type Edit, type Status } from '@/lib/types';

const OVERRIDE_FIELDS = ['masuk', 'pulang', 'telat', 'lembur', 'hari'] as const;

interface Props {
  rows: DayRow[];
  cfg: Config;
  flashIso: string | null;
  onPatch: (iso: string, patch: Partial<Edit>) => void;
  onRemove: (iso: string) => void;
}

export default function AttendanceTable({ rows, cfg, flashIso, onPatch, onRemove }: Props) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>No</th><th>Tanggal</th><th>Status</th><th>Jam masuk</th><th>Jam pulang</th>
            <th>Telat (mnt)</th><th>Lembur (mnt)</th><th>Hari lembur</th><th>Keterangan</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ iso, c }, n) => {
            const e = c.edit;
            const d = idDate(iso);
            const id = (f: string) => `f-${iso}-${f}`;
            const hasOverride = OVERRIDE_FIELDS.some((f) => e[f] !== undefined);
            const cls = [c.off ? 'off' : '', c.missing ? 'miss' : '', flashIso === iso ? 'flash' : ''].join(' ').trim();
            return (
              <tr key={iso} id={`row-${iso}`} className={cls}>
                <td className="no">{n + 1}</td>
                <td className="tgl">
                  <span className="dt">{d}</span>
                  <span className="dow">{DAYS[dowOf(iso)]}{c.holiday ? ' merah' : ''}</span>
                </td>
                <td className="st">
                  <select
                    id={id('status')}
                    aria-label={`Status ${d}`}
                    value={c.status}
                    onChange={(ev) => onPatch(iso, { status: (ev.target.value || undefined) as Status | undefined })}
                  >
                    <option value="">-</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="tm">
                  <TimeInput
                    id={id('masuk')}
                    aria-label={`Jam masuk ${d}`}
                    value={c.masuk !== null ? fmt(c.masuk) : ''}
                    data-ov={e.masuk !== undefined ? '1' : ''}
                    onChange={(v) => onPatch(iso, { masuk: v === '' ? '-' : v })}
                  />
                </td>
                <td className="tm">
                  <TimeInput
                    id={id('pulang')}
                    aria-label={`Jam pulang ${d}`}
                    value={c.pulang !== null ? fmt(c.pulang) : ''}
                    data-ov={e.pulang !== undefined ? '1' : ''}
                    onChange={(v) => onPatch(iso, { pulang: v === '' ? '-' : v })}
                  />
                </td>
                <td className="nm">
                  <input
                    id={id('telat')}
                    type="number"
                    min={0}
                    step={1}
                    aria-label={`Menit telat ${d}`}
                    value={e.telat ?? ''}
                    placeholder={c.autoTelat ? String(c.autoTelat) : ''}
                    onChange={(ev) => onPatch(iso, { telat: ev.target.value === '' ? undefined : Number(ev.target.value) })}
                  />
                </td>
                <td className="lm">
                  <div className="cell">
                    <input
                      id={id('lembur')}
                      type="number"
                      min={0}
                      step={1}
                      style={{ width: 76 }}
                      aria-label={`Menit lembur ${d}`}
                      value={e.lembur ?? ''}
                      onChange={(ev) => onPatch(iso, { lembur: ev.target.value === '' ? undefined : Number(ev.target.value) })}
                    />
                    {c.saran > 0 && c.pulang !== null && (
                      <button
                        type="button"
                        className="saran"
                        title={`Pulang ${fmt(c.pulang)}. Pakai ${c.saran} menit lembur (dari ${cfg.lemburMulai})`}
                        onClick={() => onPatch(iso, { lembur: c.saran })}
                      >
                        +{c.saran}
                      </button>
                    )}
                  </div>
                </td>
                <td className="nm">
                  <input
                    id={id('hari')}
                    type="number"
                    min={0}
                    step={0.5}
                    aria-label={`Hari lembur ${d}`}
                    value={e.hari ?? ''}
                    placeholder={c.autoHari ? String(c.autoHari) : ''}
                    onChange={(ev) => onPatch(iso, { hari: ev.target.value === '' ? undefined : Number(ev.target.value) })}
                  />
                </td>
                <td>
                  <input
                    id={id('note')}
                    type="text"
                    autoComplete="off"
                    aria-label={`Keterangan ${d}`}
                    value={c.note}
                    placeholder={c.missing ? 'Isi alasan: izin, sakit, proyek...' : ''}
                    onChange={(ev) => onPatch(iso, { note: ev.target.value })}
                  />
                </td>
                <td className="act">
                  {hasOverride && (
                    <button
                      type="button"
                      title="Kembalikan jam dan angka ke hitungan otomatis"
                      aria-label={`Reset baris ${d}`}
                      onClick={() =>
                        onPatch(iso, { masuk: undefined, pulang: undefined, telat: undefined, lembur: undefined, hari: undefined })
                      }
                    >
                      &#8634;
                    </button>
                  )}
                  {e.manual && (
                    <button type="button" title="Hapus baris manual" aria-label={`Hapus baris ${d}`} onClick={() => onRemove(iso)}>
                      &times;
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

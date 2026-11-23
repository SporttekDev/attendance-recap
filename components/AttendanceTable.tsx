'use client';

import TimeInput from '@/components/TimeInput';
import { DAYS, dowOf, fmt, idDate } from '@/lib/date';
import { STATUSES, type Config, type DayRow, type Edit, type Status } from '@/lib/types';
import { cellInput, saran } from '@/lib/ui';

const OVERRIDE_FIELDS = ['masuk', 'pulang', 'telat', 'lembur', 'hari'] as const;

const th = 'border-b border-line px-1.5 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-muted';
const td = 'border-b border-line-soft px-1.5 py-1 align-middle';
const actBtn = 'rounded-md px-1.5 py-0.5 text-base text-muted hover:bg-off hover:text-ink';

interface Props {
  rows: DayRow[];
  cfg: Config;
  flashIso: string | null;
  onPatch: (iso: string, patch: Partial<Edit>) => void;
  onRemove: (iso: string) => void;
}

export default function AttendanceTable({ rows, cfg, flashIso, onPatch, onRemove }: Props) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[980px] border-collapse tabular-nums">
        <thead>
          <tr>
            <th className={th}>No</th><th className={th}>Tanggal</th><th className={th}>Status</th>
            <th className={th}>Jam masuk</th><th className={th}>Jam pulang</th>
            <th className={th}>Telat (mnt)</th><th className={th}>Lembur (mnt)</th><th className={th}>Hari lembur</th>
            <th className={th}>Keterangan</th><th className={th} />
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {rows.map(({ iso, c }, n) => {
            const e = c.edit;
            const d = idDate(iso);
            const id = (f: string) => `f-${iso}-${f}`;
            const hasOverride = OVERRIDE_FIELDS.some((f) => e[f] !== undefined);
            const rowCls = [
              c.off ? '[&>td]:bg-off' : '',
              c.missing ? '[&>td]:bg-bad-soft' : '',
              flashIso === iso ? '[&>td]:outline-2 [&>td]:-outline-offset-2 [&>td]:outline-primary' : '',
            ]
              .join(' ')
              .trim();
            return (
              <tr key={iso} id={`row-${iso}`} className={rowCls}>
                <td className={`${td} w-9 text-center text-muted`}>{n + 1}</td>
                <td className={`${td} w-[120px] whitespace-nowrap`}>
                  <span className="font-medium">{d}</span>
                  <span className={`ml-1.5 text-xs ${c.off ? 'font-medium text-warn' : 'text-muted'}`}>
                    {DAYS[dowOf(iso)]}{c.holiday ? ' merah' : ''}
                  </span>
                </td>
                <td className={`${td} w-[118px]`}>
                  <select
                    className={`${cellInput} w-full`}
                    id={id('status')}
                    aria-label={`Status ${d}`}
                    value={c.status}
                    onChange={(ev) => onPatch(iso, { status: (ev.target.value || undefined) as Status | undefined })}
                  >
                    <option value="">-</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className={`${td} w-[100px]`}>
                  <TimeInput
                    className={`${cellInput} w-full`}
                    id={id('masuk')}
                    aria-label={`Jam masuk ${d}`}
                    value={c.masuk !== null ? fmt(c.masuk) : ''}
                    data-ov={e.masuk !== undefined ? '1' : ''}
                    onChange={(v) => onPatch(iso, { masuk: v === '' ? '-' : v })}
                  />
                </td>
                <td className={`${td} w-[100px]`}>
                  <TimeInput
                    className={`${cellInput} w-full`}
                    id={id('pulang')}
                    aria-label={`Jam pulang ${d}`}
                    value={c.pulang !== null ? fmt(c.pulang) : ''}
                    data-ov={e.pulang !== undefined ? '1' : ''}
                    onChange={(v) => onPatch(iso, { pulang: v === '' ? '-' : v })}
                  />
                </td>
                <td className={`${td} w-[84px]`}>
                  <input
                    className={`${cellInput} w-full`}
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
                <td className={`${td} w-[156px] whitespace-nowrap`}>
                  <div className="flex items-center gap-1">
                    <input
                      className={`${cellInput} w-[76px]`}
                      id={id('lembur')}
                      type="number"
                      min={0}
                      step={1}
                      aria-label={`Menit lembur ${d}`}
                      value={e.lembur ?? ''}
                      onChange={(ev) => onPatch(iso, { lembur: ev.target.value === '' ? undefined : Number(ev.target.value) })}
                    />
                    {c.saran > 0 && c.pulang !== null && (
                      <button
                        type="button"
                        className={saran}
                        title={`Pulang ${fmt(c.pulang)}. Pakai ${c.saran} menit lembur (dari ${cfg.lemburMulai})`}
                        onClick={() => onPatch(iso, { lembur: c.saran })}
                      >
                        +{c.saran}
                      </button>
                    )}
                  </div>
                </td>
                <td className={`${td} w-[84px]`}>
                  <input
                    className={`${cellInput} w-full`}
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
                <td className={td}>
                  <input
                    className={`${cellInput} w-full`}
                    id={id('note')}
                    type="text"
                    autoComplete="off"
                    aria-label={`Keterangan ${d}`}
                    value={c.note}
                    placeholder={c.missing ? 'Isi alasan: izin, sakit, proyek...' : ''}
                    onChange={(ev) => onPatch(iso, { note: ev.target.value })}
                  />
                </td>
                <td className={`${td} w-[58px] text-right whitespace-nowrap`}>
                  {hasOverride && (
                    <button
                      type="button"
                      className={actBtn}
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
                    <button
                      type="button"
                      className={actBtn}
                      title="Hapus baris manual"
                      aria-label={`Hapus baris ${d}`}
                      onClick={() => onRemove(iso)}
                    >
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
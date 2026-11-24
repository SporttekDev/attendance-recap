'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import AddRowPanel from '@/components/AddRowPanel';
import AttendanceTable from '@/components/AttendanceTable';
import DownloadPanel from '@/components/DownloadPanel';
import IdentityPanel from '@/components/IdentityPanel';
import RulesPanel from '@/components/RulesPanel';
import Stats from '@/components/Stats';
import { applyPatch, buildRows, bulanText, summarize } from '@/lib/attendance';
import { idDate, titleCase } from '@/lib/date';
import { buildEmployees, periodOf } from '@/lib/parse';
import { downloadPdf } from '@/lib/pdf';
import { downloadXlsx } from '@/lib/xlsx';
import { readExcelRows } from '@/lib/readExcel';
import { createSample } from '@/lib/sample';
import { loadCfg, loadEdits, loadNames, saveCfg, saveEdits, saveName } from '@/lib/storage';
import type { Config, Ctx, Edit, Employee, Period, Status } from '@/lib/types';
import { btnLg, btnPrimaryLg, page } from '@/lib/ui';

const DEFAULT_CFG: Config = { masuk: '08:00', tol: 10, lemburMulai: '17:00', lemburBatas: '18:30' };

const BANNER_CLS = {
  info: 'border-line bg-accent-soft',
  warn: 'border-transparent bg-warn-soft text-warn',
  err: 'border-transparent bg-bad-soft text-bad',
} as const;

const HERO_STEPS = ['Unggah', 'Lengkapi', 'Unduh PDF'];

interface BannerState {
  text: string;
  kind: 'info' | 'warn' | 'err';
}

function initialState() {
  const sample = createSample();
  return { emps: [sample], period: periodOf([sample]) };
}

export default function AbsenApp() {
  const [init] = useState(initialState);
  const [emps, setEmps] = useState<Employee[]>(init.emps);
  const [cur, setCur] = useState(0);
  const [period, setPeriod] = useState<Period>(init.period);
  const [cfg, setCfg] = useState<Config>(DEFAULT_CFG);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [bulan, setBulan] = useState('');
  const [banner, setBanner] = useState<BannerState | null>({
    text: 'Ini data contoh. Unggah file Excel dari mesin untuk memakai data Anda.',
    kind: 'warn',
  });
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [flashIso, setFlashIso] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const emp = emps[cur] ?? emps[0];
  const ctx: Ctx = useMemo(() => ({ cfg, holidays, period }), [cfg, holidays, period]);
  const rows = useMemo(() => buildRows(emp, ctx), [emp, ctx]);
  const totals = useMemo(() => summarize(rows), [rows]);
  const bulanLabel = bulanText(period, bulan);

  /* Muat pengaturan tersimpan sekali saat halaman dibuka. */
  useEffect(() => {
    const saved = loadCfg();
    if (saved) {
      setCfg({ ...DEFAULT_CFG, ...saved.cfg, tol: DEFAULT_CFG.tol });
      setHolidays(saved.holidays ?? []);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCfg({ cfg, holidays });
  }, [cfg, holidays, ready]);

  useEffect(() => {
    if (!ready) return;
    for (const e of emps) {
      if (e.sample) continue;
      saveEdits(e.key, e.edits);
      saveName(e.key, e.full);
    }
  }, [emps, ready]);

  /* Sorot dan gulir ke baris tertentu. */
  useEffect(() => {
    if (!flashIso) return;
    const tr = document.getElementById(`row-${flashIso}`);
    tr?.scrollIntoView({ block: 'center' });
    tr?.querySelector('select')?.focus();
    const t = setTimeout(() => setFlashIso(null), 1600);
    return () => clearTimeout(t);
  }, [flashIso]);

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  };

  const updateEmp = (fn: (e: Employee) => Employee) =>
    setEmps((prev) => prev.map((e, i) => (i === cur ? fn(e) : e)));

  const patch = (iso: string, p: Partial<Edit>) => updateEmp((e) => ({ ...e, edits: applyPatch(e.edits, iso, p) }));

  const removeRow = (iso: string) =>
    updateEmp((e) => {
      const edits = { ...e.edits };
      delete edits[iso];
      return { ...e, edits };
    });

  const addRow = (iso: string, status: Status | undefined) => {
    if (rows.some((r) => r.iso === iso)) {
      showToast('Tanggal itu sudah ada di tabel. Ubah barisnya langsung.');
    } else {
      patch(iso, { manual: true, status });
    }
    setFlashIso(iso);
  };

  const goMissing = () => {
    const first = rows.find((r) => r.c.missing);
    if (first) setFlashIso(first.iso);
  };

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const data = await readExcelRows(file);
      const res = buildEmployees(data, { names: loadNames(), loadEdits });
      const p = periodOf(res.employees);
      setEmps(res.employees);
      setCur(0);
      setPeriod(p);
      setBulan('');
      setBanner({
        text: `Dimuat dari ${file.name}: ${res.employees.length} karyawan, ${res.scanCount} scan, periode ${idDate(p.start)} sampai ${idDate(p.end)}.`,
        kind: 'info',
      });
    } catch (err) {
      setBanner({ text: `Gagal membaca file: ${err instanceof Error ? err.message : String(err)}`, kind: 'err' });
    }
  }

  async function download(kind: 'pdf' | 'xlsx', list: Employee[], name: string) {
    setBusy(true);
    const label = kind === 'pdf' ? 'PDF' : 'Excel';
    try {
      if (kind === 'pdf') await downloadPdf(list, ctx, bulan, `${name}.pdf`);
      else await downloadXlsx(list, ctx, bulan, `${name}.xlsx`);
      showToast(`${label} diunduh.`);
    } catch (err) {
      showToast(`Gagal membuat ${label}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className={page} onDragOver={onDragOver} onDragLeave={() => setDragOver(false)} onDrop={onDrop}>
      <section className="grid grid-cols-1 items-stretch gap-7 pt-6 pb-4 min-[861px]:grid-cols-2 min-[861px]:gap-12">
        <div className="flex min-w-0 flex-col justify-center gap-[22px]">
          <span className="self-start rounded-full border border-line px-3 py-[5px] text-xs font-medium tracking-[0.04em] text-muted uppercase">
            Sistem rekap absensi
          </span>
          <h1 className="text-[clamp(34px,5.2vw,58px)] leading-[1.06] font-bold tracking-[-0.045em]">
            Rekap absensi bulanan, tanpa hitung manual.
          </h1>
          <p className="max-w-[56ch] text-lg leading-[1.6] text-muted">
            Unggah Excel dari mesin sidik jari. Telat, lembur, izin, sakit, dan proyek dihitung lalu dirapikan menjadi PDF
            siap kirim.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnPrimaryLg} onClick={() => fileRef.current?.click()}>
              Unggah file Excel <span aria-hidden="true">→</span>
            </button>
            <Link className={btnLg} href="/panduan">
              Baca panduan
            </Link>
          </div>
        </div>
        <label
          className={`relative isolate flex min-h-[260px] cursor-pointer flex-col justify-center gap-3 overflow-hidden rounded-[20px] bg-primary p-7 text-white before:absolute before:inset-3.5 before:-z-10 before:rounded-xl before:border-[1.5px] before:border-dashed before:transition-colors before:content-[''] hover:before:border-white/75 hover:before:bg-white/5 focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-primary min-[861px]:min-h-[340px] min-[861px]:p-9 ${dragOver ? 'before:border-white/75 before:bg-white/5' : 'before:border-white/30'
            }`}
        >
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <span className="text-[26px] leading-[1.15] font-bold tracking-[-0.03em]">Tarik file Excel ke sini</span>
          <span className="text-white/70">atau klik untuk memilih file</span>
          <span className="flex gap-1.5">
            {['.xlsx', '.xls', '.csv'].map((ext) => (
              <span key={ext} className="rounded-full border border-white/30 px-2.5 py-0.5 text-xs">
                {ext}
              </span>
            ))}
          </span>
          <ol className="mt-[18px] flex list-none flex-wrap gap-[18px] font-medium text-white/85">
            {HERO_STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="inline-flex size-[22px] items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </label>
      </section>

      {banner && (
        <div className={`rounded-[10px] border px-3.5 py-2.5 ${BANNER_CLS[banner.kind]}`} role="status">
          {banner.text}
        </div>
      )}

      <IdentityPanel
        emps={emps}
        cur={cur}
        onCur={setCur}
        full={emp.full}
        onFull={(v) => updateEmp((e) => ({ ...e, full: v }))}
        bulan={bulan}
        bulanPlaceholder={bulanLabel}
        onBulan={setBulan}
        period={period}
        onPeriod={setPeriod}
      />

      <RulesPanel cfg={cfg} onCfg={setCfg} holidays={holidays} onHolidays={setHolidays} />

      <Stats t={totals} onGoMissing={goMissing} />

      <AttendanceTable rows={rows} cfg={cfg} flashIso={flashIso} onPatch={patch} onRemove={removeRow} />

      <div className="flex flex-wrap items-stretch justify-between gap-4">
        <AddRowPanel onAdd={addRow} />
        <DownloadPanel
          count={emps.length}
          missing={totals.missing}
          busy={busy}
          onPdf={() => void download('pdf', [emp], `${titleCase(emp.full)} - ${titleCase(bulanLabel)}`)}
          onPdfAll={() => void download('pdf', emps, `Absen - ${titleCase(bulanLabel)}`)}
          onExcel={() => void download('xlsx', [emp], `${titleCase(emp.full)} - ${titleCase(bulanLabel)}`)}
          onExcelAll={() => void download('xlsx', emps, `Absen - ${titleCase(bulanLabel)}`)}
        />
      </div>

      {toast && (
        <div
          className="fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-1/2 z-20 max-w-[90vw] -translate-x-1/2 rounded-[10px] bg-primary px-[18px] py-2.5 text-[13px] font-medium text-white"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
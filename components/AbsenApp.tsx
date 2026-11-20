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
import { readExcelRows } from '@/lib/readExcel';
import { createSample } from '@/lib/sample';
import { loadCfg, loadEdits, loadNames, saveCfg, saveEdits, saveName } from '@/lib/storage';
import type { Config, Ctx, Edit, Employee, Period, Status } from '@/lib/types';

const DEFAULT_CFG: Config = { masuk: '08:00', tol: 10, lemburMulai: '17:30', lemburBatas: '18:30' };

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
      setCfg({ ...DEFAULT_CFG, ...saved.cfg });
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

  async function download(list: Employee[], filename: string) {
    setBusy(true);
    try {
      await downloadPdf(list, ctx, bulan, filename);
      showToast('PDF diunduh.');
    } catch (err) {
      showToast(`Gagal membuat PDF: ${err instanceof Error ? err.message : String(err)}`);
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
    <div className="wrap" onDragOver={onDragOver} onDragLeave={() => setDragOver(false)} onDrop={onDrop}>
      <section className="hero">
        <div className="hero-text">
          <span className="pill">Sistem rekap absensi</span>
          <h1>Rekap absensi bulanan, tanpa hitung manual.</h1>
          <p className="lead">
            Unggah Excel dari mesin sidik jari. Telat, lembur, izin, sakit, dan proyek dihitung lalu dirapikan menjadi PDF
            siap kirim.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn primary lg" onClick={() => fileRef.current?.click()}>
              Unggah file Excel <span aria-hidden="true">→</span>
            </button>
            <Link className="btn lg" href="/panduan">
              Baca panduan
            </Link>
          </div>
        </div>
        <label className={`hero-card${dragOver ? ' over' : ''}`}>
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
          <span className="hc-title">Tarik file Excel ke sini</span>
          <span className="hc-sub">atau klik untuk memilih file</span>
          <span className="hc-tags">
            <span>.xlsx</span>
            <span>.xls</span>
            <span>.csv</span>
          </span>
          <ol className="hc-steps">
            <li>Unggah</li>
            <li>Lengkapi</li>
            <li>Unduh PDF</li>
          </ol>
        </label>
      </section>

      {banner && (
        <div className={`banner ${banner.kind === 'info' ? '' : banner.kind}`} role="status">
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

      <div className="bottom">
        <AddRowPanel onAdd={addRow} />
        <DownloadPanel
          count={emps.length}
          missing={totals.missing}
          busy={busy}
          onOne={() => void download([emp], `${titleCase(emp.full)} - ${titleCase(bulanLabel)}.pdf`)}
          onAll={() => void download(emps, `Absen - ${titleCase(bulanLabel)}.pdf`)}
        />
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

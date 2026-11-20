'use client';

interface Props {
  count: number;
  missing: number;
  busy: boolean;
  onOne: () => void;
  onAll: () => void;
}

export default function DownloadPanel({ count, missing, busy, onOne, onAll }: Props) {
  return (
    <section className="panel">
      <h2>Unduh</h2>
      <p className="note" style={{ margin: '4px 0 10px' }}>
        {missing > 0
          ? `${missing} hari kerja masih kosong. Isi status atau keterangannya sebelum mengunduh.`
          : 'PDF memakai tata letak A4 landscape seperti contoh Anda.'}
      </p>
      <div className="dl">
        <button className="btn primary" type="button" disabled={busy} onClick={onOne}>
          {busy ? 'Membuat PDF...' : 'Unduh PDF'}
        </button>
        {count > 1 && (
          <button className="btn" type="button" disabled={busy} onClick={onAll}>
            Unduh semua ({count} orang) dalam 1 PDF
          </button>
        )}
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { gutter, link, panel, saran } from '@/lib/ui';

export const metadata: Metadata = {
  title: 'Panduan | Rekap Absensi',
  description: 'Cara memakai Rekap Absensi: dari unggah Excel sampai unduh PDF.',
};

const TOC: [string, string][] = [
  ['mulai', 'Mulai cepat'],
  ['legenda', 'Arti warna dan tanda'],
  ['aturan', 'Aturan hitung'],
  ['kasus', 'Kasus yang sering muncul'],
  ['faq', 'Pertanyaan umum'],
];

const STEPS: [string, string][] = [
  [
    'Unggah file Excel dari mesin',
    'Klik Unggah file Excel di kanan atas, atau tarik file ke halaman. File harus punya kolom Departemen, Nama, No.ID, dan Tgl/Waktu (satu baris per scan). Sheet pertama yang dibaca. Format .xlsx, .xls, dan .csv diterima.',
  ],
  [
    'Periksa nama, bulan, dan periode',
    'Periode terisi otomatis dari scan paling awal sampai paling akhir. Judul PDF mengambil bulan dari tanggal akhir periode, jadi periode 21 September sampai 20 Oktober berjudul OKTOBER. Nama di PDF bisa diganti dengan nama lengkap, dan akan diingat untuk bulan berikutnya.',
  ],
  [
    'Baca tabelnya',
    'Setiap baris adalah satu hari. Jam masuk adalah scan paling awal, jam pulang scan paling akhir. Menit telat sudah dihitung. Baris merah muda berarti hari kerja yang belum ada keterangan, lihat bagian Arti warna dan tanda di bawah.',
  ],
  [
    'Lengkapi yang tidak ada di Excel',
    'Pilih status (izin, sakit, proyek, dan lainnya) dan isi keterangan di barisnya. Untuk tanggal yang belum tampil, pakai Tambah baris manual di bawah tabel. Lembur diisi sendiri, dibantu tombol saran.',
  ],
  [
    'Sesuaikan aturan bila perlu',
    'Buka Aturan hitung dan tanggal merah untuk mengubah jam masuk, jam lembur, dan mendaftarkan tanggal merah. Toleransi telat dikunci di 10 menit. Perubahan langsung menghitung ulang tabel.',
  ],
  [
    'Unduh PDF atau Excel',
    'Pastikan kartu merah Hari kerja belum ada keterangan sudah hilang, lalu klik Unduh PDF. Butuh versi yang bisa diedit? Klik Unduh Excel untuk mendapat tabel yang sama. Jika file Excel berisi beberapa karyawan, pilih karyawan di bagian atas, atau unduh semuanya dalam satu file (di Excel, satu sheet per orang).',
  ],
];

const RULES: [string, string][] = [
  [
    'Jam masuk dan pulang',
    'Scan paling awal dan paling akhir di hari itu. Satu scan sebelum jam 12:00 menjadi jam masuk, satu scan setelah jam 12:00 menjadi jam pulang. Jam pulang yang kosong tampil sebagai tanda minus (-) di PDF.',
  ],
  [
    'Menit telat',
    'Jam masuk dikurangi batas telat. Batas telat adalah jam masuk resmi ditambah toleransi, awalnya 08:00 + 10 menit = 08:10. Contoh: masuk 08:25 telat 15 menit, masuk 08:10 tidak telat. Tidak dihitung di Sabtu, Minggu, dan tanggal merah.',
  ],
  [
    'Menit lembur',
    'Selalu diisi manual, tidak pernah otomatis, karena ada yang sengaja pulang lebih lambat tanpa lembur. Jika pulang melewati 18:30, tombol saran muncul. Contoh: pulang 18:54 disarankan 114 menit (18:54 dikurangi 17:00).',
  ],
  [
    'Hari lembur',
    'Otomatis 1 untuk setiap scan di Sabtu, Minggu, atau tanggal merah, kecuali statusnya Proyek. Kerja setengah hari bisa diisi 0,5 langsung di kolomnya.',
  ],
  [
    'Status dan keterangan',
    'Status: Izin, Sakit, Cuti, Proyek, Alpha, Libur. Di PDF tampil sebagai status diikuti catatan, misalnya Izin: acara keluarga. Khusus Proyek, yang tampil hanya catatannya, misalnya nama event.',
  ],
  [
    'Baris yang tampil',
    'Semua hari kerja dalam periode, ditambah hari libur yang punya scan, ditambah baris manual. Sabtu atau Minggu tanpa scan tidak tampil sampai Anda menambahnya.',
  ],
];

const FAQ: [string, string][] = [
  ['Apakah file absensi saya dikirim ke server?', 'Tidak. File dibaca dan PDF dibuat di browser Anda. Tidak ada data yang diunggah ke mana pun.'],
  [
    'Di mana isian saya disimpan?',
    'Di browser yang Anda pakai, per karyawan. Jika Anda mengunggah Excel yang sama lagi, isian izin, sakit, dan lembur muncul kembali. Isian tidak berpindah ke komputer lain, dan hilang jika data situs di browser dihapus.',
  ],
  [
    'Kenapa lembur tidak terisi sendiri?',
    'Sengaja dibuat manual. Pulang lebih lambat belum tentu lembur, jadi aplikasi hanya memberi saran dan Anda yang memutuskan.',
  ],
  [
    'Bagaimana cara mengetik jam?',
    'Jam memakai format 24 jam. Ketik 0830, 8:30, atau 08.30, semuanya menjadi 08:30. Jam sore ditulis 17:30, bukan 5:30 PM. Ketikan yang bukan jam, misalnya 25:00, ditandai merah dan tidak disimpan. Tekan Enter atau pindah kolom untuk menyimpan.',
  ],
  [
    'Apa isi file Excel yang diunduh?',
    'Tabel yang sama dengan PDF: judul bulan dan nama, kolom No sampai Keterangan, dan baris TOTAL di bawahnya. Angka nol dikosongkan seperti di PDF. Isinya angka biasa, bukan rumus, jadi total tidak berubah kalau Anda mengedit angka di Excel.',
  ],
  [
    'Kenapa jam pulang di suatu hari kosong?',
    'Mesin hanya mencatat satu scan hari itu. Kalau seharusnya ada, isi jam pulangnya sendiri di kolom itu.',
  ],
  [
    'Karyawan saya masuk tiap Sabtu. Kenapa dihitung hari lembur?',
    'Saat ini Sabtu selalu dianggap hari libur. Untuk sementara, ketik 0 di kolom Hari lembur pada hari-hari itu. Pengaturan hari kerja per minggu belum tersedia.',
  ],
  [
    'Bagaimana mencatat izin setengah hari atau pulang cepat?',
    'Belum ada kolom khusus. Tulis di keterangan, misalnya Izin: pulang jam 13:00, dan sesuaikan menit telat bila perlu.',
  ],
  [
    'Scan lewat tengah malam masuk ke tanggal mana?',
    'Ke tanggal berikutnya, sesuai jam di mesin. Jika ada yang pulang lewat tengah malam, isi jam pulangnya manual di baris hari sebelumnya.',
  ],
  [
    'Data contoh di halaman utama itu data siapa?',
    'Data contoh hanya untuk memperlihatkan cara kerja halaman. Datanya hilang begitu Anda mengunggah file Excel sendiri.',
  ],
];

const section = `${panel} scroll-mt-[88px]`;
const sectionH2 = 'mb-2.5 text-xl font-bold tracking-[-0.03em]';
const th = 'border-b border-line px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-muted';
const td = 'border-b border-line-soft px-3 py-2.5 align-top';
const swatch = 'inline-flex h-[26px] w-[72px] items-center justify-center rounded-lg border border-line text-xs';

function P({ children }: { children: ReactNode }) {
  return <p className="mb-2 max-w-[70ch]">{children}</p>;
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-[18px] mb-1 text-sm font-bold tracking-[-0.01em]">{children}</h3>;
}

function Legend({ mark, children }: { mark: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3.5 border-b border-line-soft py-[9px] last:border-b-0">
      <span className="flex flex-[0_0_84px] justify-center">{mark}</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function BackLink() {
  return (
    <Link href="/" className={link}>
      ← Kembali ke Rekap Absensi
    </Link>
  );
}

export default function PanduanPage() {
  return (
    <div className={`${gutter} flex max-w-[940px] flex-col gap-[22px] pt-2 pb-[72px]`}>
      <header>
        <p className="mb-2">
          <BackLink />
        </p>
        <h1 className="text-[clamp(30px,4.4vw,44px)] leading-[1.06] font-bold tracking-[-0.045em]">Panduan pemakaian</h1>
        <p className="mt-1.5 text-muted">Dari file Excel mesin sidik jari sampai PDF absen bulanan, dalam enam langkah.</p>
      </header>

      <nav aria-label="Isi panduan">
        <ul className="flex list-none flex-wrap gap-x-[18px] gap-y-1.5 p-0">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a className={link} href={`#${id}`}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="mulai" className={section}>
        <h2 className={sectionH2}>Mulai cepat</h2>
        <ol className="flex list-none flex-col gap-3.5 p-0">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="grid grid-cols-[28px_1fr] gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
                {i + 1}
              </span>
              <div>
                <strong className="mb-0.5 block">{title}</strong>
                <p className="max-w-[70ch] text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="legenda" className={section}>
        <h2 className={sectionH2}>Arti warna dan tanda</h2>
        <ul className="list-none p-0">
          <Legend mark={<span className={`${swatch} bg-off`} aria-hidden="true" />}>
            Baris abu-abu: Sabtu, Minggu, atau tanggal merah. Menit telat tidak dihitung di hari ini.
          </Legend>
          <Legend mark={<span className={`${swatch} bg-bad-soft`} aria-hidden="true" />}>
            Baris merah muda: hari kerja tanpa scan dan tanpa keterangan. Isi status atau keterangannya, misalnya izin atau
            sakit. Kartu merah di ringkasan menghitung baris seperti ini, dan bisa diklik untuk lompat ke baris pertama.
          </Legend>
          <Legend mark={<span className={`${swatch} border-primary bg-accent-soft`} aria-hidden="true">08:30</span>}>
            Jam berlatar toska: jam yang sudah Anda ubah sendiri, bukan dari mesin.
          </Legend>
          <Legend mark={<span className="text-auto tabular-nums">15</span>}>
            Angka abu-abu di kolom Telat atau Hari lembur: hitungan otomatis. Kalau Anda mengetik angka sendiri, angkanya
            menjadi hitam dan dipakai sebagai gantinya.
          </Legend>
          <Legend mark={<span className={saran}>+114</span>}>
            Tombol saran lembur. Muncul di kolom Lembur jika pulang melewati jam batas (awalnya 18:30). Satu klik mengisi
            menit lembur dihitung dari 17:00.
          </Legend>
          <Legend mark={<span className="text-lg" aria-hidden="true">↺</span>}>
            Kembalikan baris itu ke hitungan otomatis (jam, telat, lembur, dan hari lembur). Keterangan dan status tidak
            ikut terhapus.
          </Legend>
          <Legend mark={<span className="text-lg" aria-hidden="true">×</span>}>
            Hapus baris. Hanya ada di baris yang Anda tambah manual.
          </Legend>
        </ul>
      </section>

      <section id="aturan" className={section}>
        <h2 className={sectionH2}>Aturan hitung</h2>
        <div className="mt-1.5 mb-2.5 overflow-x-auto rounded-[14px] border border-line bg-white">
          <table className="w-full border-collapse tabular-nums">
            <thead>
              <tr>
                <th className={th}>Hal</th>
                <th className={th}>Aturan</th>
              </tr>
            </thead>
            <tbody className="[&>tr:last-child>td]:border-b-0">
              {RULES.map(([what, rule]) => (
                <tr key={what}>
                  <td className={td}>{what}</td>
                  <td className={td}>{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="kasus" className={section}>
        <h2 className={sectionH2}>Kasus yang sering muncul</h2>

        <H3>Izin atau sakit</H3>
        <P>
          Cari barisnya (hari kerja tanpa scan sudah ada dan berwarna merah muda), pilih Izin atau Sakit di kolom Status,
          lalu isi keterangan. Jika tanggalnya tidak tampil, tambahkan lewat Tambah baris manual.
        </P>

        <H3>Proyek di luar kantor</H3>
        <P>
          Pilih status Proyek dan tulis nama proyeknya di keterangan, misalnya dengan catatan dibayar proyek. Hari proyek
          tidak dihitung sebagai hari lembur, bahkan jika jatuh di Sabtu atau Minggu. Jika tanggalnya akhir pekan, tambah
          dulu barisnya lewat Tambah baris manual.
        </P>

        <H3>Lembur di hari kerja</H3>
        <P>
          Klik tombol saran di kolom Lembur, atau ketik menitnya sendiri. Isi keterangan pekerjaannya supaya tercatat di
          PDF.
        </P>

        <H3>Kerja di Sabtu, Minggu, atau tanggal merah</H3>
        <ul className="mb-2 max-w-[70ch] list-disc pl-5">
          <li className="my-0.5">Jika ada scan di mesin: baris muncul sendiri dan hari lembur otomatis 1.</li>
          <li className="my-0.5">
            Jika tidak scan: tambahkan barisnya, lalu isi jam masuk dan jam pulang (hari lembur otomatis 1), atau ketik 1
            langsung di kolom Hari lembur.
          </li>
        </ul>

        <H3>Lupa scan atau mesin salah catat</H3>
        <P>
          Ubah jam masuk atau jam pulang langsung di kolomnya. Mengosongkan jam menjadikannya tanda minus (-). Tombol ↺
          mengembalikan jam ke hasil mesin.
        </P>

        <H3>Tanggal merah di hari kerja</H3>
        <P>
          Buka Aturan hitung dan tanggal merah, pilih tanggalnya, lalu klik Tambah. Hari itu menjadi libur: barisnya
          hilang jika tidak ada scan, dan dihitung hari lembur jika ada scan.
        </P>

        <H3>Beberapa karyawan dalam satu file</H3>
        <P>
          Pilih karyawan dari daftar Karyawan di bagian atas. Isian setiap orang terpisah. Tombol Unduh semua
          menggabungkan semuanya dalam satu PDF, satu bagian per orang.
        </P>
      </section>

      <section id="faq" className={section}>
        <h2 className={sectionH2}>Pertanyaan umum</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} className="border-b border-line-soft py-2.5 last:border-b-0">
            <summary className="font-medium">{q}</summary>
            <p className="mt-2 max-w-[70ch] text-muted">{a}</p>
          </details>
        ))}
      </section>

      <p>
        <BackLink />
      </p>
    </div>
  );
}
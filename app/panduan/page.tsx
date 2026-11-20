import type { Metadata } from 'next';
import Link from 'next/link';

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

export default function PanduanPage() {
  return (
    <div className="wrap guide">
      <header>
        <p style={{ margin: '0 0 8px' }}>
          <Link href="/">← Kembali ke Rekap Absensi</Link>
        </p>
        <h1>Panduan pemakaian</h1>
        <p className="sub">Dari file Excel mesin sidik jari sampai PDF absen bulanan, dalam enam langkah.</p>
      </header>

      <nav aria-label="Isi panduan">
        <ul className="toc">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="mulai" className="panel">
        <h2>Mulai cepat</h2>
        <ol className="steps">
          <li>
            <div>
              <strong>Unggah file Excel dari mesin</strong>
              <p>
                Klik Unggah file Excel di kanan atas, atau tarik file ke halaman. File harus punya kolom Departemen, Nama,
                No.ID, dan Tgl/Waktu (satu baris per scan). Sheet pertama yang dibaca. Format .xlsx, .xls, dan .csv
                diterima.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Periksa nama, bulan, dan periode</strong>
              <p>
                Periode terisi otomatis dari scan paling awal sampai paling akhir. Judul PDF mengambil bulan dari tanggal
                akhir periode, jadi periode 21 September sampai 20 Oktober berjudul OKTOBER. Nama di PDF bisa diganti
                dengan nama lengkap, dan akan diingat untuk bulan berikutnya.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Baca tabelnya</strong>
              <p>
                Setiap baris adalah satu hari. Jam masuk adalah scan paling awal, jam pulang scan paling akhir. Menit telat
                sudah dihitung. Baris merah muda berarti hari kerja yang belum ada keterangan, lihat bagian Arti warna dan
                tanda di bawah.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Lengkapi yang tidak ada di Excel</strong>
              <p>
                Pilih status (izin, sakit, proyek, dan lainnya) dan isi keterangan di barisnya. Untuk tanggal yang belum
                tampil, pakai Tambah baris manual di bawah tabel. Lembur diisi sendiri, dibantu tombol saran.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Sesuaikan aturan bila perlu</strong>
              <p>
                Buka Aturan hitung dan tanggal merah untuk mengubah jam masuk, toleransi, jam lembur, dan mendaftarkan
                tanggal merah. Perubahan langsung menghitung ulang tabel.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Unduh PDF</strong>
              <p>
                Pastikan kartu merah Hari kerja belum ada keterangan sudah hilang, lalu klik Unduh PDF. Jika file Excel
                berisi beberapa karyawan, pilih karyawan di bagian atas, atau unduh semuanya dalam satu PDF.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section id="legenda" className="panel">
        <h2>Arti warna dan tanda</h2>
        <ul className="legend">
          <li>
            <span className="mark"><span className="sw sw-off" aria-hidden="true" /></span>
            <span className="what">Baris abu-abu: Sabtu, Minggu, atau tanggal merah. Menit telat tidak dihitung di hari ini.</span>
          </li>
          <li>
            <span className="mark"><span className="sw sw-miss" aria-hidden="true" /></span>
            <span className="what">
              Baris merah muda: hari kerja tanpa scan dan tanpa keterangan. Isi status atau keterangannya, misalnya izin
              atau sakit. Kartu merah di ringkasan menghitung baris seperti ini, dan bisa diklik untuk lompat ke baris
              pertama.
            </span>
          </li>
          <li>
            <span className="mark"><span className="sw sw-ov" aria-hidden="true">08:30</span></span>
            <span className="what">Jam berlatar toska: jam yang sudah Anda ubah sendiri, bukan dari mesin.</span>
          </li>
          <li>
            <span className="mark"><span className="ph">15</span></span>
            <span className="what">
              Angka abu-abu di kolom Telat atau Hari lembur: hitungan otomatis. Kalau Anda mengetik angka sendiri, angkanya
              menjadi hitam dan dipakai sebagai gantinya.
            </span>
          </li>
          <li>
            <span className="mark"><span className="saran">+84</span></span>
            <span className="what">
              Tombol saran lembur. Muncul di kolom Lembur jika pulang melewati jam batas (awalnya 18:30). Satu klik mengisi
              menit lembur dihitung dari 17:30.
            </span>
          </li>
          <li>
            <span className="mark"><span aria-hidden="true" style={{ fontSize: 18 }}>↺</span></span>
            <span className="what">
              Kembalikan baris itu ke hitungan otomatis (jam, telat, lembur, dan hari lembur). Keterangan dan status tidak
              ikut terhapus.
            </span>
          </li>
          <li>
            <span className="mark"><span aria-hidden="true" style={{ fontSize: 18 }}>×</span></span>
            <span className="what">Hapus baris. Hanya ada di baris yang Anda tambah manual.</span>
          </li>
        </ul>
      </section>

      <section id="aturan" className="panel">
        <h2>Aturan hitung</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Hal</th><th>Aturan</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Jam masuk dan pulang</td>
                <td>
                  Scan paling awal dan paling akhir di hari itu. Satu scan sebelum jam 12:00 menjadi jam masuk, satu scan
                  setelah jam 12:00 menjadi jam pulang. Jam pulang yang kosong tampil sebagai tanda minus (-) di PDF.
                </td>
              </tr>
              <tr>
                <td>Menit telat</td>
                <td>
                  Jam masuk dikurangi batas telat. Batas telat adalah jam masuk resmi ditambah toleransi, awalnya 08:00 +
                  10 menit = 08:10. Contoh: masuk 08:25 telat 15 menit, masuk 08:10 tidak telat. Tidak dihitung di
                  Sabtu, Minggu, dan tanggal merah.
                </td>
              </tr>
              <tr>
                <td>Menit lembur</td>
                <td>
                  Selalu diisi manual, tidak pernah otomatis, karena ada yang sengaja pulang lebih lambat tanpa lembur.
                  Jika pulang melewati 18:30, tombol saran muncul. Contoh: pulang 18:54 disarankan 84 menit (18:54
                  dikurangi 17:30).
                </td>
              </tr>
              <tr>
                <td>Hari lembur</td>
                <td>
                  Otomatis 1 untuk setiap scan di Sabtu, Minggu, atau tanggal merah, kecuali statusnya Proyek. Kerja
                  setengah hari bisa diisi 0,5 langsung di kolomnya.
                </td>
              </tr>
              <tr>
                <td>Status dan keterangan</td>
                <td>
                  Status: Izin, Sakit, Cuti, Proyek, Alpha, Libur. Di PDF tampil sebagai status diikuti catatan, misalnya
                  Izin: acara keluarga. Khusus Proyek, yang tampil hanya catatannya, misalnya nama event.
                </td>
              </tr>
              <tr>
                <td>Baris yang tampil</td>
                <td>
                  Semua hari kerja dalam periode, ditambah hari libur yang punya scan, ditambah baris manual. Sabtu atau
                  Minggu tanpa scan tidak tampil sampai Anda menambahnya.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="kasus" className="panel">
        <h2>Kasus yang sering muncul</h2>

        <h3>Izin atau sakit</h3>
        <p>
          Cari barisnya (hari kerja tanpa scan sudah ada dan berwarna merah muda), pilih Izin atau Sakit di kolom Status,
          lalu isi keterangan. Jika tanggalnya tidak tampil, tambahkan lewat Tambah baris manual.
        </p>

        <h3>Proyek di luar kantor</h3>
        <p>
          Pilih status Proyek dan tulis nama proyeknya di keterangan, misalnya dengan catatan dibayar proyek. Hari proyek
          tidak dihitung sebagai hari lembur, bahkan jika jatuh di Sabtu atau Minggu. Jika tanggalnya akhir pekan, tambah
          dulu barisnya lewat Tambah baris manual.
        </p>

        <h3>Lembur di hari kerja</h3>
        <p>
          Klik tombol saran di kolom Lembur, atau ketik menitnya sendiri. Isi keterangan pekerjaannya supaya tercatat di
          PDF.
        </p>

        <h3>Kerja di Sabtu, Minggu, atau tanggal merah</h3>
        <ul className="plain">
          <li>Jika ada scan di mesin: baris muncul sendiri dan hari lembur otomatis 1.</li>
          <li>
            Jika tidak scan: tambahkan barisnya, lalu isi jam masuk dan jam pulang (hari lembur otomatis 1), atau ketik 1
            langsung di kolom Hari lembur.
          </li>
        </ul>

        <h3>Lupa scan atau mesin salah catat</h3>
        <p>
          Ubah jam masuk atau jam pulang langsung di kolomnya. Mengosongkan jam menjadikannya tanda minus (-). Tombol ↺
          mengembalikan jam ke hasil mesin.
        </p>

        <h3>Tanggal merah di hari kerja</h3>
        <p>
          Buka Aturan hitung dan tanggal merah, pilih tanggalnya, lalu klik Tambah. Hari itu menjadi libur: barisnya
          hilang jika tidak ada scan, dan dihitung hari lembur jika ada scan.
        </p>

        <h3>Beberapa karyawan dalam satu file</h3>
        <p>
          Pilih karyawan dari daftar Karyawan di bagian atas. Isian setiap orang terpisah. Tombol Unduh semua
          menggabungkan semuanya dalam satu PDF, satu bagian per orang.
        </p>
      </section>

      <section id="faq" className="panel faq">
        <h2>Pertanyaan umum</h2>

        <details>
          <summary>Apakah file absensi saya dikirim ke server?</summary>
          <p>
            Tidak. File dibaca dan PDF dibuat di browser Anda. Tidak ada data yang diunggah ke mana pun.
          </p>
        </details>
        <details>
          <summary>Di mana isian saya disimpan?</summary>
          <p>
            Di browser yang Anda pakai, per karyawan. Jika Anda mengunggah Excel yang sama lagi, isian izin, sakit, dan
            lembur muncul kembali. Isian tidak berpindah ke komputer lain, dan hilang jika data situs di browser dihapus.
          </p>
        </details>
        <details>
          <summary>Kenapa lembur tidak terisi sendiri?</summary>
          <p>
            Sengaja dibuat manual. Pulang lebih lambat belum tentu lembur, jadi aplikasi hanya memberi saran dan Anda yang
            memutuskan.
          </p>
        </details>
        <details>
          <summary>Bagaimana cara mengetik jam?</summary>
          <p>
            Jam memakai format 24 jam. Ketik 0830, 8:30, atau 08.30, semuanya menjadi 08:30. Jam sore ditulis 17:30, bukan
            5:30 PM. Ketikan yang bukan jam, misalnya 25:00, ditandai merah dan tidak disimpan. Tekan Enter atau pindah
            kolom untuk menyimpan.
          </p>
        </details>
        <details>
          <summary>Kenapa jam pulang di suatu hari kosong?</summary>
          <p>
            Mesin hanya mencatat satu scan hari itu. Kalau seharusnya ada, isi jam pulangnya sendiri di kolom itu.
          </p>
        </details>
        <details>
          <summary>Karyawan saya masuk tiap Sabtu. Kenapa dihitung hari lembur?</summary>
          <p>
            Saat ini Sabtu selalu dianggap hari libur. Untuk sementara, ketik 0 di kolom Hari lembur pada hari-hari itu.
            Pengaturan hari kerja per minggu belum tersedia.
          </p>
        </details>
        <details>
          <summary>Bagaimana mencatat izin setengah hari atau pulang cepat?</summary>
          <p>
            Belum ada kolom khusus. Tulis di keterangan, misalnya Izin: pulang jam 13:00, dan sesuaikan menit telat bila
            perlu.
          </p>
        </details>
        <details>
          <summary>Scan lewat tengah malam masuk ke tanggal mana?</summary>
          <p>
            Ke tanggal berikutnya, sesuai jam di mesin. Jika ada yang pulang lewat tengah malam, isi jam pulangnya manual
            di baris hari sebelumnya.
          </p>
        </details>
        <details>
          <summary>Data contoh di halaman utama itu data siapa?</summary>
          <p>
            Data contoh hanya untuk memperlihatkan cara kerja halaman. Datanya hilang begitu Anda mengunggah file Excel
            sendiri.
          </p>
        </details>
      </section>

      <p>
        <Link href="/">← Kembali ke Rekap Absensi</Link>
      </p>
    </div>
  );
}

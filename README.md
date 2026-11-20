# Rekap Absensi

Aplikasi Next.js untuk mengubah Excel absensi dari mesin sidik jari menjadi PDF rekap bulanan (A4 landscape). Izin, sakit, proyek, dan lembur yang tidak ada di Excel bisa ditambah sendiri di halaman.

Semua proses berjalan di browser. File Excel tidak pernah dikirim ke server mana pun, jadi data absensi tetap di komputer Anda.

## Menjalankan

Syarat: Node.js 20.9 atau lebih baru, dan koneksi internet saat `npm install` (pustaka SheetJS diunduh dari `cdn.sheetjs.com`).

```bash
npm install
npm run dev      # http://localhost:3000
```

Untuk produksi:

```bash
npm run build
npm start
```

Atau dengan Docker:

```bash
docker build -t rekap-absensi .
docker run -p 3000:3000 rekap-absensi
```

Aplikasi ini juga bisa langsung di-deploy ke Vercel tanpa pengaturan tambahan.

## Cara memakai

1. Klik **Unggah file Excel** (atau tarik file ke halaman). Format yang dibaca adalah ekspor mesin dengan kolom `Departemen`, `Nama`, `No.ID`, `Tgl/Waktu`. Sheet pertama yang dipakai.
2. Periksa periode, nama di PDF, dan bulan di judul. Periode otomatis dari scan paling awal sampai paling akhir.
3. Isi hari yang kosong. Hari kerja tanpa scan dan tanpa keterangan ditandai merah.
4. Klik **Unduh PDF**.

Halaman terbuka dengan data contoh. Data contoh hilang begitu Anda mengunggah file.

Panduan lengkap untuk pengguna ada di halaman `/panduan` (tautan "Baca panduan pemakaian" di header). Isinya ada di `app/panduan/page.tsx`; ubah di sana jika aturan hitung berubah.

## Aturan hitung

| Hal | Aturan |
| --- | --- |
| Jam masuk / pulang | Scan paling awal / paling akhir hari itu. Satu scan sebelum 12:00 jadi jam masuk, setelah 12:00 jadi jam pulang. |
| Menit telat | Jam masuk dikurangi (jam masuk resmi + toleransi). Awalnya 08:00 + 10 menit, jadi masuk 08:25 telat 15 menit. Tidak dihitung di Sabtu, Minggu, dan tanggal merah. |
| Menit lembur | Selalu manual. Jika pulang setelah 18:30, muncul tombol saran (dihitung dari 17:30). Klik untuk memakainya, atau ketik angka sendiri. |
| Hari lembur | Otomatis 1 untuk scan di Sabtu, Minggu, atau tanggal merah, kecuali statusnya Proyek. Untuk kerja akhir pekan tanpa scan, tambah baris manual lalu isi jam atau isi hari lembur langsung. |
| Status | Izin, Sakit, Cuti, Proyek, Alpha, Libur. Tampil di kolom Keterangan, misalnya `Izin: acara keluarga`. Status Proyek memakai catatannya apa adanya. |

Semua angka otomatis bisa ditimpa. Kolom yang berisi hasil timpaan diberi warna, dan tombol ↺ mengembalikannya ke hitungan otomatis. Jam masuk, toleransi, jam lembur, dan tanggal merah bisa diubah di panel **Aturan hitung dan tanggal merah**.

Perubahan dan pengaturan tersimpan di browser (localStorage), per karyawan, sehingga tetap ada saat Excel yang sama diunggah ulang. Penyimpanan ini tidak berpindah antar perangkat.

## Struktur

```
app/              halaman Next.js (App Router) dan gaya
components/       komponen antarmuka (state utama di AbsenApp.tsx)
lib/attendance.ts aturan hitung telat, lembur, hari lembur
lib/parse.ts      membaca baris Excel menjadi karyawan dan scan
lib/pdf.ts        menggambar PDF dengan jsPDF
lib/readExcel.ts  membaca file dengan SheetJS (dimuat saat dipakai)
lib/storage.ts    penyimpanan localStorage
tests/            tes aturan hitung
```

## Tes

```bash
npm test
npm run typecheck
```

Tes memeriksa aturan hitung terhadap data contoh yang cocok dengan PDF referensi (243 menit telat, 365 menit lembur, 23 baris), batas toleransi, saran lembur, hari lembur, pembacaan tanggal Excel, dan penambahan baris manual.

## Batasan yang diketahui

- Sabtu selalu dianggap hari libur, dan jam masuk berlaku sama untuk semua karyawan.
- Scan setelah tengah malam dihitung sebagai tanggal berikutnya.
- Tidak ada kolom pulang cepat atau setengah hari. Catat lewat keterangan.
- Tanggal merah diinput manual.

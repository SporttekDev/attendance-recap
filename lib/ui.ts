/**
 * Kumpulan kelas Tailwind yang dipakai berulang di banyak komponen.
 * Ubah di sini sekali, tampilannya ikut berubah di semua tempat.
 * Warna (primary, muted, line, dst.) berasal dari @theme di app/globals.css.
 */

/** Lebar isi halaman dengan jarak aman di sisi kiri dan kanan (termasuk notch ponsel). */
export const gutter = 'mx-auto w-full pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]';

/** Kerangka halaman utama. */
export const page = `${gutter} flex max-w-[1220px] flex-col gap-4 pt-2 pb-[72px]`;

/** Kartu putih berbingkai. */
export const panel = 'rounded-[14px] border border-line bg-white px-[18px] py-4';

export const h2 = 'text-base font-bold tracking-[-0.02em]';
export const hint = 'max-w-[80ch] text-xs text-muted';

/** Satu kolom isian: label di atas, kontrol di bawah. */
export const field = 'flex min-w-0 flex-col gap-1';
export const label = 'text-xs font-medium tracking-[0.02em] text-muted';
/** Susunan kolom isian yang otomatis turun baris di layar sempit. */
export const autoGrid = 'grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-x-4 gap-y-3';
/** Baris isian + tombol yang sejajar di bagian bawah. */
export const inlineRow = 'flex flex-wrap items-end gap-2';
export const inlineField = 'flex min-w-0 flex-[0_1_190px] flex-col gap-1';

/** Input, select, dan date di luar tabel. */
export const input =
    'h-9 w-full min-w-0 rounded-lg border border-line bg-white px-2.5 aria-invalid:border-bad aria-invalid:bg-bad-soft';

/** Input di dalam tabel: tanpa bingkai sampai disorot atau diklik. */
export const cellInput =
    'h-[30px] min-w-0 rounded-lg border border-transparent bg-transparent px-2.5 hover:border-line focus:border-primary focus:bg-white data-[ov=1]:border-primary data-[ov=1]:bg-accent-soft aria-invalid:border-bad aria-invalid:bg-bad-soft';

const btnBase =
    'inline-flex items-center justify-center gap-2 rounded-lg border font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const btn = `${btnBase} h-9 border-line bg-white px-3.5 text-ink hover:bg-off`;
export const btnPrimary = `${btnBase} h-9 border-primary bg-primary px-3.5 text-white hover:brightness-[1.18]`;
export const btnLg = `${btnBase} h-[42px] border-line bg-white px-[18px] text-ink hover:bg-off`;
export const btnPrimaryLg = `${btnBase} h-[42px] border-primary bg-primary px-[18px] text-white hover:brightness-[1.18]`;

/** Tombol saran lembur (juga dipakai sebagai contoh di halaman panduan). */
export const saran =
    'inline-flex h-[26px] items-center rounded-lg border border-warn bg-warn-soft px-1.5 text-xs whitespace-nowrap text-warn';

/** Tautan teks biasa. */
export const link = 'font-medium text-ink underline underline-offset-[3px]';
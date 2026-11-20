import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/inter';
import SiteHeader from '@/components/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rekap Absensi',
  description: 'Ubah Excel absensi mesin sidik jari menjadi PDF rekap bulanan.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}

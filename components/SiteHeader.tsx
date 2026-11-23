'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gutter } from '@/lib/ui';

const navLink = 'text-sm font-medium text-muted transition-colors hover:text-ink aria-[current=page]:text-ink';

export default function SiteHeader() {
  const path = usePathname();
  const current = (href: string) => (path === href ? 'page' : undefined);

  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className={`${gutter} flex h-18 max-w-[1220px] items-center justify-between gap-4 max-[520px]:h-16`}>
        <Link href="/" className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-ink" aria-label="Rekap Absensi, beranda">
          <span className="inline-flex size-[30px] items-center justify-center rounded-lg bg-primary text-white" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="12" height="11" rx="2" />
              <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3M5.8 10l1.6 1.6L10.4 8.6" />
            </svg>
          </span>
          <span className="max-[520px]:hidden">Rekap Absensi</span>
        </Link>
        <nav className="flex items-center gap-[18px] min-[861px]:gap-7" aria-label="Menu utama">
          <Link href="/" className={navLink} aria-current={current('/')}>Rekap</Link>
          <Link href="/panduan" className={navLink} aria-current={current('/panduan')}>Panduan</Link>
        </nav>
        <div className="flex justify-end">
          <Link
            href="/panduan"
            className="inline-flex h-[34px] items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition hover:brightness-[1.15]"
          >
            Cara memakai
          </Link>
        </div>
      </div>
    </header>
  );
}
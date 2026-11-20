'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteHeader() {
  const path = usePathname();
  const current = (href: string) => (path === href ? 'page' : undefined);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Rekap Absensi, beranda">
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="12" height="11" rx="2" />
              <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3M5.8 10l1.6 1.6L10.4 8.6" />
            </svg>
          </span>
          <span>Rekap Absensi</span>
        </Link>
        <nav className="nav" aria-label="Menu utama">
          <Link href="/" aria-current={current('/')}>Rekap</Link>
          <Link href="/panduan" aria-current={current('/panduan')}>Panduan</Link>
        </nav>
        <div className="site-header-end">
          <Link href="/panduan" className="nav-cta">Cara memakai</Link>
        </div>
      </div>
    </header>
  );
}

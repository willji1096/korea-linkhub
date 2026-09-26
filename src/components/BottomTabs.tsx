'use client';

import { usePathname } from 'next/navigation';
import { isActive } from '@/lib/nav';

// Phone menu, fixed to the bottom where thumbs reach. Official links live on Home.
const TABS = [
  { id: 'home', label: 'Home', href: '', icon: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { id: 'places', label: 'Places', href: '/places', icon: 'M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { id: 'getting-around', label: 'Transport', href: '/getting-around', icon: 'M6 16V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm0-5h12M8 21l1.5-3M16 21l-1.5-3M9 14.5h.01M15 14.5h.01' },
  { id: 'help', label: 'Help', href: '/help', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v5m0 3.5h.01' },
  { id: 'learn', label: 'Learn', href: '/learn', icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zm0 0v15M8 7h8' },
];

export function BottomTabs({ locale }: { locale: string }) {
  const pathname = usePathname();
  if (pathname.startsWith(`/${locale}/admin`)) return null;
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 hairline-t bg-[var(--bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => {
          const on = t.href === '' ? pathname === `/${locale}` : isActive(pathname, locale, t.href);
          return (
            <li key={t.id}>
              <a
                href={`/${locale}${t.href}`}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  on ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d={t.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

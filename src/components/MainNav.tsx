'use client';

import { usePathname } from 'next/navigation';
import { NAV, isActive } from '@/lib/nav';

// Desktop menu in the header. Phones use BottomTabs instead.
export function MainNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {NAV.map((n) => {
        const on = isActive(pathname, locale, n.href);
        return (
          <a
            key={n.id}
            href={`/${locale}${n.href}`}
            aria-current={on ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors ${
              on ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <span className={on ? 'border-b-2 border-[var(--accent)] pb-0.5' : 'border-b-2 border-transparent pb-0.5'}>{n.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

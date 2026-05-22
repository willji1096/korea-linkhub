import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import type { Locale } from '@/i18n/locales';

export function Header({ locale, brand, status }: { locale: Locale; brand: string; status: string }) {
  return (
    <header className="sticky top-0 z-40 hairline-b bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-5">
          <a href={`/${locale}`} className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <rect x="1" y="1" width="18" height="18" rx="5" fill="var(--ink)" />
              <path d="M6 7v6M6 10l4-3M6 10l4 3" stroke="var(--ink-inverse)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="10" r="1.5" fill="var(--accent)" />
            </svg>
            <span className="text-sm font-semibold tracking-tight text-[var(--ink)]">{brand}</span>
          </a>
          <nav className="flex items-center gap-4">
            <a
              href={`/${locale}/blog`}
              className="text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] sm:text-sm"
            >
              Journal
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="live-dot" aria-hidden />
            <span className="caps text-[var(--ink-muted)]">{status}</span>
          </span>
          <LanguageSwitcher current={locale} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

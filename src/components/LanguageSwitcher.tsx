'use client';

import { useState, useRef, useEffect } from 'react';
import { PLANNED_LOCALES, type Locale } from '@/i18n/locales';

const PLANNED_LABELS: Record<string, string> = {
  ja: '日本語',
  'zh-CN': '简体中文',
  ko: '한국어',
  vi: 'Tiếng Việt',
  'pt-BR': 'Português (BR)',
  es: 'Español',
  ar: 'العربية',
};

export function LanguageSwitcher({ current: _current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="surface surface-hover num inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="More languages coming soon"
      >
        <span className="caps">EN</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="text-[var(--ink-subtle)]">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="dialog"
          className="surface absolute right-0 z-40 mt-2 w-64 rounded-xl p-4 shadow-[0_12px_32px_-12px_rgba(9,9,11,0.18)]"
        >
          <p className="caps text-[var(--ink-muted)]">Current</p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--ink)]">English</p>

          <p className="caps mt-4 text-[var(--ink-muted)]">Translation in progress</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {PLANNED_LOCALES.map((loc) => (
              <li key={loc}>
                <span className="caps inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-dashed border-[var(--line)] px-2.5 py-1 text-[var(--ink-subtle)]">
                  {PLANNED_LABELS[loc] ?? loc}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-[var(--ink-subtle)]">
            We&apos;ll switch a language on only after every card is translated end-to-end.
          </p>
        </div>
      )}
    </div>
  );
}

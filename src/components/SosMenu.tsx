'use client';

import { useEffect, useRef, useState } from 'react';

type Line = { number: string; label: string; languages: string };

const LINES: Line[] = [
  { number: '112', label: 'Police', languages: 'EN · 24/7' },
  { number: '119', label: 'Fire · Ambulance', languages: 'EN · JA · ZH · 24/7' },
  { number: '1330', label: 'Tourist Help (KTO)', languages: '20 languages · Free · 24/7' },
  { number: '1339', label: 'Medical Info', languages: 'EN · 24/7' },
];

export function SosMenu() {
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
        aria-haspopup="dialog"
        aria-expanded={open}
        className="caps inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-1 text-[var(--danger)] transition-colors hover:bg-[var(--danger)] hover:text-white"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <circle cx="5" cy="5" r="4" fill="currentColor" />
        </svg>
        <span>SOS</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Emergency hotlines"
          className="surface absolute right-0 z-50 mt-2 w-72 rounded-xl p-3 shadow-[0_12px_32px_-12px_rgba(9,9,11,0.18)]"
        >
          <p className="caps px-2 pt-1 text-[var(--ink-muted)]">Free multilingual hotlines</p>
          <ul className="mt-2 flex flex-col gap-1">
            {LINES.map((l) => (
              <li key={l.number}>
                <a
                  href={`tel:${l.number}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-[var(--bg-sunken)]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--ink)]">{l.label}</div>
                    <div className="caps mt-0.5 text-[var(--ink-subtle)]">{l.languages}</div>
                  </div>
                  <div className="num shrink-0 text-base font-medium tracking-tight text-[var(--ink)]">
                    {l.number}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

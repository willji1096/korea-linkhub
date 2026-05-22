export function Footer({
  updatedAt,
  disclaimer,
  updatedLabel,
  brand,
  locale = 'en',
}: {
  updatedAt: string;
  disclaimer: string;
  updatedLabel: string;
  brand: string;
  locale?: string;
}) {
  return (
    <footer className="hairline-t bg-[var(--bg-sunken)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-[1.6fr_1fr] sm:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                <rect x="1" y="1" width="18" height="18" rx="5" fill="var(--ink)" />
                <circle cx="14" cy="10" r="1.5" fill="var(--accent)" />
              </svg>
              <span className="text-sm font-semibold tracking-tight text-[var(--ink)]">{brand}</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">{disclaimer}</p>
            <a
              href={`/${locale}/request`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Suggest a Korean site
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div>
            <p className="caps text-[var(--ink-subtle)]">{updatedLabel}</p>
            <p className="num mt-2 text-sm text-[var(--ink)]">{updatedAt}</p>
            <p className="mt-4 flex items-center gap-2">
              <span className="live-dot" aria-hidden />
              <span className="caps text-[var(--ink-muted)]">All systems live</span>
            </p>
          </div>
        </div>
        <div className="hairline-t mt-10 flex items-center justify-between pt-6">
          <span className="caps text-[var(--ink-subtle)]">korea-linkhub</span>
          <span className="caps text-[var(--ink-subtle)]">v1.0 · 2026</span>
        </div>
      </div>
    </footer>
  );
}

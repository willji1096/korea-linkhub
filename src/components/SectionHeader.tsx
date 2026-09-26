// One heading style for every home section: a clear title, a plain-language line, and "see all".
export function SectionHeader({ title, sub, href, linkLabel }: { title: string; sub?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-2xl">{title}</h2>
        {sub && <p className="mt-1 text-sm leading-snug text-[var(--ink-muted)]">{sub}</p>}
      </div>
      {href && (
        <a href={href} className="-my-3 inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
          {linkLabel ?? 'See all'} →
        </a>
      )}
    </div>
  );
}

export const HOME_SECTION = 'mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16';

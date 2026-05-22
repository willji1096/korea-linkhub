'use client';

import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 24;
import { BookmarkToggle } from './BookmarkToggle';

type Localized = { en: string; [key: string]: string | undefined };

export type Link = {
  id: string;
  category: string;
  priority: number;
  url: string;
  name: Localized;
  description?: Localized;
  languages?: string[];
};

type Messages = Record<string, string>;

function pick(value: Localized | undefined, locale: string): string {
  if (!value) return '';
  return value[locale] ?? value.en ?? '';
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function Directory({
  links,
  messages,
  locale,
}: {
  links: Link[];
  messages: Messages;
  locale: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => set.add(l.category));
    return Array.from(set);
  }, [links]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!q) return true;
      const haystack = [
        pick(l.name, locale),
        pick(l.name, 'en'),
        pick(l.description, locale),
        pick(l.description, 'en'),
        l.category,
        l.url,
        ...(l.languages ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [links, query, category, locale]);

  const t = (key: string) => messages[key] ?? key;
  const catLabel = (c: string) => messages[`category.${c}`] ?? c;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleCount;
  const nextBatch = Math.min(PAGE_SIZE, remaining);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-24">
      {/* Sticky controls */}
      <div className="sticky top-[57px] z-30 -mx-5 mb-8 hairline-b bg-[var(--bg)]/85 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-12 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-subtle)] focus:border-[var(--accent)]"
              aria-label={t('search.placeholder')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-base text-[var(--ink-muted)] hover:bg-[var(--bg-sunken)]"
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <ul className="flex flex-wrap gap-1.5">
              <li>
                <Chip active={category === 'all'} onClick={() => setCategory('all')}>
                  {t('category.all')}
                </Chip>
              </li>
              {allCategories.map((c) => (
                <li key={c}>
                  <Chip active={category === c} onClick={() => setCategory(c)}>
                    {catLabel(c)}
                  </Chip>
                </li>
              ))}
            </ul>
            <span className="num caps shrink-0 pt-1.5 text-[var(--ink-subtle)]" aria-live="polite">
              {filtered.length} / {links.length}
            </span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface mt-12 flex flex-col items-center gap-4 rounded-2xl p-10 text-center">
          <p className="text-base text-[var(--ink)]">{t('search.empty')}</p>
          <p className="max-w-md text-sm text-[var(--ink-muted)]">
            Know a Korean site foreigners should be able to find here? Suggest it — every request is reviewed by hand.
          </p>
          <a
            href={`/${locale}/request`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--ink-inverse)] transition-colors hover:bg-[var(--accent)]"
          >
            Suggest a site
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((l) => (
              <li key={l.id}>
                <LinkCard link={l} locale={locale} messages={messages} catLabel={catLabel} />
              </li>
            ))}
          </ul>
          {remaining > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)] sm:w-auto sm:px-10"
              >
                Show {nextBatch} more
                <span className="ml-2 text-[var(--ink-subtle)]">·</span>
                <span className="num ml-2 text-[var(--ink-muted)]">{remaining} left</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Favicon({ host, featured = false }: { host: string; featured?: boolean }) {
  return (
    <span
      className={
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] ' +
        (featured ? 'size-10' : 'size-9')
      }
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
        alt=""
        width={featured ? 24 : 20}
        height={featured ? 24 : 20}
        loading="lazy"
        className={featured ? 'size-6 object-contain' : 'size-5 object-contain'}
      />
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ' +
        (active
          ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--ink-inverse)]'
          : 'border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]')
      }
    >
      {children}
    </button>
  );
}

function LinkCard({
  link,
  locale,
  messages,
  catLabel,
}: {
  link: Link;
  locale: string;
  messages: Messages;
  catLabel: (c: string) => string;
}) {
  const featured = link.priority >= 95;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        'surface surface-hover group relative flex h-full flex-col justify-between gap-4 rounded-2xl p-5 ' +
        (featured ? 'hover:border-[var(--ink)]' : '')
      }
    >
      <BookmarkToggle id={link.id} />
      <div>
        <div className="flex items-center gap-3">
          <Favicon host={hostOf(link.url)} featured={featured} />
          <span className="caps text-[var(--ink-subtle)]">{catLabel(link.category)}</span>
        </div>
        <h3
          className={
            'mt-3 pr-8 font-semibold tracking-tight text-[var(--ink)] ' +
            (featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg')
          }
        >
          {pick(link.name, locale)}
        </h3>
        {link.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            {pick(link.description, locale)}
          </p>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="num truncate text-sm text-[var(--ink-muted)]">{hostOf(link.url)}</div>
          {link.languages && link.languages.length > 0 && (
            <div className="caps mt-3 text-[var(--ink-subtle)]">
              {link.languages.slice(0, 5).join(' · ')}
              {link.languages.length > 5 && ` +${link.languages.length - 5}`}
            </div>
          )}
        </div>
        <span className="caps inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--ink-muted)] transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
          {messages['action.visit']}
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M2 8l6-6M3 2h5v5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </a>
  );
}

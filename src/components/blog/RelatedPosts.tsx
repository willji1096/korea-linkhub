'use client';

import { coverFor, type Post } from '@/lib/posts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RelatedPosts({
  posts,
  locale,
  query,
  category,
}: {
  posts: Post[];
  locale: string;
  query: string;
  category: string;
}) {
  const q = query.trim().toLowerCase();
  const filtered = posts.filter((p) => {
    const tagMatch =
      category !== 'all' &&
      (p.tags.includes(category) || (category === 'health' && p.tags.includes('health')));
    if (!q && category === 'all') return false;
    if (!q && tagMatch) return true;
    if (q) {
      const haystack = [p.title, p.summary, p.body, ...p.tags].join(' ').toLowerCase();
      return haystack.includes(q);
    }
    return false;
  });

  if (filtered.length === 0) return null;
  const top = filtered.slice(0, 3);

  return (
    <section className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)]/40 p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="caps text-[var(--ink-muted)]">Related guides</h2>
        <a href={`/${locale}/blog`} className="caps text-[var(--ink-muted)] hover:text-[var(--ink)]">
          All →
        </a>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {top.map((p) => (
          <li key={p.id}>
            <a
              href={`/${locale}/blog/${p.slug}`}
              className="group flex h-full items-center gap-3 rounded-xl bg-[var(--bg-elevated)] p-2.5 transition-colors hover:bg-[var(--bg-sunken)]"
            >
              <span className="aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-sunken)]">
                <img src={coverFor(p)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ink)]">
                  {p.title}
                </span>
                <span className="num mt-1 block text-xs text-[var(--ink-subtle)]">
                  {formatDate(p.publishedAt)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

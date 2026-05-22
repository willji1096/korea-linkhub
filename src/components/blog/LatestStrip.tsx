import type { Post } from '@/lib/posts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LatestStrip({ posts, locale }: { posts: Post[]; locale: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="caps text-[var(--ink-muted)]">Latest from the journal</h2>
        <a href={`/${locale}/blog`} className="caps text-[var(--ink-muted)] hover:text-[var(--ink)]">
          All posts →
        </a>
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {posts.map((p) => (
          <a
            key={p.id}
            href={`/${locale}/blog/${p.slug}`}
            className="surface surface-hover flex w-[260px] shrink-0 flex-col gap-2 rounded-xl p-4 sm:w-[300px]"
          >
            <div className="flex items-center gap-1.5">
              {p.tags.slice(0, 2).map((t) => (
                <span key={t} className="caps text-[var(--ink-subtle)]">
                  {t}
                </span>
              ))}
            </div>
            <div className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ink)]">
              {p.title}
            </div>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="num text-xs text-[var(--ink-subtle)]">{formatDate(p.publishedAt)}</span>
              <span className="caps text-[var(--ink-faint)]">Read →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

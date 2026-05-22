import type { Post } from '@/lib/posts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LatestStrip({ posts, locale }: { posts: Post[]; locale: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-16 hairline-t bg-[var(--bg-sunken)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="caps text-[var(--ink-muted)]">Latest from the journal</h2>
          <a href={`/${locale}/blog`} className="caps text-[var(--ink-muted)] hover:text-[var(--ink)]">
            All posts →
          </a>
        </div>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/${locale}/blog/${p.slug}`}
              className="flex w-[260px] shrink-0 flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--line-strong)] sm:w-[300px]"
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
      </div>
    </section>
  );
}

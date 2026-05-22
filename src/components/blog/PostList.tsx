import { coverFor, type Post } from '@/lib/posts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PostList({ posts, locale, heading }: { posts: Post[]; locale: string; heading?: string }) {
  if (posts.length === 0) {
    return <p className="mt-12 text-center text-sm text-[var(--ink-subtle)]">No posts yet.</p>;
  }
  return (
    <div>
      {heading && (
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">{heading}</h2>
          <a href={`/${locale}/blog`} className="caps text-[var(--ink-muted)] hover:text-[var(--ink)]">
            All posts →
          </a>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.id}>
            <a
              href={`/${locale}/blog/${p.slug}`}
              className="surface surface-hover group flex h-full flex-col overflow-hidden rounded-2xl"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--bg-sunken)]">
                <img
                  src={coverFor(p)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="caps text-[var(--ink-subtle)]">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-lg">
                  {p.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-[var(--ink-muted)]">{p.summary}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="num text-xs text-[var(--ink-subtle)]">{formatDate(p.publishedAt)}</span>
                  <span className="caps text-[var(--ink-muted)]">Read →</span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

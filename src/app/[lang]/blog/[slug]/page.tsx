import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TodayBar } from '@/components/TodayBar';
import { findPost, allPosts } from '@/lib/posts';
import linksData from '@/data/links.json';

type Link = { id: string; url: string; category: string; name: { en: string } };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function generateMetadata({ params }: PageProps<'/[lang]/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — korea-linkhub`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPost({ params }: PageProps<'/[lang]/blog/[slug]'>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = findPost(slug);
  if (!post) notFound();

  const m = await getMessages(lang);

  const allLinks = linksData.items as Link[];
  const related = (post.relatedLinks ?? [])
    .map((id) => allLinks.find((l) => l.id === id))
    .filter(Boolean) as Link[];

  return (
    <>
      <TodayBar />
      <Header locale={lang} brand={m['site.name']} status="journal" />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-20">
          <a href={`/${lang}/blog`} className="caps inline-flex items-center gap-1 text-[var(--ink-muted)] hover:text-[var(--ink)]">
            ← All posts
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {post.tags.map((t) => (
              <span key={t} className="caps text-[var(--ink-subtle)]">
                {t}
              </span>
            ))}
            <span className="caps text-[var(--ink-faint)]">·</span>
            <span className="num text-xs text-[var(--ink-subtle)]">{formatDate(post.publishedAt)}</span>
          </div>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[44px] sm:leading-[1.08]">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            {post.summary}
          </p>

          <div className="prose mt-10 max-w-none text-[var(--ink)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>

          {post.source && (
            <p className="mt-10 hairline-t pt-5 text-xs text-[var(--ink-muted)]">
              Source ·{' '}
              <a href={post.source.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
                {post.source.name}
              </a>
            </p>
          )}

          {related.length > 0 && (
            <section className="mt-12 hairline-t pt-8">
              <h2 className="caps mb-4 text-[var(--ink-muted)]">Sites mentioned</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {related.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="surface surface-hover flex items-center justify-between rounded-xl p-3"
                    >
                      <span className="text-sm font-semibold text-[var(--ink)]">{l.name.en}</span>
                      <span className="num text-xs text-[var(--ink-subtle)]">{hostOf(l.url)} →</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={linksData.updatedAt}
        locale={lang}
      />
    </>
  );
}

export async function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PLACES } from '@/lib/places';
import { LEARN, KIND_LABEL } from '@/lib/learn';
import learnData from '@/data/learn.json';
import { LearnCover } from '@/components/LearnCover';

export async function generateMetadata({ params }: PageProps<'/[lang]/learn'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  return {
    title: `Learn Korea — etiquette, basic Korean and the stories behind the sights | ${m['site.name']}`,
    description: 'Short, practical reads before and during your trip: Korean etiquette and why it exists, phrases to show staff, and what to know before visiting palaces.',
    alternates: { canonical: `/${lang}/learn` },
  };
}

export default async function LearnIndexPage({ params }: PageProps<'/[lang]/learn'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">Learn Korea</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
            Five-minute reads for before and during your trip — how things work here, and why.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LEARN.map((c) => (
              <li key={c.id}>
                <a href={`/${lang}/learn/${c.id}`} className="surface surface-hover flex h-full min-h-11 flex-col overflow-hidden">
                  <LearnCover card={c} className="aspect-[16/9]" />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="caps text-[var(--ink-subtle)]">{KIND_LABEL[c.kind]}</span>
                    <span className="mt-2 text-[15px] font-medium leading-snug text-[var(--ink)]">{c.title_en}</span>
                    <span className="mt-0.5 text-sm text-[var(--ink-muted)]" lang="ko">{c.title_ko}</span>
                    <span className="mt-2 line-clamp-2 text-sm leading-snug text-[var(--ink-muted)]">{c.summary_en}</span>
                    <span className="mt-auto pt-3 text-xs text-[var(--ink-muted)]">{c.read_min} min read</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={learnData.updatedAt}
        locale={lang}
      />
    </>
  );
}

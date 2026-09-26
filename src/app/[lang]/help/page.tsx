import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PLACES, formatDate } from '@/lib/places';
import { SITUATIONS } from '@/lib/situations';
import situationsData from '@/data/situations.json';

export async function generateMetadata({ params }: PageProps<'/[lang]/help'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  return {
    title: `What to do in Korea when something goes wrong | ${m['site.name']}`,
    description: 'Lost passport, lost items, getting sick, emergencies, tax refunds — where to go and what to say, checked against official sources.',
    alternates: { canonical: `/${lang}/help` },
  };
}

export default async function HelpIndexPage({ params }: PageProps<'/[lang]/help'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">What to do</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
            Where to go, who to call and what to say — step by step, checked against official sources.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATIONS.map((s) => (
              <li key={s.id}>
                <a href={`/${lang}/help/${s.id}`} className="surface surface-hover flex h-full min-h-11 flex-col p-4">
                  <span className="text-[15px] font-medium leading-snug text-[var(--ink)]">{s.title_en}</span>
                  <span className="mt-0.5 text-sm text-[var(--ink-muted)]" lang="ko">{s.title_ko}</span>
                  <span className="mt-2 line-clamp-2 text-sm leading-snug text-[var(--ink-muted)]">{s.summary_en}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-[var(--ink-muted)]">
                    <span
                      className={`inline-block size-1.5 rounded-full ${s.confidence === 'partial' ? 'bg-[var(--warn)]' : 'bg-[var(--safe)]'}`}
                      aria-hidden
                    />
                    Checked {formatDate(s.last_verified)}
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
        updatedAt={situationsData.updatedAt}
        locale={lang}
      />
    </>
  );
}

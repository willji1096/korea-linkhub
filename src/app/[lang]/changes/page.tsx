import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChangeCard } from '@/components/ChangeCard';
import { changesByTime, CHANGES } from '@/lib/changes';
import { PLACES } from '@/lib/places';

// Rebuilt every 30 minutes so "now / coming up" follows the Seoul date.
export const revalidate = 1800;

export async function generateMetadata({ params }: PageProps<'/[lang]/changes'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  const title = `What changed this week — closures, free days & hours in Korea | ${m['site.name']}`;
  const description = 'Temporary closures, free-entry days and changed hours at palaces and museums, each checked against the official notice.';
  return { title, description, alternates: { canonical: `/${lang}/changes` }, openGraph: { title, description, siteName: m['site.name'] } };
}

const GROUPS = [
  { when: 'now', title: 'Happening now' },
  { when: 'soon', title: 'Coming up (next 2 weeks)' },
  { when: 'later', title: 'Later' },
] as const;

export default async function ChangesPage({ params }: PageProps<'/[lang]/changes'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);
  const all = changesByTime();
  const latest = CHANGES.map((c) => c.checked).sort().at(-1) ?? '';

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <p className="caps text-[var(--ink-subtle)]">This week</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">What changed</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            Temporary closures, free days and changed hours — the things guidebooks, maps and AI answers usually miss. Each one comes from the official
            notice, and we check the official pages every day.{' '}
            <a href={`/${lang}/how-we-check`} className="text-[var(--accent)] hover:underline">
              How we check
            </a>
          </p>
          {GROUPS.map((g) => {
            const items = all.filter((c) => c.when === g.when);
            if (!items.length) return null;
            return (
              <section key={g.when} className="mt-10">
                <h2 className="text-lg font-semibold text-[var(--ink)] sm:text-xl">
                  {g.title} <span className="num text-[var(--ink-subtle)]">{items.length}</span>
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((c) => (
                    <ChangeCard key={c.id} c={c} locale={lang} />
                  ))}
                </div>
              </section>
            );
          })}
          <p className="mt-10 text-xs text-[var(--ink-subtle)]">
            Special closures can still happen on the day. Not sure? Call 1330 (Korea Travel Helpline, 24/7, English).
          </p>
        </div>
      </main>
      <Footer brand={m['site.name']} disclaimer={m['footer.disclaimer']} updatedLabel={m['footer.updated']} updatedAt={latest} locale={lang} />
    </>
  );
}

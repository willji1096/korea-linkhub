import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PLACES } from '@/lib/places';
import { CHANGES } from '@/lib/changes';
import linksData from '@/data/links.json';

export async function generateMetadata({ params }: PageProps<'/[lang]/how-we-check'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  const title = `How we check | ${m['site.name']}`;
  const description = 'Where our information comes from, how often it is checked, and what we do when something is wrong.';
  return { title, description, alternates: { canonical: `/${lang}/how-we-check` } };
}

// Same rule as scripts/watch_places.py: official pages that carry hours, closures or fees.
const WATCH_WORDS = ['hour', 'clos', 'holiday', 'admission', 'open', 'notice', 'fee', 'ticket'];
const SKIP = /schM=view|boardView|\/archives\//;
const watchedPages = new Set(
  PLACES.flatMap((p) => p.sources.filter((s) => WATCH_WORDS.some((w) => s.field.toLowerCase().includes(w)) && !SKIP.test(s.url)).map((s) => s.url)),
).size;

export default async function HowWeCheckPage({ params }: PageProps<'/[lang]/how-we-check'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);
  const withToday = PLACES.filter((p) => p.schedule).length;
  const caught = CHANGES.filter((c) => c.missed_by?.length).length;

  const stats = [
    { n: linksData.items.length, label: 'official links opened every day' },
    { n: watchedPages, label: 'official hours pages compared every day' },
    { n: withToday, label: 'places with an "open today" answer' },
    { n: CHANGES.length, label: 'dated changes on record' },
  ];

  const steps = [
    {
      t: 'Only official sources',
      d: 'Hours, closed days, fees and phone numbers come from the place’s own site or the government office in charge. Each fact on a page links to where it came from. When the English page and the Korean page disagree, we follow the Korean one and say so.',
    },
    {
      t: 'Checked every morning, automatically',
      d: 'At 09:00 Seoul time a script opens every official link. At 09:10 another one reads each official hours page and compares the hours and closure lines with the day before.',
    },
    {
      t: 'A person reads every change',
      d: 'When a page changes, we get an alert, read the official notice, and update the place page by hand. Nothing is changed automatically — a wrong automatic edit would publish wrong hours.',
    },
    {
      t: 'Every page shows when it was checked',
      d: '“Checked 26 Sep 2026” means we compared that page with the official source on that day. “Open today” is worked out from the official schedule and the public holiday list, in Seoul time.',
    },
    {
      t: 'When we are not sure, we say so',
      d: 'If a day has special rules we cannot confirm, the page says “Special schedule today — check the official site” instead of guessing.',
    },
  ];

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <div>
              <p className="caps text-[var(--ink-subtle)]">Trust</p>
              <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">How we check</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
                Hours and rules in Korea change often — a hall closes for three months, a holiday moves a closing day, a palace becomes free on
                Wednesdays. This is how we keep up.
              </p>
              <ol className="mt-8 space-y-6">
                {steps.map((s, i) => (
                  <li key={s.t} className="flex gap-4">
                    <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {i + 1}
                    </span>
                    <div>
                      <h2 className="font-semibold text-[var(--ink)]">{s.t}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="surface mt-10 p-5">
                <h2 className="font-semibold text-[var(--ink)]">Found something wrong?</h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">Tell us which page and what the official site says. We check it and fix it.</p>
                <a href={`/${lang}/request`} className="-mb-2 mt-1 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)] hover:underline">
                  Report a mistake →
                </a>
              </div>
            </div>
            <aside className="lg:pt-8">
              <ul className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <li key={s.label} className="surface p-4">
                    <p className="num text-3xl font-semibold text-[var(--ink)]">{s.n}</p>
                    <p className="mt-1 text-xs leading-snug text-[var(--ink-muted)]">{s.label}</p>
                  </li>
                ))}
              </ul>
              {caught > 0 && (
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
                  <span className="font-medium text-[var(--ink)]">{caught} of our recent changes</span> were not yet on the official tourism sites when we
                  checked.{' '}
                  <a href={`/${lang}/changes`} className="text-[var(--accent)] hover:underline">
                    See what changed →
                  </a>
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer brand={m['site.name']} disclaimer={m['footer.disclaimer']} updatedLabel={m['footer.updated']} updatedAt={linksData.updatedAt} locale={lang} />
    </>
  );
}

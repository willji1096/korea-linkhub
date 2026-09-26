import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PLACES } from '@/lib/places';
import linksData from '@/data/links.json';
import type { Link } from '@/components/Directory';

// Transport links grouped by the moment a visitor needs them.
const GROUPS = [
  { title: 'From the airport', ids: ['incheon-airport', 'arex', 'gimpo-airport'] },
  { title: 'Subway & bus in the city', ids: ['tmoney', 'humetro-busan', 'dtro-daegu'] },
  { title: 'Maps & taxis', ids: ['naver-map', 'kakao-t'] },
  { title: 'Trains between cities', ids: ['korail', 'srt-english'] },
  { title: 'Buses between cities', ids: ['kobus-express', 'txbus-intercity'] },
  { title: 'Driving', ids: ['its-eng'] },
];

export async function generateMetadata({ params }: PageProps<'/[lang]/getting-around'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  return {
    title: `Getting around Korea — airport trains, transit cards, maps & taxis | ${m['site.name']}`,
    description: 'The official sites for getting from the airport, riding the subway and bus, booking KTX and express buses, and calling a taxi in Korea.',
    alternates: { canonical: `/${lang}/getting-around` },
  };
}

export default async function GettingAroundPage({ params }: PageProps<'/[lang]/getting-around'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);
  const byId = new Map((linksData.items as Link[]).map((l) => [l.id, l]));

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">Getting around</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
            The official sites for every step — airport, city transit, trains and taxis.
          </p>

          <a
            href={`/${lang}/places`}
            className="mt-6 flex min-h-11 items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] p-5 hover:bg-[#e3eefe]"
          >
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-snug text-[var(--ink)]">Taking a taxi?</span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-muted)]">
                Every place page has the address in Korean. Show it to the driver.
              </span>
            </span>
            <span aria-hidden className="shrink-0 text-[var(--accent)]">→</span>
          </a>

          {GROUPS.map((g) => (
            <section key={g.title} className="mt-10">
              <h2 className="caps text-[var(--ink-muted)]">{g.title}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.ids.map((id) => {
                  const l = byId.get(id);
                  if (!l) return null;
                  return (
                    <li key={id}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="surface surface-hover flex h-full min-h-11 flex-col p-4"
                      >
                        <span className="text-[15px] font-medium leading-snug text-[var(--ink)]">{l.name.en}</span>
                        {l.description?.en && (
                          <span className="mt-1.5 text-sm leading-snug text-[var(--ink-muted)]">{l.description.en}</span>
                        )}
                        <span className="mt-auto pt-3 text-xs font-medium text-[var(--accent)]">
                          {new URL(l.url).host.replace(/^www\./, '')} ↗
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
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

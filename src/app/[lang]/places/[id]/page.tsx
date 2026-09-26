import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages, LOCALES } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PhotoHero } from '@/components/PhotoHero';
import { TodayPanel } from '@/components/TodayStatus';
import { viewFor } from '@/lib/today-view';
import { getPhoto } from '@/lib/photos';
import { LEARN } from '@/lib/learn';
import { changesFor } from '@/lib/changes';
import { ChangeCard } from '@/components/ChangeCard';
import { PLACES, getPlace, categoryLabel, formatDate, telHref, mapLinks, siteUrl, type Place } from '@/lib/places';
import { ExternalIcon } from '@/components/ExternalIcon';

// Rebuilt every 30 minutes so the "today" answer in the HTML stays current.
export const revalidate = 1800;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => PLACES.map((p) => ({ lang, id: p.id })));
}

// Titles answer the search itself: "Gyeongbokgung Palace hours, closed days & tickets".
function pageTitle(p: Place): string {
  if (p.type === 'service') return `${p.name_en} — hours, languages & how to reach it`;
  if (p.category === 'immigration') return `${p.name_en} — address, jurisdiction & booking`;
  return `${p.name_en} — hours, closed days & tickets`;
}

function pageDescription(p: Place): string {
  const closed = p.closed_en[0] ? ` Closed: ${p.closed_en[0]}.` : '';
  return `${p.name_ko} · Checked ${formatDate(p.last_verified)} against the official site.${closed}`.slice(0, 160);
}

export async function generateMetadata({ params }: PageProps<'/[lang]/places/[id]'>): Promise<Metadata> {
  const { lang, id } = await params;
  const p = getPlace(id);
  if (!isLocale(lang) || !p) return {};
  const m = await getMessages(lang);
  const title = `${pageTitle(p)} | ${m['site.name']}`;
  const description = pageDescription(p);
  return {
    title,
    description,
    alternates: { canonical: `/${lang}/places/${p.id}` },
    openGraph: { title, description, type: 'article', siteName: m['site.name'] },
  };
}

export default async function PlacePage({ params }: PageProps<'/[lang]/places/[id]'>) {
  const { lang, id } = await params;
  const p = getPlace(id);
  if (!isLocale(lang) || !p) notFound();
  const m = await getMessages(lang);
  const tel = p.phone ? telHref(p.phone) : null;
  const photo = getPhoto(p.id);
  // A "know before you go" story written for this place, if there is one.
  const story = LEARN.find((c) => c.kind === 'place-story' && c.related_places.includes(p.id));

  const changes = changesFor(p.id);

  // The page is about the place; dateModified says when we last checked it against the official site.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${siteUrl()}/${lang}/places/${p.id}`,
    dateModified: p.last_verified,
    about: {
      '@type': p.category === 'immigration' || p.category === 'police' ? 'GovernmentOffice' : p.type === 'service' ? 'Organization' : 'TouristAttraction',
      name: p.name_en,
      alternateName: p.name_ko,
      url: p.official_url_en ?? p.official_url_ko ?? undefined,
      sameAs: [p.official_url_en, p.official_url_ko].filter(Boolean),
      telephone: p.phone ?? undefined,
      address: p.address_ko ?? undefined,
    },
  };

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <article className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <nav className="caps flex items-center gap-2 text-[var(--ink-subtle)]">
            <a href={`/${lang}/places`} className="-my-3 inline-flex min-h-11 items-center hover:text-[var(--ink)]">Places</a>
            <span aria-hidden>/</span>
            <span>{categoryLabel(p.category)}</span>
          </nav>

          {photo && <PhotoHero photo={photo} />}

          {/* Mobile order: title → the facts people came for → the rest. Desktop: facts in a right column. */}
          <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-10">
            <header className="lg:col-start-1">
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl lg:text-5xl">{p.name_en}</h1>
              <p className="mt-1 text-lg text-[var(--ink-muted)]" lang="ko">{p.name_ko}</p>
              <Checked place={p} />
            </header>

            <aside className="grid content-start gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              {p.schedule && <TodayPanel place={{ hours: p.hours, schedule: p.schedule }} initial={viewFor(p)} />}
              {p.hours && p.hours.length > 0 && (
                <Card title="Hours">
                  <ul className="divide-y divide-[var(--line)]">
                    {p.hours.map((h, i) => (
                      <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0">
                        <span className="min-w-0 text-sm text-[var(--ink)]">
                          {h.days}
                          {h.season && <span className="block text-xs text-[var(--ink-muted)]">{h.season}</span>}
                        </span>
                        <span className="num shrink-0 text-sm text-[var(--ink)]">
                          {h.open}–{h.close}
                          {h.last_entry && <span className="block text-right text-xs text-[var(--ink-muted)]">last entry {h.last_entry}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {p.closed_en.length > 0 && (
                <Card title="Closed">
                  <List items={p.closed_en} />
                </Card>
              )}

              {(p.address_ko || p.transit_en) && (
                <Card title="Getting there">
                  {p.address_ko && (
                    <div className="rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] p-4">
                      <p className="caps text-[var(--ink-subtle)]">Show the taxi driver</p>
                      <p className="mt-2 text-lg font-semibold leading-snug text-[var(--ink)]" lang="ko">{p.address_ko}</p>
                      {p.address_en && <p className="mt-1 text-sm text-[var(--ink-muted)]">{p.address_en}</p>}
                    </div>
                  )}
                  {p.transit_en && <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">{p.transit_en}</p>}
                  {p.address_ko && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mapLinks(p.address_ko).map((l) => (
                        <ButtonLink key={l.label} href={l.url}>{l.label}</ButtonLink>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </aside>

            <div className="grid content-start gap-4 lg:col-start-1">
              {changes.length > 0 && (
                <section aria-label="Changes" className="grid gap-3 sm:grid-cols-2">
                  {changes.map((c) => (
                    <ChangeCard key={c.id} c={c} locale={lang} />
                  ))}
                </section>
              )}

              {p.admission_en && (
                <Card title="Tickets">
                  <p className="text-sm leading-relaxed text-[var(--ink)]">{p.admission_en}</p>
                </Card>
              )}

              {(p.booking_note_en || p.booking_url) && (
                <Card title={p.booking_required ? 'Booking required' : 'Booking'}>
                  {p.booking_note_en && <p className="text-sm leading-relaxed text-[var(--ink)]">{p.booking_note_en}</p>}
                  {p.booking_url && (
                    <div className="mt-3">
                      <ButtonLink href={p.booking_url} primary>Book on the official site</ButtonLink>
                    </div>
                  )}
                </Card>
              )}

              {p.english_tour_en && (
                <Card title="English tour">
                  <p className="text-sm leading-relaxed text-[var(--ink)]">{p.english_tour_en}</p>
                </Card>
              )}

              {p.languages && p.languages.length > 0 && (
                <Card title="Languages">
                  <p className="text-sm leading-relaxed text-[var(--ink)]">{p.languages.join(' · ')}</p>
                </Card>
              )}

              {p.jurisdiction_en && (
                <Card title="Who goes here">
                  <p className="text-sm leading-relaxed text-[var(--ink)]">{p.jurisdiction_en}</p>
                </Card>
              )}

              {p.tips_en.length > 0 && (
                <Card title="Good to know">
                  <List items={p.tips_en} />
                </Card>
              )}

              {story && (
                <a href={`/${lang}/learn/${story.id}`} className="surface surface-hover flex min-h-11 items-center justify-between gap-4 p-5">
                  <span className="min-w-0">
                    <span className="caps block text-[var(--ink-subtle)]">Read before you go · {story.read_min} min</span>
                    <span className="mt-1.5 block text-base font-semibold leading-snug text-[var(--ink)]">{story.title_en}</span>
                  </span>
                  <span aria-hidden className="shrink-0 text-[var(--accent)]">→</span>
                </a>
              )}

              <Card title="Official links">
                <div className="flex flex-wrap gap-2">
                  {p.official_url_en && <ButtonLink href={p.official_url_en} primary>Official site (English)</ButtonLink>}
                  {p.official_url_ko && <ButtonLink href={p.official_url_ko} primary={!p.official_url_en}>Official site (Korean)</ButtonLink>}
                  {tel && p.phone && <ButtonLink href={tel}>Call {p.phone.split(/[;(]/)[0].trim()}</ButtonLink>}
                </div>
                {!p.official_url_en && p.official_url_ko && (
                  <p className="mt-3 text-xs leading-relaxed text-[var(--ink-muted)]">
                    This office has no English page. Your browser can translate the Korean page.
                  </p>
                )}
              </Card>

              <details className="mt-4 text-sm text-[var(--ink-muted)]">
                <summary className="cursor-pointer select-none py-2 font-medium text-[var(--ink)]">Sources ({p.sources.length})</summary>
                <ul className="mt-2">
                  {p.sources.map((s, i) => (
                    <li key={i} className="break-words">
                      <span className="text-[var(--ink)]">{s.field}</span> —{' '}
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 py-2 text-[var(--accent)] hover:underline">
                        {new URL(s.url).hostname}
                        <ExternalIcon size={10} />
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </article>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={p.last_verified}
        locale={lang}
      />
    </>
  );
}

function Checked({ place }: { place: Place }) {
  const partial = place.confidence === 'partial';
  return (
    <p
      className={`mt-5 flex items-start gap-2.5 rounded-[var(--radius-sm)] px-3.5 py-3 text-sm leading-snug ${
        partial ? 'bg-[var(--warn-soft)] text-[var(--ink)]' : 'bg-[var(--safe-soft)] text-[var(--ink)]'
      }`}
    >
      <span className={`mt-1.5 inline-block size-2 shrink-0 rounded-full ${partial ? 'bg-[var(--warn)]' : 'bg-[var(--safe)]'}`} aria-hidden />
      <span>
        Checked <strong className="font-semibold">{formatDate(place.last_verified)}</strong> against the official Korean site.
        {partial && ' Some details could not be confirmed — call before you go.'}
        {place.type === 'place' && (
          <span className="mt-1 block text-[var(--ink-muted)]">
            Not sure? Call{' '}
            <a href="tel:1330" className="font-medium text-[var(--accent)] hover:underline">
              1330
            </a>{' '}
            — Korea Travel Helpline, 24/7, English.
          </span>
        )}
      </span>
    </p>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5">
      <h2 className="caps mb-3 text-[var(--ink-muted)]">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-[var(--ink)]">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 inline-block size-1 shrink-0 rounded-full bg-[var(--ink-subtle)]" aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function ButtonLink({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] px-4 text-sm font-medium ${
        primary
          ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
          : 'border border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--ink)] hover:border-[var(--line-strong)]'
      }`}
    >
      {children}
      {external && <ExternalIcon className="opacity-70" />}
    </a>
  );
}

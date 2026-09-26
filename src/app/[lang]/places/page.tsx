import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getPhoto, thumbSrc } from '@/lib/photos';
import { TodayChip } from '@/components/TodayStatus';
import { viewFor } from '@/lib/today-view';
import { PLACES, CATEGORIES, formatDate } from '@/lib/places';
import placesData from '@/data/places.json';

export async function generateMetadata({ params }: PageProps<'/[lang]/places'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  return {
    title: `Palaces, museums & offices in Korea — hours checked | ${m['site.name']}`,
    description:
      'Opening hours, closed days, tickets and official links for Korean palaces, museums, immigration offices and helplines — checked against the Korean source.',
    alternates: { canonical: `/${lang}/places` },
  };
}

// Rebuilt every 30 minutes so today's status in the HTML stays current.
export const revalidate = 1800;

export default async function PlacesPage({ params }: PageProps<'/[lang]/places'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">Places</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
            Hours, closed days and official links — checked against each place&apos;s Korean website.
          </p>

          {CATEGORIES.map((c) => {
            const items = PLACES.filter((p) => p.category === c.id);
            if (items.length === 0) return null;
            return (
              <section key={c.id} id={c.id} className="mt-10 scroll-mt-20">
                <h2 className="caps text-[var(--ink-muted)]">{c.label}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => {
                    const photo = getPhoto(p.id);
                    return (
                      <li key={p.id}>
                        <a href={`/${lang}/places/${p.id}`} className="surface surface-hover flex h-full min-h-11 flex-col overflow-hidden">
                          {photo && (
                            <img
                              src={thumbSrc(photo)}
                              alt=""
                              title={`Photo: ${photo.author} · ${photo.license}`}
                              className="aspect-[16/9] w-full object-cover"
                              loading="lazy"
                            />
                          )}
                          <span className="flex flex-1 flex-col p-4">
                            <span className="text-[15px] font-medium leading-snug text-[var(--ink)]">{p.name_en}</span>
                            <span className="mt-0.5 text-sm text-[var(--ink-muted)]" lang="ko">
                              {p.name_ko}
                            </span>
                            {p.schedule && (
                          <span className="mt-3">
                            <TodayChip place={{ hours: p.hours, schedule: p.schedule }} initial={viewFor(p)} />
                          </span>
                        )}
                        <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-[var(--ink-muted)]">
                              <span
                                className={`inline-block size-1.5 rounded-full ${p.confidence === 'partial' ? 'bg-[var(--warn)]' : 'bg-[var(--safe)]'}`}
                                aria-hidden
                              />
                              Checked {formatDate(p.last_verified)}
                              {p.city && <span className="text-[var(--ink-subtle)]">· {p.city}</span>}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={placesData.updatedAt}
        locale={lang}
      />
    </>
  );
}

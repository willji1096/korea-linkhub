import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages, LOCALES } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PhotoHero } from '@/components/PhotoHero';
import { getPhoto, thumbSrc } from '@/lib/photos';
import { PLACES, getPlace, formatDate } from '@/lib/places';
import { getSituation } from '@/lib/situations';
import { LEARN, getLearn, KIND_LABEL } from '@/lib/learn';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => LEARN.map((c) => ({ lang, id: c.id })));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/learn/[id]'>): Promise<Metadata> {
  const { lang, id } = await params;
  const c = getLearn(id);
  if (!isLocale(lang) || !c) return {};
  const m = await getMessages(lang);
  const title = `${c.title_en} | ${m['site.name']}`;
  return {
    title,
    description: c.summary_en.slice(0, 160),
    alternates: { canonical: `/${lang}/learn/${c.id}` },
    openGraph: { title, description: c.summary_en, type: 'article', siteName: m['site.name'] },
  };
}

export default async function LearnPage({ params }: PageProps<'/[lang]/learn/[id]'>) {
  const { lang, id } = await params;
  const c = getLearn(id);
  if (!isLocale(lang) || !c) notFound();
  const m = await getMessages(lang);
  const places = c.related_places.map(getPlace).filter((p) => p !== undefined);
  const help = (c.related_help ?? []).map(getSituation).filter((s) => s !== undefined);
  const partial = c.confidence === 'partial';
  const photo = c.photo ? getPhoto(c.photo) : undefined;

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <nav className="caps flex items-center gap-2 text-[var(--ink-subtle)]">
            <a href={`/${lang}/learn`} className="-my-3 inline-flex min-h-11 items-center hover:text-[var(--ink)]">Learn Korea</a>
            <span aria-hidden>/</span>
            <span>{KIND_LABEL[c.kind]}</span>
          </nav>

          {photo && <PhotoHero photo={photo} />}

          <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-12">
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl lg:text-5xl">{c.title_en}</h1>
              <p className="mt-1 text-lg text-[var(--ink-muted)]" lang="ko">{c.title_ko}</p>
              <p className="mt-5 text-lg leading-relaxed text-[var(--ink)]">{c.summary_en}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                <span className={`inline-block size-1.5 rounded-full ${partial ? 'bg-[var(--warn)]' : 'bg-[var(--safe)]'}`} aria-hidden />
                {c.read_min} min read · Checked {formatDate(c.last_verified)}
                {partial && ' · some details not confirmed'}
              </p>

              <div className="mt-8 grid gap-4">
                {c.sections.map((sec, i) => (
                  <section
                    key={i}
                    className={sec.lead ? 'rounded-[var(--radius-lg)] bg-[var(--accent-soft)] p-5 sm:p-7' : 'surface p-5 sm:p-6'}
                  >
                    <h2 className={`font-semibold leading-snug text-[var(--ink)] ${sec.lead ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
                      {sec.title_en}
                    </h2>
                    {sec.timeline && (
                      <ol className="mt-4">
                        {sec.timeline.map((t, j) => (
                          <li key={j} className="relative flex gap-4 pb-5 last:pb-0">
                            {j < sec.timeline!.length - 1 && (
                              <span className="absolute bottom-0 left-[5px] top-3 w-px bg-[var(--line-strong)]" aria-hidden />
                            )}
                            <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-[var(--accent)] bg-[var(--bg-elevated)]" aria-hidden />
                            <div className="min-w-0">
                              <p className="num text-lg font-semibold leading-tight text-[var(--accent)]">{t.year}</p>
                              <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">{t.text}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                    {(sec.do_en || sec.dont_en) && (
                      <div className={`mt-4 grid gap-3 ${sec.do_en && sec.dont_en ? 'sm:grid-cols-2' : ''}`}>
                        {sec.do_en && <DoList kind="do" items={sec.do_en} />}
                        {sec.dont_en && <DoList kind="dont" items={sec.dont_en} />}
                      </div>
                    )}
                    {sec.points_en && (
                      <ul className={`space-y-2.5 leading-relaxed text-[var(--ink)] ${sec.lead ? 'mt-4 text-base' : 'mt-3 text-sm'}`}>
                        {sec.points_en.map((t, j) => (
                          <li key={j} className="flex gap-2.5">
                            <span className={`mt-2.5 inline-block size-1 shrink-0 rounded-full ${sec.lead ? 'bg-[var(--accent)]' : 'bg-[var(--ink-subtle)]'}`} aria-hidden />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {sec.phrases && (
                      <ul className="mt-3 divide-y divide-[var(--line)]">
                        {sec.phrases.map((ph, j) => (
                          <li key={j} className="py-3 first:pt-0 last:pb-0">
                            <p className="text-xl font-semibold leading-snug text-[var(--ink)]" lang="ko">{ph.ko}</p>
                            <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
                              {ph.en} · <span className="italic">{ph.roman}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </div>

            <aside className="grid content-start gap-4 lg:sticky lg:top-6 lg:self-start">
              {(places.length > 0 || help.length > 0) && (
                <section className="surface p-5">
                  <h2 className="caps text-[var(--ink-muted)]">Related</h2>
                  <div className="mt-3 grid gap-2">
                    {places.map((pl) => {
                      const ph = getPhoto(pl.id);
                      return (
                        <a
                          key={pl.id}
                          href={`/${lang}/places/${pl.id}`}
                          className="flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--line)] p-2 pr-4 text-sm font-medium text-[var(--ink)] hover:border-[var(--line-strong)]"
                        >
                          {ph && <img src={thumbSrc(ph)} alt="" className="size-12 shrink-0 rounded-[6px] object-cover" loading="lazy" />}
                          <span className="min-w-0 flex-1">{pl.name_en}</span>
                          <span aria-hidden className="text-[var(--accent)]">→</span>
                        </a>
                      );
                    })}
                    {help.map((st) => (
                      <a
                        key={st.id}
                        href={`/${lang}/help/${st.id}`}
                        className="flex min-h-11 items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-medium text-[var(--ink)] hover:border-[var(--line-strong)]"
                      >
                        {st.title_en}
                        <span aria-hidden className="text-[var(--accent)]">→</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <details className="text-sm text-[var(--ink-muted)]">
                <summary className="cursor-pointer select-none py-2 font-medium text-[var(--ink)]">Sources ({c.sources.length})</summary>
                <ul className="mt-2">
                  {c.sources.map((src, i) => (
                    <li key={i} className="break-words">
                      <span className="text-[var(--ink)]">{src.field}</span> —{' '}
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-[var(--accent)] hover:underline">
                        {new URL(src.url).hostname}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </aside>
          </div>
        </article>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={c.last_verified}
        locale={lang}
      />
    </>
  );
}

function DoList({ kind, items }: { kind: 'do' | 'dont'; items: string[] }) {
  const d = kind === 'do';
  return (
    <div className={`rounded-[var(--radius-sm)] p-4 ${d ? 'bg-[var(--safe-soft)]' : 'bg-[var(--danger-soft)]'}`}>
      <p className={`caps flex items-center gap-1.5 ${d ? 'text-[var(--safe)]' : 'text-[var(--danger)]'}`}>
        <span aria-hidden className="text-sm leading-none">{d ? '○' : '✕'}</span>
        {d ? 'Do' : "Don't"}
      </p>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--ink)]">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

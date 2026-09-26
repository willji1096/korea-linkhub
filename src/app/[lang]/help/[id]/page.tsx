import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages, LOCALES } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PLACES, formatDate } from '@/lib/places';
import { SITUATIONS, getSituation, localHref } from '@/lib/situations';
import { ExternalIcon } from '@/components/ExternalIcon';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => SITUATIONS.map((s) => ({ lang, id: s.id })));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/help/[id]'>): Promise<Metadata> {
  const { lang, id } = await params;
  const s = getSituation(id);
  if (!isLocale(lang) || !s) return {};
  const m = await getMessages(lang);
  const title = `${s.title_en} — what to do, step by step | ${m['site.name']}`;
  const description = s.summary_en.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/${lang}/help/${s.id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: m['site.name'],
    },
  };
}

export default async function HelpPage({ params }: PageProps<'/[lang]/help/[id]'>) {
  const { lang, id } = await params;
  const s = getSituation(id);
  if (!isLocale(lang) || !s) notFound();
  const m = await getMessages(lang);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-12">
            <div className="min-w-0 max-w-3xl">
              <p className="caps text-[var(--ink-subtle)]">What to do</p>
              <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl lg:text-5xl">
                {s.title_en}
              </h1>
              <p className="mt-1 text-lg text-[var(--ink-muted)]" lang="ko">
                {s.title_ko}
              </p>

              <p
                className={`mt-5 flex items-start gap-2.5 rounded-[var(--radius-sm)] px-3.5 py-3 text-sm leading-snug text-[var(--ink)] ${
                  s.confidence === 'partial' ? 'bg-[var(--warn-soft)]' : 'bg-[var(--safe-soft)]'
                }`}
              >
                <span
                  className={`mt-1.5 inline-block size-2 shrink-0 rounded-full ${s.confidence === 'partial' ? 'bg-[var(--warn)]' : 'bg-[var(--safe)]'}`}
                  aria-hidden
                />
                <span>
                  Checked <strong className="font-semibold">{formatDate(s.last_verified)}</strong> against official sources.
                  {s.confidence === 'partial' && ' Some details could not be confirmed — call before you go.'}
                </span>
              </p>

              <p className="mt-6 text-base leading-relaxed text-[var(--ink)]">{s.summary_en}</p>

              <ol className="mt-8 grid gap-4">
                {s.steps.map((step, i) => (
                  <li key={i} className="surface flex gap-4 p-5">
                    <span className="num flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm text-[var(--ink-inverse)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold leading-snug text-[var(--ink)]">{step.title_en}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">{step.body_en}</p>
                      {step.show_staff_ko && (
                        <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] p-4">
                          <p className="caps text-[var(--ink-subtle)]">Show the staff</p>
                          <p className="mt-2 text-lg font-semibold leading-snug text-[var(--ink)]" lang="ko">
                            {step.show_staff_ko}
                          </p>
                          {step.show_staff_en && <p className="mt-1 text-sm text-[var(--ink-muted)]">{step.show_staff_en}</p>}
                        </div>
                      )}
                      {step.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.links.map((l) => (
                            <LinkButton key={l.href} href={localHref(l.href, lang)}>
                              {l.label_en}
                            </LinkButton>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="grid content-start gap-4 lg:sticky lg:top-6 lg:self-start lg:pt-9">
              <section className="surface p-5">
                <h2 className="caps mb-3 text-[var(--ink-muted)]">Need help now?</h2>
                <div className="flex flex-wrap gap-2">
                  {s.help.map((l) => (
                    <LinkButton key={l.href} href={localHref(l.href, lang)}>
                      {l.label_en}
                    </LinkButton>
                  ))}
                </div>
              </section>

              <details className="text-sm text-[var(--ink-muted)]">
                <summary className="cursor-pointer select-none py-2 font-medium text-[var(--ink)]">Sources ({s.sources.length})</summary>
                <ul className="mt-2">
                  {s.sources.map((src, i) => (
                    <li key={i} className="break-words">
                      <span className="text-[var(--ink)]">{src.field}</span> —{' '}
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 py-2 text-[var(--accent)] hover:underline">
                        {new URL(src.url).hostname}
                        <ExternalIcon size={10} />
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
        updatedAt={s.last_verified}
        locale={lang}
      />
    </>
  );
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--ink)] hover:border-[var(--line-strong)]"
    >
      {children}
      {external && <ExternalIcon className="text-[var(--ink-subtle)]" />}
    </a>
  );
}

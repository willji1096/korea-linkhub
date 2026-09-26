import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PLACES } from '@/lib/places';
import photoData from '@/data/photos.json';
import { thumbSrc, type Photo } from '@/lib/photos';

export async function generateMetadata({ params }: PageProps<'/[lang]/credits'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  return { title: `Photo credits | ${m['site.name']}`, alternates: { canonical: `/${lang}/credits` } };
}

export default async function CreditsPage({ params }: PageProps<'/[lang]/credits'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);
  const photos = Object.values(photoData.items as Record<string, Photo>);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${PLACES.length} places`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">Photo credits</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
            Photos on this site come from Wikimedia Commons under free licences. Resized, not otherwise changed.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <li key={p.src} className="surface flex gap-3 overflow-hidden p-3">
                <img src={thumbSrc(p)} alt="" className="size-16 shrink-0 rounded-[var(--radius-sm)] object-cover" loading="lazy" />
                <div className="min-w-0 text-sm">
                  <p className="line-clamp-2 leading-snug text-[var(--ink)]">{p.alt}</p>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center text-xs text-[var(--accent)] hover:underline">
                    {p.author} · {p.license}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={photoData.updatedAt}
        locale={lang}
      />
    </>
  );
}

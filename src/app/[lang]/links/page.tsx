import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import linksData from '@/data/links.json';
import { Directory, type Link } from '@/components/Directory';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export async function generateMetadata({ params }: PageProps<'/[lang]/links'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  return {
    title: `Official links for Korea — visa, transport, health, money | ${m['site.name']}`,
    description: 'Official Korean websites for foreigners, sorted by topic and checked regularly.',
    alternates: { canonical: `/${lang}/links` },
  };
}

export default async function LinksPage({ params }: PageProps<'/[lang]/links'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);
  const links = (linksData.items as Link[]).slice().sort((a, b) => b.priority - a.priority);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${links.length} sites`} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 sm:pt-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">Official links</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
            {links.length} official Korean websites for foreigners, sorted by topic.
          </p>
        </div>
        <Directory links={links} messages={m} locale={lang} />
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

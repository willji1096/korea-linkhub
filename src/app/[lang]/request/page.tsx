import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RequestForm } from './RequestForm';
import linksData from '@/data/links.json';

export default async function RequestPage({ params }: PageProps<'/[lang]/request'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  return (
    <>
      <Header locale={lang} brand={m['site.name']} status={`${linksData.items.length} sites`} />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-2xl px-5 pt-12 pb-6 sm:px-8 sm:pt-16">
          <p className="caps text-[var(--ink-subtle)]">Suggest a Korean site</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[36px]">
            Missing a site foreigners actually need?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            Tell us what to add. Every suggestion is reviewed by hand before it goes live.
          </p>
        </section>
        <section className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8 sm:pb-20">
          <RequestForm />
        </section>
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

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
        <section className="mx-auto w-full max-w-2xl px-5 pt-10 pb-5 sm:px-8 sm:pt-14">
          <h1 className="text-[22px] font-semibold leading-[1.2] tracking-tight text-[var(--ink)] sm:text-[26px]">
            Suggest a site we&rsquo;re missing
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            Reviewed by hand. No spam, no automatic publish.
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

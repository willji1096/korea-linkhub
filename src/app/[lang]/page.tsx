import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import linksData from '@/data/links.json';
import adsData from '@/data/ads.json';
import { Directory, type Link } from '@/components/Directory';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TopBanner, FullWidthPromo, SponsorshipStrip } from '@/components/AdSlots';
import { EventsRow } from '@/components/EventsRow';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  const links = (linksData.items as Link[]).slice().sort((a, b) => b.priority - a.priority);

  return (
    <>
      <TopBanner ads={adsData as never} />
      <Header locale={lang} brand={m['site.name']} status={`${links.length} sites`} />
      <FullWidthPromo />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-2 sm:px-8 sm:pt-12">
          <p className="caps text-[var(--ink-subtle)]">{m['site.name']}</p>
          <h1 className="mt-2 max-w-3xl text-[28px] font-semibold leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[36px]">
            {m['site.tagline']}
          </h1>
        </section>
        <EventsRow events={adsData.slots.events as never} inhouse={adsData.inhouse.events as never} />
        <Directory links={links} messages={m} locale={lang} />
        <SponsorshipStrip ads={adsData as never} />
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

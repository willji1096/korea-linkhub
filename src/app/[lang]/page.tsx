import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import linksData from '@/data/links.json';
import adsData from '@/data/ads.json';
import type { Link } from '@/components/Directory';
import { LinksTeaser } from '@/components/LinksTeaser';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TopBanner, Billboard, Leaderboard, SponsorshipStrip } from '@/components/AdSlots';
import { EventsRow } from '@/components/EventsRow';
import { PlacesRow } from '@/components/PlacesRow';
import { HelpRow } from '@/components/HelpRow';
import { LearnRow } from '@/components/LearnRow';
import { TodayBar } from '@/components/TodayBar';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  const links = (linksData.items as Link[]).slice().sort((a, b) => b.priority - a.priority);

  return (
    <>
      <TopBanner ads={adsData as never} />
      <TodayBar />
      <Header locale={lang} brand={m['site.name']} status={`${links.length} sites`} />
      <main className="flex-1 pb-16 sm:pb-24">
        <Billboard
          ads={adsData as never}
          copy={{ title: m['banner.title'], accent: m['banner.titleAccent'], body: m['banner.body'] }}
        />
        <PlacesRow locale={lang} />
        <HelpRow locale={lang} />
        <LearnRow locale={lang} />
        <EventsRow events={adsData.slots.events as never} inhouse={adsData.inhouse.events as never} />
        <LinksTeaser links={links} locale={lang} labels={m} />
        <Leaderboard ads={adsData as never} />
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

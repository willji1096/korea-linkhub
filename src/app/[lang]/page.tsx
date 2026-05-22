import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import linksData from '@/data/links.json';
import adsData from '@/data/ads.json';
import { Directory, type Link } from '@/components/Directory';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TopBanner, FullWidthPromo, SponsorshipStrip } from '@/components/AdSlots';
import { EventsRow } from '@/components/EventsRow';
import { TodayBar } from '@/components/TodayBar';
import { LatestStrip } from '@/components/blog/LatestStrip';
import { allPosts } from '@/lib/posts';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);

  const links = (linksData.items as Link[]).slice().sort((a, b) => b.priority - a.priority);
  const latestPosts = allPosts().slice(0, 3);

  return (
    <>
      <TopBanner ads={adsData as never} />
      <TodayBar />
      <Header locale={lang} brand={m['site.name']} status={`${links.length} sites`} />
      <FullWidthPromo />
      <main className="flex-1">
        <EventsRow events={adsData.slots.events as never} inhouse={adsData.inhouse.events as never} />
        <Directory links={links} posts={allPosts()} messages={m} locale={lang} />
        <LatestStrip posts={latestPosts} locale={lang} />
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

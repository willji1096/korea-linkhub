'use client';

import { useState } from 'react';
import { getPhoto, thumbSrc } from '@/lib/photos';

type TopAd = { id: string; message: string; cta?: string; url?: string };
type HeroAd = {
  id: string;
  url: string;
  alt: string;
  image: { mobile: string; tablet: string; desktop: string };
};
type LeaderboardAd = { id: string; url: string; alt: string; image: { mobile: string; desktop: string } };
type SponsorAd = { id: string; name: string; url: string; logo?: string };

type AdsData = {
  slots: { top: TopAd[]; hero: HeroAd[]; leaderboard?: LeaderboardAd[]; sponsorship: SponsorAd[] };
  inhouse: {
    top: { message: string; cta: string; url: string };
    hero: { eyebrow: string; title: string; body: string; cta: string; url: string };
    sponsorship: { label: string; note: string };
  };
};

export function TopBanner({ ads }: { ads: AdsData }) {
  const [dismissed, setDismissed] = useState(false);
  const live = ads.slots.top[0];
  if (dismissed || !live) return null;
  const showing = live;
  const isSponsored = true;
  return (
    <div className="hairline-b bg-[var(--bg-sunken)]">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-5 py-2 text-sm sm:px-8">
        <span className="caps text-[var(--ink-subtle)]">{isSponsored ? 'SPONSORED' : 'NOTICE'}</span>
        <span className="min-w-0 flex-1 truncate text-[var(--ink-muted)]">{showing.message}</span>
        {showing.cta && showing.url && (
          <a href={showing.url} className="shrink-0 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
            {showing.cta} →
          </a>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 text-base text-[var(--ink-subtle)] hover:text-[var(--ink)]"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/*
 * Banner system — see docs/BANNERS.md.
 * Billboards never stretch edge to edge: the creative is capped at the content
 * width (max-w-7xl) and switches aspect ratio per breakpoint, so wide screens
 * don't crop it into a thin strip.
 *   < 640px   2:1   asset 750×375
 *   640–1023  3:1   asset 1536×512
 *   ≥ 1024    4:1   asset 2432×608
 */
const BILLBOARD_BOX =
  'relative block aspect-[2/1] w-full overflow-hidden rounded-[var(--radius-lg)] sm:aspect-[3/1] lg:aspect-[4/1]';

type BillboardCopy = { title: string; accent: string; body: string };

export function Billboard({ ads, copy }: { ads: AdsData; copy: BillboardCopy }) {
  const live = ads.slots.hero[0];
  return (
    <section aria-label={live ? 'Sponsored' : undefined} className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 sm:pt-6">
      {live ? <SponsorBillboard ad={live} /> : <HouseBillboard copy={copy} />}
    </section>
  );
}

function SponsorBillboard({ ad }: { ad: HeroAd }) {
  return (
    <a href={ad.url} target="_blank" rel="noopener noreferrer sponsored" className={`${BILLBOARD_BOX} bg-[var(--bg-sunken)]`}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={ad.image.desktop} />
        <source media="(min-width: 640px)" srcSet={ad.image.tablet} />
        <img src={ad.image.mobile} alt={ad.alt} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
      </picture>
      <span className="caps absolute right-3 top-3 rounded-[var(--radius-pill)] bg-black/55 px-2 py-0.5 text-[10px] text-white">
        SPONSORED
      </span>
    </a>
  );
}

// House banner: text is live HTML (translatable, never cropped) over a real photo,
// darkened on the left so the words stay readable at every width.
function HouseBillboard({ copy }: { copy: BillboardCopy }) {
  const photo = getPhoto('gyeongbokgung-palace');
  return (
    <div className={`${BILLBOARD_BOX} bg-[#1b2230]`}>
      {photo && (
        <img
          src={photo.src}
          srcSet={`${thumbSrc(photo)} 720w, ${photo.src} 1459w`}
          sizes="(min-width: 1280px) 1216px, 100vw"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[60%_45%]"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,16,24,0.78)_0%,rgba(12,16,24,0.5)_45%,rgba(12,16,24,0)_80%)]" aria-hidden />
      <div className="relative flex h-full max-w-[72%] flex-col justify-center gap-2 pl-5 sm:max-w-[55%] sm:gap-3 sm:pl-10 lg:pl-14">
        <h2 className="text-[22px] font-semibold leading-[1.05] tracking-[-0.03em] text-white min-[360px]:text-[26px] sm:text-[40px] lg:text-[56px]">
          {copy.title}
          <br />
          <span className="text-[#a8c8ff]">{copy.accent}</span>
        </h2>
        <p className="text-[12px] leading-snug text-white/85 min-[360px]:text-[13px] sm:text-base">{copy.body}</p>
      </div>
      {photo && (
        <a
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-0 right-0 inline-flex min-h-8 items-center rounded-tl-[var(--radius-sm)] bg-black/40 px-2 text-[10px] leading-none text-white/80 hover:underline"
        >
          Photo: {photo.author} · {photo.license}
        </a>
      )}
    </div>
  );
}

/*
 * Leaderboard — standard IAB sizes, so the same slot can take a direct sponsor
 * image now or a programmatic ad later. The box reserves its size up front to
 * avoid layout shift, and renders nothing when empty.
 *   < 768px   320×100 (large mobile banner)   asset 640×200
 *   ≥ 768px   728×90  (leaderboard)            asset 1456×180
 */
export function Leaderboard({ ads }: { ads: AdsData }) {
  const ad = ads.slots.leaderboard?.[0];
  if (!ad) return null;
  return (
    <aside aria-label="Advertisement" className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <p className="caps mb-2 text-center text-[10px] text-[var(--ink-subtle)]">ADVERTISEMENT</p>
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mx-auto block h-[100px] w-[320px] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] md:h-[90px] md:w-[728px]"
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={ad.image.desktop} />
          <img src={ad.image.mobile} alt={ad.alt} className="h-full w-full object-cover" loading="lazy" />
        </picture>
      </a>
    </aside>
  );
}

export function SponsorshipStrip({ ads }: { ads: AdsData }) {
  const sponsors = ads.slots.sponsorship;
  if (sponsors.length === 0) return null;
  return (
    <section className="bg-[var(--bg-sunken)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="caps text-[var(--ink-muted)]">{ads.inhouse.sponsorship.label}</h2>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {sponsors.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="surface surface-hover flex h-20 items-center justify-center rounded-xl px-4 text-center text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

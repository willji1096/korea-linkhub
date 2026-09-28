'use client';

import { useState } from 'react';

type TopAd = { id: string; message: string; cta?: string; url?: string };
type HeroAd = { id: string; eyebrow?: string; title: string; body?: string; cta: string; url: string; logo?: string };
type SponsorAd = { id: string; name: string; url: string; logo?: string };

type AdsData = {
  slots: { top: TopAd[]; hero: HeroAd[]; sponsorship: SponsorAd[] };
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
 * Billboard: capped at the content width (max-w-7xl), never edge to edge, and it
 * switches aspect ratio per breakpoint so wide screens don't crop it into a strip.
 *   < 640px 2:1 · 640–1023 3:1 · >= 1024 4:1
 * Text is live HTML (translatable, never cropped) over a freely licensed photo.
 */
const PALACE = {
  src: '/photos/gyeongbokgung-palace.jpg',
  thumb: '/photos/sm/gyeongbokgung-palace.jpg',
  author: 'Basile Morin',
  license: 'CC BY-SA 4.0',
  url: 'https://commons.wikimedia.org/wiki/File:Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg',
};

export function Billboard({ copy }: { copy: { title: string; accent: string; body: string } }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 sm:pt-6">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[#1b2230] sm:aspect-[3/1] lg:aspect-[4/1]">
        <img
          src={PALACE.src}
          srcSet={`${PALACE.thumb} 720w, ${PALACE.src} 1459w`}
          sizes="(min-width: 1280px) 1216px, 100vw"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[60%_45%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,16,24,0.78)_0%,rgba(12,16,24,0.5)_45%,rgba(12,16,24,0)_80%)]" aria-hidden />
        <div className="relative flex h-full max-w-[72%] flex-col justify-center gap-2 pl-5 sm:max-w-[55%] sm:gap-3 sm:pl-10 lg:pl-14">
          <h2 className="text-[22px] font-semibold leading-[1.05] tracking-[-0.03em] text-white min-[360px]:text-[26px] sm:text-[40px] lg:text-[56px]">
            {copy.title}
            <br />
            <span className="text-[#a8c8ff]">{copy.accent}</span>
          </h2>
          <p className="text-[12px] leading-snug text-white/85 min-[360px]:text-[13px] sm:text-base">{copy.body}</p>
        </div>
        <a
          href={PALACE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-0 right-0 inline-flex min-h-8 items-center rounded-tl-[var(--radius-sm)] bg-black/40 px-2 text-[10px] leading-none text-white/80 hover:underline"
        >
          Photo: {PALACE.author} · {PALACE.license}
        </a>
      </div>
    </section>
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

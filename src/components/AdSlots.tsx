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
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-2 text-sm sm:px-8">
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

export function FullWidthPromo() {
  return (
    <section aria-label="korea-linkhub" className="hairline-b">
      <div className="relative w-full overflow-hidden bg-[var(--bg-sunken)]">
        <img
          src="/hero-banner.png"
          alt=""
          className="block h-auto max-h-[140px] w-full object-cover object-center sm:max-h-[280px] lg:max-h-[340px]"
          loading="eager"
        />
      </div>
    </section>
  );
}

export function SponsorshipStrip({ ads }: { ads: AdsData }) {
  const sponsors = ads.slots.sponsorship;
  if (sponsors.length === 0) return null;
  return (
    <section className="bg-[var(--bg-sunken)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
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

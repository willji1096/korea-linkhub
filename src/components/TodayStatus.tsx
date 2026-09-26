'use client';

import { useEffect, useState } from 'react';
import { viewFor, type TodayView as View } from '@/lib/today-view';
import type { Place } from '@/lib/places';

// The server sends today's answer in the HTML (readable by search engines and AI);
// the browser then re-works it against Seoul time every minute, so a cached page is never stale.
// null = no reliable answer for today.
function useToday(place: Pick<Place, 'hours' | 'schedule'>, initial: View | null): View | null {
  const [view, setView] = useState<View | null>(initial);
  useEffect(() => {
    const tick = () => setView(viewFor(place));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [place]);
  return view;
}

const DOT = { open: 'bg-[var(--safe)]', soon: 'bg-[var(--warn)]', after: 'bg-[var(--ink-subtle)]', closed: 'bg-[var(--danger)]' };
const BG = { open: 'bg-[var(--safe-soft)]', soon: 'bg-[var(--warn-soft)]', after: 'bg-[var(--bg-sunken)]', closed: 'bg-[var(--danger-soft)]' };

// Small line for cards.
export function TodayChip({ place, initial }: { place: Pick<Place, 'hours' | 'schedule'>; initial: View | null }) {
  const v = useToday(place, initial);
  if (!v) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)]">
      <span className={`inline-block size-1.5 shrink-0 rounded-full ${DOT[v.tone]}`} aria-hidden />
      {v.label}
    </span>
  );
}

// Big answer at the top of a place page.
export function TodayPanel({ place, initial }: { place: Pick<Place, 'hours' | 'schedule'>; initial: View | null }) {
  const v = useToday(place, initial);
  if (!place.schedule) return null;
  if (!v) {
    return (
      <div className="surface p-5">
        <p className="caps text-[var(--ink-subtle)]">Today in Korea</p>
        <p className="mt-1.5 text-sm text-[var(--ink-muted)]">Special schedule today — check the official site before you go.</p>
      </div>
    );
  }
  return (
    <div className={`rounded-[var(--radius-lg)] p-5 ${BG[v.tone]}`}>
      <p className="caps text-[var(--ink-muted)]">Today in Korea</p>
      <p className="mt-1.5 flex items-center gap-2.5 text-xl font-semibold leading-snug text-[var(--ink)]">
        <span className={`inline-block size-2.5 shrink-0 rounded-full ${DOT[v.tone]}`} aria-hidden />
        {v.label}
      </p>
      {v.detail && <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{v.detail}</p>}
      <p className="mt-2 text-xs text-[var(--ink-muted)]">From the official schedule and public holidays. Special closures can still happen.</p>
    </div>
  );
}

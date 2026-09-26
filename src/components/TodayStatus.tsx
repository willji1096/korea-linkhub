'use client';

import { useEffect, useState } from 'react';
import { seoulNow, statusFor, toMinutes, makeDay, type TodayStatus as Status } from '@/lib/today';
import type { Place } from '@/lib/places';

type View = { tone: 'open' | 'soon' | 'closed'; label: string; detail?: string };

// Worked out in the visitor's browser against Seoul time, so a static page is never a day stale.
// undefined = not worked out yet (first paint), null = no reliable answer for today.
function useToday(place: Pick<Place, 'hours' | 'schedule'>): View | null | undefined {
  const [view, setView] = useState<View | null | undefined>(undefined);
  useEffect(() => {
    const tick = () => {
      const { day, minutes } = seoulNow();
      const p = { hours: place.hours ?? undefined, schedule: place.schedule };
      const tomorrow = statusFor(p, makeDay(day.y, day.m, day.d + 1));
      setView(describe(statusFor(p, day), minutes, tomorrow));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [place]);
  return view;
}

// After closing time the useful answer is tomorrow's.
function afterHours(tomorrow: Status | null, closedLabel: string, detail?: string): View {
  if (tomorrow?.state === 'open') return { tone: 'closed', label: `${closedLabel} · opens tomorrow ${tomorrow.open}`, detail };
  if (tomorrow?.state === 'closed') return { tone: 'closed', label: `${closedLabel} · closed tomorrow too`, detail: tomorrow.reason };
  return { tone: 'closed', label: closedLabel, detail };
}

function describe(s: Status | null, now: number, tomorrow: Status | null): View | null {
  if (!s) return null;
  if (s.state === 'closed') return { tone: 'closed', label: 'Closed today', detail: s.reason };
  const open = toMinutes(s.open);
  const close = s.close ? toMinutes(s.close) : null;
  const last = s.lastEntry ? toMinutes(s.lastEntry) : close;
  if (now < open) return { tone: 'soon', label: `Opens today at ${s.open}`, detail: s.note };
  if (close !== null && now >= close) return afterHours(tomorrow, 'Closed now', `Closed at ${s.close} today`);
  if (last !== null && now >= last) return { tone: 'soon', label: `Last entry was ${s.lastEntry}`, detail: `Closes at ${s.close}` };
  const until = s.close ? `Open now · until ${s.close}` : 'Open today';
  const detail = [s.lastEntry && `Last entry ${s.lastEntry}`, s.note].filter(Boolean).join(' · ') || undefined;
  return { tone: 'open', label: until, detail };
}

const DOT = { open: 'bg-[var(--safe)]', soon: 'bg-[var(--warn)]', closed: 'bg-[var(--danger)]' };

// Small line for cards.
export function TodayChip({ place }: { place: Pick<Place, 'hours' | 'schedule'> }) {
  const v = useToday(place);
  if (!v) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)]">
      <span className={`inline-block size-1.5 shrink-0 rounded-full ${DOT[v.tone]}`} aria-hidden />
      {v.label}
    </span>
  );
}

// Big answer at the top of a place page.
export function TodayPanel({ place }: { place: Pick<Place, 'hours' | 'schedule'> }) {
  const v = useToday(place);
  if (!place.schedule) return null;
  if (v === undefined) return <div className="min-h-[108px] rounded-[var(--radius-lg)] bg-[var(--bg-sunken)]" aria-hidden />;
  if (!v) {
    return (
      <div className="surface p-5">
        <p className="caps text-[var(--ink-subtle)]">Today in Korea</p>
        <p className="mt-1.5 text-sm text-[var(--ink-muted)]">Special schedule today — check the official site before you go.</p>
      </div>
    );
  }
  const bg = v.tone === 'open' ? 'bg-[var(--safe-soft)]' : v.tone === 'soon' ? 'bg-[var(--warn-soft)]' : 'bg-[var(--danger-soft)]';
  return (
    <div className={`rounded-[var(--radius-lg)] p-5 ${bg}`}>
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

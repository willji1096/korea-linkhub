'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { seoulNow } from '@/lib/today';
import { viewFor, type TodayKind, type TodayView } from '@/lib/today-view';
import type { Place } from '@/lib/places';

type LivePlace = Pick<Place, 'id' | 'name_en' | 'hours' | 'schedule'>;
type Photo = { src: string; srcSet: string; url: string; credit: string };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ORDER: Record<TodayKind | 'check', number> = { closing: 0, open: 1, later: 2, 'no-entry': 3, after: 4, closed: 5, check: 6 };
const DOT = { open: 'bg-[var(--safe)]', soon: 'bg-[var(--warn)]', after: 'bg-[var(--ink-subtle)]', closed: 'bg-[var(--danger)]' };
const TEXT = { open: 'text-[var(--safe)]', soon: 'text-[var(--warn)]', after: 'text-[var(--ink-muted)]', closed: 'text-[var(--danger)]' };

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
// Row text: the status, then the one detail that matters ("opens tomorrow 09:00", "Chuseok").
function lines(v: TodayView): [string, string | undefined] {
  const [first, ...rest] = v.label.split(' · ');
  return [first, rest.length ? rest.join(' · ') : v.detail?.split(' · ')[0]];
}
const earliest = (labels: string[]) => labels.map((l) => l.match(/\d{2}:\d{2}/)?.[0]).filter(Boolean).sort()[0];

// The home status board. The server renders it for `serverNow` (so the HTML already has the
// answer); the browser then re-works every place against Seoul time twice a minute.
export function LiveNow({
  places,
  serverNow,
  locale,
  title,
  holidayLine,
  photo,
  aside,
  events,
}: {
  places: LivePlace[];
  serverNow: number;
  locale: string;
  title: string;
  holidayLine: string | null;
  photo: Photo | null;
  aside: ReactNode;
  // Confirmed events on now, by place id (e.g. night viewing) — shown when the day hours are over.
  events: Record<string, string>;
}) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const at = new Date(now);
  const { day, minutes } = seoulNow(at);
  const rows = places
    .map((p) => ({ p, v: viewFor(p, at) }))
    .sort((a, b) => ORDER[a.v?.kind ?? 'check'] - ORDER[b.v?.kind ?? 'check'] || a.p.name_en.localeCompare(b.p.name_en));
  const of = (k: TodayKind) => rows.filter((r) => r.v?.kind === k).map((r) => r.v as TodayView);
  const openN = of('open').length + of('closing').length;
  const closingN = of('closing').length;
  const later = of('later');
  const after = of('after');
  const closedN = of('closed').length;

  let head: string;
  let sub: string | null = null;
  if (openN > 0) {
    head = `${openN} of ${places.length} open now`;
    sub = closingN > 0 ? `Last entry within the hour at ${closingN}` : later.length > 0 ? `${later.length} more open later today` : null;
  } else if (of('no-entry').length > 0) {
    head = 'Last entry has passed';
    sub = `${of('no-entry').length} places still open until closing, no new visitors`;
  } else if (later.length > 0) {
    head = 'Opening soon';
    sub = `${later.length} places open today from ${earliest(later.map((v) => v.label))}`;
  } else {
    head = 'Closed for the night';
    const tomorrow = after.filter((v) => v.label.includes('opens tomorrow'));
    if (tomorrow.length > 0) sub = `${tomorrow.length} open again tomorrow from ${earliest(tomorrow.map((v) => v.label))}`;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#1b2230]">
        {photo && (
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="(min-width: 1280px) 1216px, 100vw"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[60%_45%]"
            loading="eager"
          />
        )}
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,16,24,0.9)_0%,rgba(12,16,24,0.7)_55%,rgba(12,16,24,0.35)_100%)]"
          aria-hidden
        />
        <div className="relative px-5 pb-12 pt-6 sm:px-10 sm:pb-14 sm:pt-9 lg:px-14">
          <h1 className="caps text-[#a8c8ff]">{title}</h1>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-white/80">
            <span className="text-sm">Seoul</span>
            <time className="num text-2xl font-semibold text-white sm:text-3xl" dateTime={at.toISOString()}>
              {hhmm(minutes)}
            </time>
            <span className="num text-sm">
              {WEEKDAYS[day.wd]} {day.d} {MONTHS[day.m - 1]}
            </span>
          </p>
          <p className="mt-4 text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px] lg:text-[64px]">{head}</p>
          {sub && <p className="mt-2 text-base text-white/85 sm:text-lg">{sub}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {holidayLine && (
              <span className="inline-flex min-h-8 items-center rounded-[var(--radius-sm)] bg-[#a8c8ff]/20 px-2.5 text-sm text-white">{holidayLine}</span>
            )}
            {closedN > 0 && (
              <span className="inline-flex min-h-8 items-center rounded-[var(--radius-sm)] bg-white/12 px-2.5 text-sm text-white">
                {closedN} closed all day
              </span>
            )}
          </div>
        </div>
        {photo && (
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-0 right-0 inline-flex min-h-8 items-center rounded-tl-[var(--radius-sm)] bg-black/40 px-2 text-[10px] leading-none text-white/80 hover:underline"
          >
            Photo: {photo.credit}
          </a>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="surface p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-semibold text-[var(--ink)]">Right now</h2>
            <a href={`/${locale}/places`} className="-my-3 inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[var(--accent)] hover:underline">
              All places →
            </a>
          </div>
          <ul className="mt-1 divide-y divide-[var(--line)]">
            {rows.map(({ p, v }) => (
              <li key={p.id}>
                <a href={`/${locale}/places/${p.id}`} className="group flex min-h-11 items-start justify-between gap-3 py-2.5">
                  <span className="flex min-w-0 items-start gap-2.5">
                    <span className={`mt-[7px] inline-block size-2 shrink-0 rounded-full ${v ? DOT[v.tone] : 'bg-[var(--warn)]'}`} aria-hidden />
                    <span className="text-sm font-medium leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">{p.name_en}</span>
                  </span>
                  <span className="max-w-[55%] shrink-0 text-right">
                    <span className={`block text-sm font-medium leading-snug ${v ? TEXT[v.tone] : 'text-[var(--warn)]'}`}>
                      {v ? lines(v)[0] : 'Check official site'}
                    </span>
                    <span className="block text-xs leading-snug text-[var(--ink-subtle)]">{v ? lines(v)[1] : 'Special schedule today'}</span>
                    {events[p.id] && v?.kind !== 'open' && (
                      <span className="block text-xs font-medium leading-snug text-[var(--accent)]">{events[p.id]}</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        {aside}
      </div>
    </>
  );
}

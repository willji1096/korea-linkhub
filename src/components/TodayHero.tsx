import holidayData from '@/data/holidays.json';
import linksData from '@/data/links.json';
import { PLACES } from '@/lib/places';
import { getPhoto, thumbSrc } from '@/lib/photos';
import { seoulNow } from '@/lib/today';
import { changesByTime, dateRange, relativeTo, KIND_LABEL } from '@/lib/changes';
import { lastLinkCheck } from '@/lib/checks';
import { LiveNow } from './LiveNow';

const NAMES = holidayData.names as Record<string, string>;
const HOLIDAY_SET = new Set(Object.values(holidayData.years as Record<string, string[]>).flat());

const QUICK = [
  { n: '112', label: 'Police' },
  { n: '119', label: 'Fire & ambulance' },
  { n: '1330', label: 'Travel helpline · 24/7 · English' },
];

const KIND_TONE = {
  closed: 'text-[var(--danger)]',
  'part-closed': 'text-[var(--warn)]',
  free: 'text-[var(--safe)]',
  hours: 'text-[var(--accent)]',
  event: 'text-[var(--accent)]',
};

// Home first screen: Korea right now. Seoul time, what is open this minute, what changed,
// and when the official sources were last checked — all from real data, nothing decorative.
export async function TodayHero({ locale, title }: { locale: string; title: string }) {
  const { day } = seoulNow();
  const check = await lastLinkCheck();
  const holiday = HOLIDAY_SET.has(day.iso) ? (NAMES[day.iso] ?? 'Public holiday') : null;

  const changes = changesByTime().filter((c) => c.when !== 'ended');
  const inEffect = changes.filter((c) => c.when === 'now');
  // What the holiday means for a visitor, when a confirmed change says so (e.g. free entry).
  const holidayFree = holiday ? inEffect.find((c) => c.kind === 'free') : undefined;
  const holidayLine = holiday ? `${holiday}${holidayFree ? ` · ${holidayFree.title_en.replace(/^[^:]+:\s*/, '')}` : ''}` : null;
  // The ones on now (ending soonest first) plus the next one coming, so people can plan.
  const next = changes.find((c) => c.when === 'soon');
  const top = next ? [...inEffect.slice(0, 3), next] : changes.slice(0, 4);

  const events = Object.fromEntries(
    inEffect.filter((c) => c.kind === 'event').flatMap((c) => c.place_ids.map((id) => [id, `${c.title_en} · ${dateRange(c)}`])),
  );
  const photo = getPhoto('gyeongbokgung-palace');
  const places = PLACES.filter((p) => p.schedule).map(({ id, name_en, hours, schedule }) => ({ id, name_en, hours, schedule }));

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 sm:pt-6">
      <a
        href={`/${locale}/how-we-check`}
        className="mb-3 flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--safe-soft)] px-3.5 py-2 text-sm leading-snug text-[var(--ink)] hover:underline"
      >
        <span className="live-dot shrink-0" aria-hidden />
        <span className="min-w-0">
          {check?.today ? (
            <>
              <strong className="font-semibold">Checked today {check.time} KST</strong> · {linksData.items.length} official links opened
            </>
          ) : (
            <>
              <strong className="font-semibold">Checked every morning at 09:00 KST</strong> against {linksData.items.length} official sources
            </>
          )}
        </span>
        <span aria-hidden className="ml-auto shrink-0 text-[var(--accent)]">
          →
        </span>
      </a>

      <LiveNow
        places={places}
        serverNow={Date.now()}
        locale={locale}
        title={title}
        holidayLine={holidayLine}
        events={events}
        photo={photo ? { src: photo.src, srcSet: `${thumbSrc(photo)} 720w, ${photo.src} 1459w`, url: photo.url, credit: `${photo.author} · ${photo.license}` } : null}
        aside={
          <section className="surface p-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-semibold text-[var(--ink)]">What changed</h2>
              <a href={`/${locale}/changes`} className="-my-3 inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[var(--accent)] hover:underline">
                All {changes.length} →
              </a>
            </div>
            <ul className="mt-1 divide-y divide-[var(--line)]">
              {top.map((c) => {
                const rel = relativeTo(c, day.iso);
                return (
                  <li key={c.id}>
                    <a href={`/${locale}/changes#${c.id}`} className="group block min-h-11 py-2.5">
                      <span className="flex flex-wrap items-baseline gap-x-2 text-xs">
                        <span className={`font-semibold ${KIND_TONE[c.kind]}`}>{KIND_LABEL[c.kind]}</span>
                        {rel && <span className="font-medium text-[var(--ink)]">{rel}</span>}
                        <span className="num text-[var(--ink-subtle)]">{dateRange(c)}</span>
                      </span>
                      <span className="mt-0.5 block text-sm font-medium leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">{c.title_en}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        }
      />

      <ul className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <li key={q.n}>
            <a href={`tel:${q.n}`} className="surface surface-hover inline-flex min-h-11 items-center gap-2 px-3 text-sm">
              <span className="num font-semibold text-[var(--ink)]">{q.n}</span>
              <span className="text-[var(--ink-muted)]">{q.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

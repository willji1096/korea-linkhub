import holidayData from '@/data/holidays.json';
import { PLACES } from '@/lib/places';
import { getPhoto, thumbSrc } from '@/lib/photos';
import { seoulNow, statusFor } from '@/lib/today';
import { changesByTime, dateRange, KIND_LABEL } from '@/lib/changes';

const NAMES = holidayData.names as Record<string, string>;
const HOLIDAY_SET = new Set(Object.values(holidayData.years as Record<string, string[]>).flat());

const BADGE = {
  closed: { label: 'Closed', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]' },
  partly: { label: 'Partly', cls: 'bg-[var(--warn-soft)] text-[var(--warn)]' },
  check: { label: 'Check', cls: 'bg-[var(--bg-sunken)] text-[var(--ink-muted)]' },
};

const QUICK = [
  { n: '112', label: 'Police' },
  { n: '119', label: 'Fire & ambulance' },
  { n: '1330', label: 'Travel helpline · 24/7 · English' },
];

// Home first screen: the state of Korea today, worked out on the server from the
// official schedules (so it is in the HTML for search engines and AI), refreshed every 30 min.
export function TodayHero({ locale, copy }: { locale: string; copy: { title: string; accent: string } }) {
  const { day } = seoulNow();
  const holiday = HOLIDAY_SET.has(day.iso) ? (NAMES[day.iso] ?? 'Public holiday') : null;
  const dateStr = new Date(`${day.iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

  const tracked = PLACES.filter((p) => p.schedule).map((p) => ({ p, s: statusFor({ hours: p.hours ?? undefined, schedule: p.schedule }, day) }));
  const open = tracked.filter((t) => t.s?.state === 'open');
  const closed = tracked.flatMap((t) => (t.s?.state === 'closed' ? [{ p: t.p, reason: t.s.reason }] : []));
  const partly = open.flatMap((t) => (t.s?.state === 'open' && t.s.note ? [{ p: t.p, reason: t.s.note }] : []));
  // No answer from the schedule = a special day we could not confirm; say so rather than count it as open.
  const unsure = tracked.flatMap((t) => (t.s ? [] : [{ p: t.p, reason: 'Special schedule today — check the official site' }]));
  const notes = [
    ...closed.map((c) => ({ ...c, tone: 'closed' as const })),
    ...partly.map((c) => ({ ...c, tone: 'partly' as const })),
    ...unsure.map((c) => ({ ...c, tone: 'check' as const })),
  ];

  const changes = changesByTime().filter((c) => c.when !== 'ended');
  const inEffect = changes.filter((c) => c.when === 'now');
  const nowCount = inEffect.length;
  // Two that are on now (ending soonest first) plus the next one coming, so people can plan.
  const next = changes.find((c) => c.when === 'soon');
  const top = next ? [...inEffect.slice(0, 2), next] : changes.slice(0, 3);
  const photo = getPhoto('gyeongbokgung-palace');

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 sm:pt-6">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#1b2230]">
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
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,16,24,0.86)_0%,rgba(12,16,24,0.62)_55%,rgba(12,16,24,0.25)_100%)]"
          aria-hidden
        />
        <div className="relative px-5 pb-12 pt-6 sm:px-10 sm:pb-14 sm:pt-10 lg:px-14">
          <p className="text-sm text-white/80">
            <span className="num">{dateStr}</span>
            {holiday && <span className="text-[#a8c8ff]"> · Public holiday · {holiday}</span>}
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[44px] lg:text-[56px]">
            {copy.title} <span className="text-[#a8c8ff]">{copy.accent}</span>
          </h1>
          <ul className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            <Stat href={`/${locale}/places`} n={open.length} unit={`of ${tracked.length}`} label="places open today" />
            <Stat href={`/${locale}/places`} n={closed.length} label="closed today" />
            <Stat href={`/${locale}/changes`} n={nowCount} label="changes in effect" />
          </ul>
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <h2 className="font-semibold text-[var(--ink)]">Closed or different today</h2>
          {notes.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-muted)]">Every place we track is open on its normal schedule today.</p>
          ) : (
            <ul className="mt-2 divide-y divide-[var(--line)]">
              {notes.map(({ p, reason, tone }) => (
                <li key={p.id}>
                  <a href={`/${locale}/places/${p.id}`} className="group flex min-h-11 items-start gap-3 py-2.5">
                    <span className={`mt-0.5 shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium ${BADGE[tone].cls}`}>
                      {BADGE[tone].label}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)]">{p.name_en}</span>
                      <span className="block text-xs leading-snug text-[var(--ink-muted)]">{reason}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-semibold text-[var(--ink)]">What changed</h2>
            <a href={`/${locale}/changes`} className="-my-3 inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[var(--accent)] hover:underline">
              All {changes.length} →
            </a>
          </div>
          <ul className="mt-2 divide-y divide-[var(--line)]">
            {top.map((c) => (
              <li key={c.id}>
                <a href={`/${locale}/changes#${c.id}`} className="group block min-h-11 py-2.5">
                  <span className="block text-xs text-[var(--ink-subtle)]">
                    <span className="font-medium text-[var(--ink-muted)]">{KIND_LABEL[c.kind]}</span> · <span className="num">{dateRange(c)}</span>
                  </span>
                  <span className="block text-sm font-medium leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">{c.title_en}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

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

function Stat({ href, n, unit, label }: { href: string; n: number; unit?: string; label: string }) {
  return (
    <li>
      <a href={href} className="flex min-h-11 items-baseline gap-1.5 rounded-[var(--radius-sm)] bg-white/12 px-3 py-2 text-white backdrop-blur-sm hover:bg-white/20">
        <span className="num text-xl font-semibold">{n}</span>
        {unit && <span className="num text-sm text-white/70">{unit}</span>}
        <span className="text-sm text-white/85">{label}</span>
      </a>
    </li>
  );
}

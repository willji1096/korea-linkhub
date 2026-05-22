type EventAd = {
  id: string;
  title: string;
  meta?: string;
  url: string;
  badge?: string;
};

type Inhouse = { label: string; note: string };

export function EventsRow({ events, inhouse }: { events: EventAd[]; inhouse: Inhouse }) {
  if (events.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="caps text-[var(--ink-muted)]">{inhouse.label}</h2>
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {events.map((e) => (
          <a
            key={e.id}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="surface surface-hover flex w-[260px] shrink-0 flex-col gap-2 rounded-xl p-4 sm:w-[300px]"
          >
            <div className="flex items-center justify-between">
              {e.badge && <span className="caps text-[var(--accent)]">{e.badge}</span>}
              <span className="caps text-[var(--ink-faint)]">SPONSORED</span>
            </div>
            <div className="text-sm font-semibold leading-snug text-[var(--ink)] sm:text-base">{e.title}</div>
            {e.meta && <div className="num text-xs text-[var(--ink-muted)]">{e.meta}</div>}
          </a>
        ))}
      </div>
    </section>
  );
}

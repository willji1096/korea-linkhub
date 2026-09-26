import { KIND_LABEL, dateRange, type Timed } from '@/lib/changes';
import { getPlace, formatDate } from '@/lib/places';
import { ExternalIcon } from '@/components/ExternalIcon';

const TONE: Record<Timed['kind'], string> = {
  closed: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  'part-closed': 'bg-[var(--warn-soft)] text-[var(--warn)]',
  free: 'bg-[var(--safe-soft)] text-[var(--safe)]',
  hours: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  event: 'bg-[var(--accent-soft)] text-[var(--accent)]',
};

const WHEN: Record<Timed['when'], string> = { now: 'Now', soon: 'Coming up', later: 'Later', ended: 'Ended' };

// One dated change: what, when, where, and the official notice it comes from.
export function ChangeCard({ c, locale, compact = false }: { c: Timed; locale: string; compact?: boolean }) {
  const places = c.place_ids.map((id) => getPlace(id)).filter((p) => p !== undefined);
  return (
    <article id={c.id} className="surface flex h-full scroll-mt-20 flex-col p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className={`rounded-[var(--radius-sm)] px-1.5 py-0.5 font-medium ${TONE[c.kind]}`}>{KIND_LABEL[c.kind]}</span>
        <span className="num font-medium text-[var(--ink)]">{dateRange(c)}</span>
        {c.when !== 'now' && <span className="text-[var(--ink-subtle)]">· {WHEN[c.when]}</span>}
      </div>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-[var(--ink)]">{c.title_en}</h3>
      {!compact && <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{c.detail_en}</p>}
      <p className="mt-2 flex flex-wrap gap-x-3 text-sm">
        {places.slice(0, compact ? 2 : 6).map((p) => (
          <a key={p.id} href={`/${locale}/places/${p.id}`} className="-my-1.5 inline-flex min-h-8 items-center text-[var(--accent)] hover:underline">
            {p.name_en}
          </a>
        ))}
        {compact && places.length > 2 && <span className="inline-flex min-h-8 items-center text-[var(--ink-subtle)]">+{places.length - 2}</span>}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 pt-3 text-xs text-[var(--ink-subtle)]">
        <span>Checked {formatDate(c.checked)}</span>
        <a href={c.source} target="_blank" rel="noopener noreferrer" className="-my-2 inline-flex min-h-8 items-center gap-1 text-[var(--accent)] hover:underline">
          Official notice <ExternalIcon size={10} />
        </a>
      </div>
      {!compact && c.missed_by && c.missed_by.length > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-[var(--ink-subtle)]">
          Not shown on{' '}
          {c.missed_by.map((m, i) => (
            <span key={m.url}>
              {i > 0 && ' or '}
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-strong)] underline-offset-2 hover:text-[var(--ink-muted)]">
                {m.name}
              </a>
            </span>
          ))}{' '}
          when we checked.
        </p>
      )}
    </article>
  );
}

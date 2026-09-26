import { LEARN, KIND_LABEL } from '@/lib/learn';
import { LearnCover } from './LearnCover';
import { SectionHeader, HOME_SECTION } from './SectionHeader';

// Home entry point to the "Learn Korea" reads.
export function LearnRow({ locale }: { locale: string }) {
  if (LEARN.length === 0) return null;
  return (
    <section className={HOME_SECTION}>
      <SectionHeader title="Learn Korea" sub="Five-minute reads: how things work here, and why." href={`/${locale}/learn`} />
      <div className="no-scrollbar -mx-5 mt-5 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {LEARN.map((c) => (
          <a
            key={c.id}
            href={`/${locale}/learn/${c.id}`}
            className="surface surface-hover flex w-[260px] shrink-0 flex-col overflow-hidden rounded-xl sm:w-[300px]"
          >
            <LearnCover card={c} className="aspect-[16/9]" />
            <span className="flex flex-col p-4">
              <span className="caps text-[var(--ink-subtle)]">{KIND_LABEL[c.kind]} · {c.read_min} min</span>
              <span className="mt-2 text-[15px] font-medium leading-snug text-[var(--ink)]">{c.title_en}</span>
              <span className="mt-2 line-clamp-2 text-sm leading-snug text-[var(--ink-muted)]">{c.summary_en}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

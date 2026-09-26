import { SITUATIONS } from '@/lib/situations';
import { SectionHeader, HOME_SECTION } from './SectionHeader';

// Home entry point to the "what to do" pages. Emergency gets its own colour so it is found first.
export function HelpRow({ locale }: { locale: string }) {
  if (SITUATIONS.length === 0) return null;
  return (
    <section className={HOME_SECTION}>
      <SectionHeader title="Something went wrong?" sub="Step by step, with Korean you can show staff." href={`/${locale}/help`} />
      <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {SITUATIONS.map((s) => {
          const urgent = s.id === 'emergency';
          return (
            <li key={s.id}>
              <a
                href={`/${locale}/help/${s.id}`}
                className={`flex h-full min-h-[84px] flex-col justify-between gap-2 rounded-xl p-4 transition-colors ${
                  urgent
                    ? 'bg-[var(--danger-soft)] hover:bg-[#fde4e4]'
                    : 'surface surface-hover'
                }`}
              >
                <span className={`text-[15px] font-semibold leading-snug ${urgent ? 'text-[var(--danger)]' : 'text-[var(--ink)]'}`}>
                  {s.title_en}
                </span>
                <span className="hidden text-sm leading-snug text-[var(--ink-muted)] sm:line-clamp-2">{s.summary_en}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

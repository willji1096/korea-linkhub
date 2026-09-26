import { PLACES, categoryLabel } from '@/lib/places';
import { getPhoto, thumbSrc } from '@/lib/photos';
import { TodayChip } from './TodayStatus';
import { SectionHeader, HOME_SECTION } from './SectionHeader';

const SIGHTS = ['palace', 'shrine', 'museum'];

// Home entry point to the place pages — sights only; offices live on /places.
export function PlacesRow({ locale }: { locale: string }) {
  const sights = PLACES.filter((p) => SIGHTS.includes(p.category)).slice(0, 8);
  return (
    <section className={HOME_SECTION}>
      <SectionHeader title="Palaces & museums" sub="Open today? Hours checked against each official site." href={`/${locale}/places`} linkLabel="All places" />
      <div className="no-scrollbar -mx-5 mt-5 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {sights.map((p) => {
          const photo = getPhoto(p.id);
          return (
            <a
              key={p.id}
              href={`/${locale}/places/${p.id}`}
              className="surface surface-hover flex w-[240px] shrink-0 flex-col overflow-hidden rounded-xl sm:w-[260px]"
            >
              {photo && (
                <img
                  src={thumbSrc(photo)}
                  alt=""
                  title={`Photo: ${photo.author} · ${photo.license}`}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              )}
              <span className="flex flex-1 flex-col p-4">
                <span className="caps text-[var(--ink-subtle)]">{categoryLabel(p.category)}</span>
                <span className="mt-2 text-[15px] font-medium leading-snug text-[var(--ink)]">{p.name_en}</span>
                <span className="mt-0.5 text-sm text-[var(--ink-muted)]" lang="ko">
                  {p.name_ko}
                </span>
                {p.schedule ? (
                <span className="mt-auto pt-3">
                  <TodayChip place={{ hours: p.hours, schedule: p.schedule }} />
                </span>
              ) : (
                p.closed_en[0] && (
                  <span className="mt-3 line-clamp-2 text-xs leading-snug text-[var(--ink-muted)]">Closed: {p.closed_en[0]}</span>
                )
              )}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

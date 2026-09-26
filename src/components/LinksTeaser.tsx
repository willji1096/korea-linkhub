import { SectionHeader, HOME_SECTION } from './SectionHeader';

type Link = { category: string };

// Home shows the topics; the full, searchable list lives on /links.
const ORDER = ['visa', 'transport', 'health', 'money', 'esim', 'safety', 'official', 'living', 'tools', 'tourism', 'attractions', 'region', 'events', 'stay', 'news'];

export function LinksTeaser({ links, locale, labels }: { links: Link[]; locale: string; labels: Record<string, string> }) {
  const counts = new Map<string, number>();
  links.forEach((l) => counts.set(l.category, (counts.get(l.category) ?? 0) + 1));
  const cats = ORDER.filter((c) => counts.has(c));
  return (
    <section className={HOME_SECTION}>
      <SectionHeader
        title="Official links"
        sub={`${links.length} official Korean websites for foreigners, by topic.`}
        href={`/${locale}/links`}
        linkLabel={`All ${links.length}`}
      />
      <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {cats.map((c) => (
          <li key={c}>
            <a
              href={`/${locale}/links?cat=${c}`}
              className="surface surface-hover flex min-h-12 items-center justify-between gap-2 rounded-xl px-4 py-3"
            >
              <span className="text-sm font-medium text-[var(--ink)]">{labels[`category.${c}`] ?? c}</span>
              <span className="num text-xs text-[var(--ink-subtle)]">{counts.get(c)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

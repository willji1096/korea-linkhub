import situationsData from '@/data/situations.json';

type LinkRef = { label_en: string; href: string };

export type Situation = {
  id: string;
  title_en: string;
  title_ko: string;
  summary_en: string;
  steps: {
    title_en: string;
    body_en: string;
    show_staff_ko?: string;
    show_staff_en?: string;
    links: LinkRef[];
  }[];
  help: LinkRef[];
  sources: { field: string; url: string }[];
  last_verified: string;
  confidence: 'verified' | 'partial';
};

export const SITUATIONS = situationsData.items as Situation[];

export function getSituation(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}

// Internal links in the data are locale-free ("/places#immigration").
export function localHref(href: string, locale: string): string {
  return href.startsWith('/') ? `/${locale}${href}` : href;
}

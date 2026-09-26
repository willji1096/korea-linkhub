import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/locales';
import { PLACES, siteUrl } from '@/lib/places';
import linksData from '@/data/links.json';
import { SITUATIONS } from '@/lib/situations';
import { LEARN } from '@/lib/learn';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return LOCALES.flatMap((lang) => [
    { url: `${base}/${lang}`, lastModified: linksData.updatedAt, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${base}/${lang}/places`, changeFrequency: 'daily' as const, priority: 0.9 },
    ...PLACES.map((p) => ({
      url: `${base}/${lang}/places/${p.id}`,
      lastModified: p.last_verified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${base}/${lang}/getting-around`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/${lang}/links`, lastModified: linksData.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/${lang}/help`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/${lang}/learn`, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...LEARN.map((c) => ({
      url: `${base}/${lang}/learn/${c.id}`,
      lastModified: c.last_verified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...SITUATIONS.map((s) => ({
      url: `${base}/${lang}/help/${s.id}`,
      lastModified: s.last_verified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]);
}

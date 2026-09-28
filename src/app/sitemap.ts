import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/locales';
import { siteUrl } from '@/lib/site';
import linksData from '@/data/links.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return LOCALES.flatMap((lang) => [
    { url: `${base}/${lang}`, lastModified: linksData.updatedAt, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${base}/${lang}/request`, changeFrequency: 'monthly' as const, priority: 0.3 },
  ]);
}

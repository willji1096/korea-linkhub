import placesData from '@/data/places.json';
import type { HourMatch, Schedule } from './today';

export type Hours = {
  days: string;
  open: string;
  close: string | null;
  last_entry: string | null;
  season: string | null;
  match?: HourMatch;
};

export type Place = {
  id: string;
  type: 'place' | 'service';
  category: string;
  name_en: string;
  name_ko: string;
  city: string | null;
  address_en: string | null;
  address_ko: string | null;
  jurisdiction_en?: string | null;
  transit_en: string | null;
  hours: Hours[] | null;
  closed_en: string[];
  schedule?: Schedule;
  admission_en?: string | null;
  english_tour_en?: string | null;
  languages?: string[] | null;
  booking_required: boolean | null;
  booking_note_en: string | null;
  official_url_en: string | null;
  official_url_ko: string | null;
  booking_url: string | null;
  phone: string | null;
  tips_en: string[];
  sources: { field: string; url: string }[];
  last_verified: string;
  confidence: 'verified' | 'partial';
};

export const PLACES = placesData.items as Place[];

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

// Order = how a visitor scans the list: sights first, then offices and help.
export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'palace', label: 'Palaces' },
  { id: 'shrine', label: 'Shrines' },
  { id: 'museum', label: 'Museums' },
  { id: 'immigration', label: 'Immigration offices' },
  { id: 'support-center', label: 'Support centers' },
  { id: 'helpline', label: 'Helplines' },
  { id: 'police', label: 'Police & lost items' },
];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

// "26 Sep 2026" — fixed format so server and client agree.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// First dialable number in a phone field like "1345 (in Korea, no area code); …".
export function telHref(phone: string): string | null {
  const m = phone.match(/\+?\d[\d-]{2,}/);
  return m ? `tel:${m[0]}` : null;
}

export function mapLinks(addressKo: string) {
  const q = encodeURIComponent(addressKo);
  return [
    { label: 'Naver Map', url: `https://map.naver.com/p/search/${q}` },
    { label: 'Kakao Map', url: `https://map.kakao.com/link/search/${q}` },
    { label: 'Google Maps', url: `https://www.google.com/maps/search/?api=1&query=${q}` },
  ];
}

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3107';
}

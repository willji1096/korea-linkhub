import changesData from '@/data/changes.json';
import { seoulNow } from './today';

// "What changed" — dated, official-source changes to places (see src/data/changes.json).
export type Change = {
  id: string;
  place_ids: string[];
  kind: 'closed' | 'part-closed' | 'free' | 'hours' | 'event';
  title_en: string;
  detail_en: string;
  from: string | null;
  to: string | null;
  checked: string;
  source: string;
  missed_by?: { name: string; url: string }[];
};

export const CHANGES = changesData.items as Change[];

export const KIND_LABEL: Record<Change['kind'], string> = {
  closed: 'Closed',
  'part-closed': 'Partly closed',
  free: 'Free entry',
  hours: 'Hours changed',
  event: 'Event',
};

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Among changes in effect, the one ending soonest matters most (you can still catch it).
const byEnd = (a: Change, b: Change) => (a.to ?? '9999').localeCompare(b.to ?? '9999');

export type Timed = Change & { when: 'now' | 'soon' | 'later' | 'ended' };

// Sorted for a visitor: happening now, then starting within two weeks, then later; ended last.
export function changesByTime(now = new Date()): Timed[] {
  const today = seoulNow(now).day.iso;
  const soon = addDays(today, 14);
  const rank = { now: 0, soon: 1, later: 2, ended: 3 };
  return CHANGES.map((c): Timed => {
    const started = !c.from || c.from <= today;
    const ended = c.to !== null && c.to < today;
    const when = ended ? 'ended' : started ? 'now' : c.from! <= soon ? 'soon' : 'later';
    return { ...c, when };
  }).sort((a, b) => rank[a.when] - rank[b.when] || (a.when === 'now' ? byEnd(a, b) : (a.from ?? '').localeCompare(b.from ?? '')));
}

export function changesFor(placeId: string, now = new Date()): Timed[] {
  return changesByTime(now).filter((c) => c.place_ids.includes(placeId) && c.when !== 'ended');
}

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function dateRange(c: Change): string {
  if (c.from && c.to) return c.from === c.to ? fmt(c.from) : `${fmt(c.from)} – ${fmt(c.to)}`;
  if (c.from) return `From ${fmt(c.from)}`;
  if (c.to) return `Until ${fmt(c.to)}`;
  return '';
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

// The change measured against today: "Ends tomorrow", "Starts in 4 days".
export function relativeTo(c: Timed, today: string): string | null {
  if (c.when === 'now') {
    if (!c.to) return null;
    const n = daysBetween(today, c.to);
    return n === 0 ? 'Ends today' : n === 1 ? 'Ends tomorrow' : n <= 14 ? `Ends in ${n} days` : null;
  }
  if (c.when === 'ended' || !c.from) return null;
  const n = daysBetween(today, c.from);
  return n === 1 ? 'Starts tomorrow' : `Starts in ${n} days`;
}

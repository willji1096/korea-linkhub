import { seoulNow, statusFor, toMinutes, makeDay, type TodayStatus as Status } from './today';
import type { Place } from './places';

// Plain-words answer to "can I go today?", shared by the server (so search engines and
// AI see it in the HTML) and the browser (which refreshes it every minute).
export type TodayView = { tone: 'open' | 'soon' | 'closed'; label: string; detail?: string };

export function viewFor(place: Pick<Place, 'hours' | 'schedule'>, now = new Date()): TodayView | null {
  const { day, minutes } = seoulNow(now);
  const p = { hours: place.hours ?? undefined, schedule: place.schedule };
  const tomorrow = statusFor(p, makeDay(day.y, day.m, day.d + 1));
  return describe(statusFor(p, day), minutes, tomorrow);
}

// After closing time the useful answer is tomorrow's.
function afterHours(tomorrow: Status | null, closedLabel: string, detail?: string): TodayView {
  if (tomorrow?.state === 'open') return { tone: 'closed', label: `${closedLabel} · opens tomorrow ${tomorrow.open}`, detail };
  if (tomorrow?.state === 'closed') return { tone: 'closed', label: `${closedLabel} · closed tomorrow too`, detail: tomorrow.reason };
  return { tone: 'closed', label: closedLabel, detail };
}

function describe(s: Status | null, now: number, tomorrow: Status | null): TodayView | null {
  if (!s) return null;
  if (s.state === 'closed') return { tone: 'closed', label: 'Closed today', detail: s.reason };
  const open = toMinutes(s.open);
  const close = s.close ? toMinutes(s.close) : null;
  const last = s.lastEntry ? toMinutes(s.lastEntry) : close;
  if (now < open) return { tone: 'soon', label: `Opens today at ${s.open}`, detail: s.note };
  if (close !== null && now >= close) return afterHours(tomorrow, 'Closed now', `Closed at ${s.close} today`);
  if (last !== null && now >= last) return { tone: 'soon', label: `Last entry was ${s.lastEntry}`, detail: `Closes at ${s.close}` };
  const until = s.close ? `Open now · until ${s.close}` : 'Open today';
  const detail = [s.lastEntry && `Last entry ${s.lastEntry}`, s.note].filter(Boolean).join(' · ') || undefined;
  return { tone: 'open', label: until, detail };
}


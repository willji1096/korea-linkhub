import { seoulNow, statusFor, toMinutes, makeDay, type TodayStatus as Status } from './today';
import type { Place } from './places';

// Plain-words answer to "can I go today?", shared by the server (so search engines and
// AI see it in the HTML) and the browser (which refreshes it every minute).
// kind says where the place is in its day; tone is the colour:
//   open = green, soon = amber (opens later / last entry soon or passed), after = grey (normal end of day),
//   closed = red (a real closed day).
export type TodayKind = 'open' | 'closing' | 'no-entry' | 'later' | 'after' | 'closed';
export type TodayView = { kind: TodayKind; tone: 'open' | 'soon' | 'after' | 'closed'; label: string; detail?: string };

export function viewFor(place: Pick<Place, 'hours' | 'schedule'>, now = new Date()): TodayView | null {
  const { day, minutes } = seoulNow(now);
  const p = { hours: place.hours ?? undefined, schedule: place.schedule };
  const tomorrow = statusFor(p, makeDay(day.y, day.m, day.d + 1));
  return describe(statusFor(p, day), minutes, tomorrow);
}

// "38 min", "2 h 10 min"
export function duration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// After closing time the useful answer is tomorrow's.
function afterHours(tomorrow: Status | null, closedLabel: string, detail?: string): TodayView {
  if (tomorrow?.state === 'open') return { kind: 'after', tone: 'after', label: `${closedLabel} · opens tomorrow ${tomorrow.open}`, detail };
  if (tomorrow?.state === 'closed') return { kind: 'after', tone: 'after', label: `${closedLabel} · closed tomorrow too`, detail: tomorrow.reason };
  return { kind: 'after', tone: 'after', label: closedLabel, detail };
}

function describe(s: Status | null, now: number, tomorrow: Status | null): TodayView | null {
  if (!s) return null;
  if (s.state === 'closed') return { kind: 'closed', tone: 'closed', label: 'Closed today', detail: s.reason };
  const open = toMinutes(s.open);
  const close = s.close ? toMinutes(s.close) : null;
  const last = s.lastEntry ? toMinutes(s.lastEntry) : close;
  if (now < open) {
    const detail = [`In ${duration(open - now)}`, s.note].filter(Boolean).join(' · ');
    return { kind: 'later', tone: 'soon', label: `Opens today at ${s.open}`, detail };
  }
  if (close !== null && now >= close) return afterHours(tomorrow, 'Closed now', `Closed at ${s.close} today`);
  if (last !== null && now >= last) return { kind: 'no-entry', tone: 'soon', label: `Last entry was ${s.lastEntry}`, detail: `Closes at ${s.close}` };
  if (last !== null && last - now <= 60) {
    const detail = [`Closes at ${s.close}`, s.note].filter(Boolean).join(' · ');
    return { kind: 'closing', tone: 'soon', label: `Last entry in ${duration(last - now)}`, detail };
  }
  const until = s.close ? `Open now · until ${s.close}` : 'Open today';
  const detail = [s.lastEntry && `Last entry ${s.lastEntry}`, s.note].filter(Boolean).join(' · ') || undefined;
  return { kind: 'open', tone: 'open', label: until, detail };
}

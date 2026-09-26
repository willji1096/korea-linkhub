import holidayData from '@/data/holidays.json';

// "Open today?" worked out from each place's official schedule (places.json `hours[].match` + `schedule`).
// When a rule is unclear for a day, the answer is null ("check before you go") — never a guess.

export type HourMatch = {
  wd?: number[]; // 0 = Sunday
  months?: number[];
  nth?: number; // 1 = first, 2 = second, -1 = last weekday of the month
  holiday?: boolean;
  last_wed?: boolean;
  from?: string;
  to?: string;
  note?: string;
  skip?: boolean;
};

export type Schedule = {
  closed_dates?: string[];
  check_dates?: string[];
  closed_rules?: { wd: number; nth?: number; if_holiday: 'next' | 'open' }[];
  partial?: { wd: number; nth: number; months: number[]; note: string }[];
  partial_range?: { from: string; to: string; note: string }[];
};

type Hours = { open: string; close: string | null; last_entry?: string | null; match?: HourMatch };

export type TodayStatus =
  | { state: 'open'; open: string; close: string | null; lastEntry?: string | null; note?: string }
  | { state: 'closed'; reason: string };

const HOLIDAYS = holidayData.years as Record<string, string[]>;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type Day = { iso: string; y: number; m: number; d: number; wd: number };

export function makeDay(y: number, m: number, d: number): Day {
  const t = new Date(Date.UTC(y, m - 1, d));
  return {
    iso: t.toISOString().slice(0, 10),
    y: t.getUTCFullYear(),
    m: t.getUTCMonth() + 1,
    d: t.getUTCDate(),
    wd: t.getUTCDay(),
  };
}

const addDays = (day: Day, n: number) => makeDay(day.y, day.m, day.d + n);

// Today's date and time in Seoul, wherever the visitor's phone is.
export function seoulNow(now = new Date()): { day: Day; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { day: makeDay(+parts.year, +parts.month, +parts.day), minutes: +parts.hour * 60 + +parts.minute };
}

const isHoliday = (day: Day) => HOLIDAYS[day.y]?.includes(day.iso) ?? false;

function isNth(day: Day, nth: number): boolean {
  if (nth > 0) return Math.ceil(day.d / 7) === nth;
  return addDays(day, 7).m !== day.m; // last
}

// Does a weekly/monthly closing rule fall on `day` itself (before any holiday shift)?
function ruleHits(rule: { wd: number; nth?: number }, day: Day) {
  return day.wd === rule.wd && (rule.nth === undefined || isNth(day, rule.nth));
}

function ruleName(r: { wd: number; nth?: number }): string {
  const name = DAY_NAMES[r.wd];
  if (r.nth === undefined) return `${name}s`;
  return `the ${r.nth === -1 ? 'last' : ['first', 'second', 'third', 'fourth'][r.nth - 1]} ${name} of the month`;
}

function closedByRule(schedule: Schedule, day: Day): { closed: boolean; shiftedOpen: boolean; reason?: string } {
  let shiftedOpen = false;
  for (const r of schedule.closed_rules ?? []) {
    if (ruleHits(r, day)) {
      if (!isHoliday(day)) return { closed: true, shiftedOpen, reason: `Closed on ${ruleName(r)}` };
      shiftedOpen = true; // holiday on the closing day: open today
      continue;
    }
    // "If the closing day is a holiday, close the next non-holiday day instead."
    if (r.if_holiday === 'next' && !isHoliday(day)) {
      let prev = addDays(day, -1);
      while (isHoliday(prev) && !ruleHits(r, prev)) prev = addDays(prev, -1);
      if (ruleHits(r, prev) && isHoliday(prev)) {
        // walk forward from the holiday closing day to the first non-holiday day
        let next = addDays(prev, 1);
        while (isHoliday(next)) next = addDays(next, 1);
        if (next.iso === day.iso) {
          return { closed: true, shiftedOpen, reason: `Closed today instead of the ${DAY_NAMES[prev.wd]} public holiday` };
        }
      }
    }
  }
  return { closed: false, shiftedOpen };
}

function matches(m: HourMatch, day: Day, ignoreWeekday: boolean): number {
  if (m.skip) return -1;
  if (m.months && !m.months.includes(day.m)) return -1;
  if (m.from && day.iso < m.from) return -1;
  if (m.to && day.iso > m.to) return -1;
  const lastWed = day.wd === 3 && isNth(day, -1);
  const special = (m.holiday && isHoliday(day)) || (m.last_wed && lastWed);
  if (m.nth !== undefined) {
    if (!isNth(day, m.nth) || !m.wd?.includes(day.wd)) return -1;
    return 3;
  }
  if (special) return 2;
  if (!ignoreWeekday && !(m.wd?.includes(day.wd) ?? true)) return -1;
  return m.from || m.to ? 1 : 0;
}

function pickHours(hours: Hours[], day: Day, ignoreWeekday: boolean): Hours | null {
  let best: Hours | null = null;
  let score = -1;
  for (const h of hours) {
    if (!h.match) continue;
    const s = matches(h.match, day, ignoreWeekday);
    if (s > score) {
      best = h;
      score = s;
    }
  }
  return best;
}

export function statusFor(place: { hours?: Hours[]; schedule?: Schedule }, day: Day): TodayStatus | null {
  const { hours, schedule } = place;
  if (!hours?.length || !schedule || !HOLIDAYS[day.y]) return null;
  if (schedule.check_dates?.includes(day.iso)) return null;
  if (schedule.closed_dates?.includes(day.iso)) {
    return { state: 'closed', reason: isHoliday(day) ? 'Closed for the public holiday' : 'Closed today' };
  }
  const rule = closedByRule(schedule, day);
  if (rule.closed) return { state: 'closed', reason: rule.reason ?? 'Closed today' };

  const h = pickHours(hours, day, false) ?? (rule.shiftedOpen ? pickHours(hours, day, true) : null);
  if (!h) return null;
  const partial =
    schedule.partial?.find((p) => ruleHits(p, day) && isNth(day, p.nth) && p.months.includes(day.m)) ??
    schedule.partial_range?.find((p) => day.iso >= p.from && day.iso <= p.to);
  return { state: 'open', open: h.open, close: h.close, lastEntry: h.last_entry, note: partial?.note ?? h.match?.note };
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

import holidayData from '@/data/holidays.json';
import { seoulNow } from '@/lib/today';

type Holiday = { date: string; name: string };

// One list for the whole site (also used by "open today"), dated in Seoul time.
const NAMES = holidayData.names as Record<string, string>;
const HOLIDAYS: Holiday[] = Object.values(holidayData.years as Record<string, string[]>)
  .flat()
  .sort()
  .map((date) => ({ date, name: NAMES[date] ?? 'Public holiday' }));
type WeatherSnap = { tempC: number; desc: string } | null;

async function getRate(): Promise<number | null> {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW', { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = (await r.json()) as { rates: { KRW: number } };
    return d.rates.KRW;
  } catch {
    return null;
  }
}

async function getWeather(): Promise<WeatherSnap> {
  try {
    const r = await fetch('https://wttr.in/Seoul?format=j1', {
      next: { revalidate: 1800 },
      headers: { 'User-Agent': 'curl/8 jigeum-korea' },
    });
    if (!r.ok) return null;
    const d = (await r.json()) as {
      current_condition: Array<{ temp_C: string; weatherDesc: Array<{ value: string }> }>;
    };
    const c = d.current_condition?.[0];
    if (!c) return null;
    return {
      tempC: parseInt(c.temp_C, 10),
      desc: c.weatherDesc?.[0]?.value ?? '',
    };
  } catch {
    return null;
  }
}


const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export async function TodayBar() {
  const [rate, weather] = await Promise.all([getRate(), getWeather()]);
  const today = seoulNow().day;
  const todayHoliday = HOLIDAYS.find((h) => h.date === today.iso) ?? null;
  const upcoming = HOLIDAYS.find((h) => h.date > today.iso) ?? null;

  const dateStr = new Date(`${today.iso}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="hairline-b bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-xs text-[var(--ink-muted)] sm:gap-x-4">
          <span className="caps text-[var(--ink-subtle)]">Today</span>
          <span className="num text-[var(--ink)]">{dateStr}</span>

          {weather && (
            <span className="flex items-center gap-1.5">
              <Dot />
              Seoul <span className="num text-[var(--ink)]">{weather.tempC}°C</span>
              <span className="hidden sm:inline">· {weather.desc}</span>
            </span>
          )}

          {rate && (
            <span className="flex items-center gap-1.5">
              <Dot />
              <span className="hidden sm:inline">1 USD = </span>
              <span className="num text-[var(--ink)]">{Math.round(rate).toLocaleString()}</span>
              <span>KRW/USD</span>
            </span>
          )}

          {todayHoliday ? (
            <span className="flex items-center gap-1.5 text-[var(--accent)]">
              <Dot />
              Public holiday · {todayHoliday.name}
            </span>
          ) : upcoming ? (
            <span className="hidden items-center gap-1.5 sm:flex">
              <Dot />
              Next holiday <span className="num text-[var(--ink)]">{shortDate(upcoming.date)}</span> · {upcoming.name}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="text-[var(--ink-faint)]">·</span>;
}

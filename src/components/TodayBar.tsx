type Holiday = { date: string; name: string };

const HOLIDAYS_2026: Holiday[] = [
  { date: '01-01', name: "New Year's Day" },
  { date: '02-16', name: 'Lunar New Year (Seollal)' },
  { date: '02-17', name: 'Lunar New Year' },
  { date: '02-18', name: 'Lunar New Year' },
  { date: '03-01', name: 'Independence Movement Day' },
  { date: '05-05', name: "Children's Day" },
  { date: '05-24', name: 'Buddha’s Birthday' },
  { date: '06-06', name: 'Memorial Day' },
  { date: '08-15', name: 'Liberation Day' },
  { date: '09-24', name: 'Chuseok (Mid-Autumn)' },
  { date: '09-25', name: 'Chuseok' },
  { date: '09-26', name: 'Chuseok' },
  { date: '10-03', name: 'National Foundation Day' },
  { date: '10-09', name: 'Hangul Day' },
  { date: '12-25', name: 'Christmas Day' },
];

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
      headers: { 'User-Agent': 'curl/8 korea-linkhub' },
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

function holidayToday(): Holiday | null {
  const now = new Date();
  const md = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return HOLIDAYS_2026.find((h) => h.date === md) ?? null;
}

function nextHoliday(): Holiday | null {
  const now = new Date();
  const md = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return HOLIDAYS_2026.find((h) => h.date > md) ?? HOLIDAYS_2026[0];
}

export async function TodayBar() {
  const [rate, weather] = await Promise.all([getRate(), getWeather()]);
  const todayHoliday = holidayToday();
  const upcoming = nextHoliday();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="hairline-b bg-[var(--bg)]">
      <div className="no-scrollbar mx-auto w-full max-w-6xl overflow-x-auto px-5 sm:px-8">
        <div className="flex min-w-max items-center gap-4 py-2 text-xs text-[var(--ink-muted)]">
          <span className="caps text-[var(--ink-subtle)]">Today</span>
          <span className="num text-[var(--ink)]">{dateStr}</span>

          {weather && (
            <>
              <Dot />
              <span>
                Seoul <span className="num text-[var(--ink)]">{weather.tempC}°C</span> · {weather.desc}
              </span>
            </>
          )}

          {rate && (
            <>
              <Dot />
              <span>
                1 USD = <span className="num text-[var(--ink)]">{Math.round(rate).toLocaleString()}</span> KRW
              </span>
            </>
          )}

          {todayHoliday ? (
            <>
              <Dot />
              <span className="text-[var(--accent)]">Public holiday · {todayHoliday.name}</span>
            </>
          ) : upcoming ? (
            <>
              <Dot />
              <span>
                Next holiday <span className="num text-[var(--ink)]">{upcoming.date}</span> · {upcoming.name}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="text-[var(--ink-faint)]">·</span>;
}

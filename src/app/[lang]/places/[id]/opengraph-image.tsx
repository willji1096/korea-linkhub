import { ImageResponse } from 'next/og';
import { PLACES, getPlace, categoryLabel, formatDate } from '@/lib/places';

// Share card for messengers (WeChat, LINE, WhatsApp, Zalo). English only for now:
// the default OG font has no Hangul, and loading one needs a bundled font file.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Jigeum Korea place card';

export function generateStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

export default async function Image({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { id } = await params;
  const p = getPlace(id);
  const name = p?.name_en ?? 'Jigeum Korea';
  const closed = p?.closed_en[0]?.split(' (')[0];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(100deg,#EEF3FB 0%,#E6EEFB 45%,#D6E6FC 100%)',
          color: '#09090b',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 600 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: 8, background: '#2563eb' }} />
          </div>
          Jigeum Korea
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {p && <div style={{ fontSize: 28, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase' }}>{categoryLabel(p.category)}</div>}
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, marginTop: 12 }}>{name}</div>
          {closed && <div style={{ fontSize: 30, color: '#52525b', marginTop: 20 }}>{`Closed: ${closed.length > 70 ? `${closed.slice(0, 68)}…` : closed}`}</div>}
        </div>
        {p && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: '#16a34a', fontWeight: 600 }}>
            <div style={{ width: 14, height: 14, borderRadius: 14, background: '#16a34a' }} />
            {`Checked ${formatDate(p.last_verified)} against the official site`}
          </div>
        )}
      </div>
    ),
    size,
  );
}

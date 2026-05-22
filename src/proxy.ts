import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';

function negotiateLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language') ?? '';
  const ranges = header.split(',').map((r) => r.split(';')[0]?.trim().toLowerCase()).filter(Boolean);
  for (const range of ranges) {
    const hit = LOCALES.find((l) => l.toLowerCase() === range || l.toLowerCase().startsWith(range + '-') || range.startsWith(l.toLowerCase()));
    if (hit) return hit;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const locale = negotiateLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};

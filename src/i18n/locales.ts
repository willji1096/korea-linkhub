export const LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const PLANNED_LOCALES = ['ja', 'zh-CN', 'ko', 'vi', 'pt-BR', 'es', 'ar'] as const;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export async function getMessages(locale: Locale): Promise<Record<string, string>> {
  const fallback = await import(`@/messages/${DEFAULT_LOCALE}.json`).then((m) => m.default);
  if (locale === DEFAULT_LOCALE) return fallback;
  try {
    const messages = await import(`@/messages/${locale}.json`).then((m) => m.default);
    return { ...fallback, ...messages };
  } catch {
    return fallback;
  }
}

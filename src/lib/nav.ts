// Main menu — the order a visitor needs things: where to go, how to get there,
// what to do when it goes wrong, how things work here, then everything official.
export const NAV = [
  { id: 'places', label: 'Places', short: 'Places', href: '/places' },
  { id: 'getting-around', label: 'Getting around', short: 'Transport', href: '/getting-around' },
  { id: 'help', label: 'What to do', short: 'Help', href: '/help' },
  { id: 'learn', label: 'Learn Korea', short: 'Learn', href: '/learn' },
  { id: 'links', label: 'Official links', short: 'Links', href: '/links' },
] as const;

export function isActive(pathname: string, locale: string, href: string): boolean {
  const full = `/${locale}${href}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

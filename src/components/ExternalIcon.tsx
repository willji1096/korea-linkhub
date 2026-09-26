// Marks a link that leaves the site (opens the official page in a new tab).
// Same arrow as the official-links list, so every outbound link reads the same way.
export function ExternalIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <>
      <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden className={`shrink-0 ${className}`}>
        <path d="M3 11l8-8M5 3h6v6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </>
  );
}

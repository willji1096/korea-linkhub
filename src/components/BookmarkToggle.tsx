'use client';

import { useStored } from './useStored';

export function BookmarkToggle({ id }: { id: string }) {
  const [bookmarks, setBookmarks, ready] = useStored<string[]>('linkhub:bookmarks', []);
  const active = bookmarks.includes(id);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? 'Remove bookmark' : 'Bookmark this link'}
      aria-pressed={active}
      className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-[var(--ink-subtle)] transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--ink)]"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M4 2.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V14L8 11l-4 3V2.5Z"
          fill={active && ready ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

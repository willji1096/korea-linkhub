'use client';

import { useEffect, useRef, useState } from 'react';
import { useStored } from './useStored';

type User = { name: string; email?: string };

export function UserMenu() {
  const [user, setUser, ready] = useStored<User | null>('linkhub:user', null);
  const [bookmarks] = useStored<string[]>('linkhub:bookmarks', []);
  const [open, setOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSigning(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    if (!name) return;
    setUser({ name, email: email || undefined });
    setSigning(false);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-9 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--ink-muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
      >
        {ready && user ? (
          <>
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--ink)] text-[11px] font-semibold text-[var(--ink-inverse)]">
              {initial}
            </span>
            <span className="hidden sm:inline">{user.name}</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M4 2.5a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8V12L7 10l-3 2V2.5Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Save list</span>
          </>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          className="surface absolute right-0 z-40 mt-2 w-72 rounded-xl p-4 shadow-[0_12px_32px_-12px_rgba(9,9,11,0.18)]"
        >
          {user && !signing ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-[var(--ink-inverse)]">
                  {initial}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--ink)]">{user.name}</div>
                  {user.email && (
                    <div className="num truncate text-xs text-[var(--ink-muted)]">{user.email}</div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--bg-sunken)] px-3 py-2">
                <span className="caps text-[var(--ink-muted)]">Saved links</span>
                <span className="num text-sm font-semibold text-[var(--ink)]">{bookmarks.length}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUser(null);
                  setOpen(false);
                }}
                className="caps mt-4 w-full rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] py-2 text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="caps text-[var(--ink-muted)]" htmlFor="user-name">
                  Name
                </label>
                <input
                  id="user-name"
                  name="name"
                  required
                  autoFocus
                  className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="caps text-[var(--ink-muted)]" htmlFor="user-email">
                  Email · optional
                </label>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
              <p className="text-xs leading-relaxed text-[var(--ink-subtle)]">
                Stored on this device only. Used to remember your bookmarks.
              </p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[var(--ink)] py-2 text-sm font-medium text-[var(--ink-inverse)] hover:bg-[var(--accent)]"
                >
                  Sign in
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={() => setSigning(false)}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-muted)]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

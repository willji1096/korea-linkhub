'use client';

import { useState, useTransition } from 'react';
import { submitRequest } from './actions';

const CAT_GROUPS = [
  { label: 'Trip', items: ['tourism', 'region', 'attractions', 'events', 'stay'] },
  { label: 'Move around', items: ['transport', 'esim'] },
  { label: 'Pay & docs', items: ['visa', 'money', 'official'] },
  { label: 'Help', items: ['health', 'safety', 'tools', 'living'] },
  { label: 'Read', items: ['news'] },
] as const;

export function RequestForm() {
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (form: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await submitRequest(form);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error);
      }
    });
  };

  if (submitted) {
    return (
      <div className="surface rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Thanks — your suggestion is in the queue.</h2>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">
          We review every request and add the ones that genuinely help foreigners in Korea.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setError(null);
            }}
            className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-2 text-sm text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
          >
            Suggest another
          </button>
          <a
            href="../"
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--ink-inverse)] hover:bg-[var(--accent)]"
          >
            Back to directory
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="surface flex flex-col gap-4 rounded-2xl p-5 sm:p-6">
      <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset className="flex flex-col gap-2">
        <legend className="caps text-[var(--ink-muted)]">Who are you</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={'cursor-pointer rounded-xl border p-3 transition-colors ' + (role === 'user' ? 'border-[var(--ink)] bg-[var(--bg-sunken)]' : 'border-[var(--line)] hover:border-[var(--line-strong)]')}>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === 'user'}
              onChange={() => setRole('user')}
              className="sr-only"
            />
            <div className="text-sm font-semibold text-[var(--ink)]">A user</div>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">I need this site as a foreigner in Korea.</div>
          </label>
          <label className={'cursor-pointer rounded-xl border p-3 transition-colors ' + (role === 'owner' ? 'border-[var(--ink)] bg-[var(--bg-sunken)]' : 'border-[var(--line)] hover:border-[var(--line-strong)]')}>
            <input
              type="radio"
              name="role"
              value="owner"
              checked={role === 'owner'}
              onChange={() => setRole('owner')}
              className="sr-only"
            />
            <div className="text-sm font-semibold text-[var(--ink)]">I run this site</div>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">We may follow up about placement.</div>
          </label>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="caps text-[var(--ink-muted)]">Site URL</span>
        <input
          name="url"
          type="url"
          required
          placeholder="https://..."
          className="num rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="caps text-[var(--ink-muted)]">Category</span>
        <select
          name="category"
          required
          defaultValue=""
          className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="" disabled>
            Choose closest fit
          </option>
          {CAT_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="other">other</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="caps text-[var(--ink-muted)]">Why foreigners need this</span>
        <textarea
          name="reason"
          required
          rows={3}
          maxLength={600}
          placeholder="E.g. Halal restaurant directory used by Muslim travellers in Seoul."
          className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="caps text-[var(--ink-muted)]">Email · optional</span>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        <span className="text-xs text-[var(--ink-subtle)]">
          We only contact you if we need to clarify or if you flagged yourself as the site owner.
        </span>
      </label>

      {error && (
        <div className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-medium text-[var(--ink-inverse)] transition-colors hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send suggestion'}
        </button>
      </div>
    </form>
  );
}

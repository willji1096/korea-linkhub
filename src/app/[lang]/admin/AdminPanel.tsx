'use client';

import { useState, useTransition } from 'react';
import { upsertPhone, upsertLink, deleteItem, verifyLink, approveRequest, rejectRequest, type ActionResult } from './actions';

export type RequestItem = {
  id: string;
  url: string;
  category: string;
  reason: string;
  email?: string;
  role: 'user' | 'owner';
  createdAt: string;
};

type Localized = { en: string; [key: string]: string | undefined };

type PhoneItem = {
  id: string;
  category: string;
  priority: number;
  number: string;
  name: Localized;
  description?: Localized;
  languages?: string[];
  hours?: string;
  free?: boolean;
};

type LinkItem = {
  id: string;
  category: string;
  priority: number;
  url: string;
  name: Localized;
  description?: Localized;
  languages?: string[];
  verifiedAt?: string;
};

const PHONE_CATS = ['emergency', 'tourist_help', 'embassy', 'transport', 'visa', 'living', 'health'];
const LINK_CATS = ['tourism', 'region', 'attractions', 'visa', 'transport', 'health', 'safety', 'official', 'living', 'tools', 'money', 'esim', 'events', 'stay', 'news'];

export function AdminPanel({
  phones,
  links,
  requests,
}: {
  phones: PhoneItem[];
  links: LinkItem[];
  requests: RequestItem[];
}) {
  const [tab, setTab] = useState<'phones' | 'links' | 'requests'>('links');
  const [editing, setEditing] = useState<PhoneItem | LinkItem | null>(null);
  const [message, setMessage] = useState<string>('');
  const [verifyResults, setVerifyResults] = useState<Record<string, { code: number; ok: boolean }>>({});
  const [, startTransition] = useTransition();

  const handleResult = (result: ActionResult, success: string) => {
    if (result.ok) {
      setMessage(success);
      setEditing(null);
    } else {
      setMessage(`Error: ${result.error}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (kind: 'phones' | 'links', id: string) => {
    if (!confirm(`Delete ${id}?`)) return;
    startTransition(async () => {
      const r = await deleteItem(kind, id);
      handleResult(r, `Deleted ${id}`);
    });
  };

  const handleVerifyAll = async () => {
    setMessage('Verifying all links…');
    const results: Record<string, { code: number; ok: boolean }> = {};
    for (const l of links) {
      const r = await verifyLink(l.url);
      results[l.id] = { code: r.code, ok: r.ok };
    }
    setVerifyResults(results);
    setMessage(`Verified ${links.length} links`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-zinc-500">Dev-only. Writes directly to src/data/*.json.</p>
        </div>
        <a href="../" className="text-sm text-zinc-500 hover:text-zinc-900">← view site</a>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <TabBtn active={tab === 'links'} onClick={() => { setTab('links'); setEditing(null); }}>
          Links · {links.length}
        </TabBtn>
        <TabBtn active={tab === 'phones'} onClick={() => { setTab('phones'); setEditing(null); }}>
          Phones · {phones.length}
        </TabBtn>
        <TabBtn active={tab === 'requests'} onClick={() => { setTab('requests'); setEditing(null); }}>
          Requests · {requests.length}
        </TabBtn>
        {tab === 'links' && (
          <button
            type="button"
            onClick={handleVerifyAll}
            className="ml-auto rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Verify all links
          </button>
        )}
      </div>

      {message && (
        <div className={'mb-4 rounded-md px-3 py-2 text-sm ' + (message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700')}>
          {message}
        </div>
      )}

      {tab !== 'requests' && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {editing ? `Edit ${editing.id}` : `New ${tab === 'phones' ? 'phone' : 'link'}`}
          </h2>
          {tab === 'phones' ? (
            <PhoneForm
              key={editing?.id ?? 'new'}
              initial={editing as PhoneItem | null}
              onSubmit={async (fd) => handleResult(await upsertPhone(fd), `Saved ${fd.get('id')}`)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <LinkForm
              key={editing?.id ?? 'new'}
              initial={editing as LinkItem | null}
              onSubmit={async (fd) => handleResult(await upsertLink(fd), `Saved ${fd.get('id')}`)}
              onCancel={() => setEditing(null)}
            />
          )}
        </div>
      )}

      {tab === 'requests' ? (
        <ul className="flex flex-col gap-3">
          {requests.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
              No pending requests. Submissions arrive via the public form at <span className="font-mono">/en/request</span>.
            </li>
          )}
          {requests.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600">{r.category}</span>
                    <span
                      className={
                        'rounded px-1.5 py-0.5 text-[11px] ' +
                        (r.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600')
                      }
                    >
                      {r.role === 'owner' ? 'OWNER' : 'USER'}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">{r.id}</span>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-sm font-semibold text-zinc-900 hover:text-zinc-600"
                  >
                    {r.url}
                  </a>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">{r.reason}</p>
                  {r.email && (
                    <p className="mt-1.5 font-mono text-xs text-zinc-500">{r.email}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => handleResult(await approveRequest(r.id), `Approved ${r.url}`))
                    }
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => handleResult(await rejectRequest(r.id), 'Rejected'))
                    }
                    className="rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
      <ul className="flex flex-col gap-2">
        {(tab === 'phones' ? phones : links).map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-zinc-400">{item.id}</span>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600">{item.category}</span>
                <span className="text-xs text-zinc-400">p{item.priority}</span>
                {tab === 'links' && verifyResults[item.id] && (
                  <span className={'rounded px-1.5 py-0.5 text-[11px] ' + (verifyResults[item.id].ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                    {verifyResults[item.id].code || 'fail'}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-sm font-semibold">{item.name.en}</div>
              <div className="text-xs text-zinc-500">
                {'number' in item ? item.number : item.url}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setEditing(item)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(tab, item.id)}
                className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
        (active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200')
      }
    >
      {children}
    </button>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = 'rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-500';

function PhoneForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: PhoneItem | null;
  onSubmit: (fd: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <form action={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="id" required>
        <input name="id" required defaultValue={initial?.id ?? ''} className={inputClass} placeholder="kebab-slug" />
      </Field>
      <Field label="category" required>
        <select name="category" required defaultValue={initial?.category ?? 'emergency'} className={inputClass}>
          {PHONE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="number" required>
        <input name="number" required defaultValue={initial?.number ?? ''} className={inputClass} placeholder="112 / 1599-7777 / +82-2-..." />
      </Field>
      <Field label="priority (0-100)" required>
        <input name="priority" type="number" min="0" max="100" required defaultValue={initial?.priority ?? 50} className={inputClass} />
      </Field>
      <Field label="name (en)" required>
        <input name="name_en" required defaultValue={initial?.name.en ?? ''} className={inputClass} />
      </Field>
      <Field label="hours">
        <input name="hours" defaultValue={initial?.hours ?? ''} className={inputClass} placeholder="24/7 or Mon-Fri 09-18" />
      </Field>
      <Field label="description (en)">
        <textarea name="description_en" rows={2} defaultValue={initial?.description?.en ?? ''} className={inputClass} />
      </Field>
      <Field label="languages (comma)">
        <input name="languages" defaultValue={initial?.languages?.join(', ') ?? ''} className={inputClass} placeholder="en, ja, zh" />
      </Field>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" name="free" defaultChecked={initial?.free ?? true} />
        <span className="text-xs text-zinc-600">Free</span>
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800">
          {initial ? 'Update' : 'Add'}
        </button>
        {initial && (
          <button type="button" onClick={onCancel} className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function LinkForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: LinkItem | null;
  onSubmit: (fd: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <form action={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="id" required>
        <input name="id" required defaultValue={initial?.id ?? ''} className={inputClass} placeholder="kebab-slug" />
      </Field>
      <Field label="category" required>
        <select name="category" required defaultValue={initial?.category ?? 'official'} className={inputClass}>
          {LINK_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="url" required>
        <input name="url" type="url" required defaultValue={initial?.url ?? ''} className={inputClass + ' sm:col-span-1'} placeholder="https://..." />
      </Field>
      <Field label="priority (0-100)" required>
        <input name="priority" type="number" min="0" max="100" required defaultValue={initial?.priority ?? 50} className={inputClass} />
      </Field>
      <Field label="name (en)" required>
        <input name="name_en" required defaultValue={initial?.name.en ?? ''} className={inputClass} />
      </Field>
      <Field label="languages (comma)">
        <input name="languages" defaultValue={initial?.languages?.join(', ') ?? ''} className={inputClass} placeholder="en, ja, zh" />
      </Field>
      <Field label="description (en)">
        <textarea name="description_en" rows={2} defaultValue={initial?.description?.en ?? ''} className={inputClass + ' sm:col-span-2'} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800">
          {initial ? 'Update' : 'Add'}
        </button>
        {initial && (
          <button type="button" onClick={onCancel} className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

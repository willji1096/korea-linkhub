'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';

type RequestItem = {
  id: string;
  url: string;
  category: string;
  reason: string;
  email?: string;
  role: 'user' | 'owner';
  createdAt: string;
};

const LINK_CATS = ['tourism', 'region', 'attractions', 'visa', 'transport', 'health', 'safety', 'official', 'living', 'tools', 'money', 'esim', 'events', 'stay', 'news', 'other'];

function file(name: 'requests' | 'links') {
  return path.join(process.cwd(), 'src', 'data', `${name}.json`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowId() {
  return `req-${Date.now().toString(36)}`;
}

export type RequestResult = { ok: true } | { ok: false; error: string };

export async function submitRequest(form: FormData): Promise<RequestResult> {
  const url = String(form.get('url') ?? '').trim();
  const category = String(form.get('category') ?? '').trim();
  const reason = String(form.get('reason') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const role = String(form.get('role') ?? 'user').trim() as 'user' | 'owner';
  const honey = String(form.get('hp_field') ?? '').trim();

  if (honey) return { ok: false, error: 'Submission blocked.' };
  if (!url) return { ok: false, error: 'URL is required.' };
  if (!reason) return { ok: false, error: 'Tell us briefly why foreigners need this.' };
  if (reason.length > 600) return { ok: false, error: 'Reason must be under 600 characters.' };
  try {
    new URL(url);
  } catch {
    return { ok: false, error: 'URL is not valid.' };
  }
  if (!LINK_CATS.includes(category)) return { ok: false, error: 'Pick a valid category.' };

  const raw = await fs.readFile(file('requests'), 'utf8').catch(() => null);
  const cat = raw ? (JSON.parse(raw) as { items: RequestItem[]; updatedAt: string }) : { items: [], updatedAt: today() };

  if (cat.items.some((r) => r.url === url)) {
    return { ok: false, error: 'This site has already been requested.' };
  }

  const item: RequestItem = {
    id: nowId(),
    url,
    category,
    reason,
    email: email || undefined,
    role: role === 'owner' ? 'owner' : 'user',
    createdAt: new Date().toISOString(),
  };
  cat.items.unshift(item);
  cat.updatedAt = today();

  await fs.writeFile(file('requests'), JSON.stringify(cat, null, 2) + '\n', 'utf8');
  revalidatePath('/[lang]/admin', 'page');
  return { ok: true };
}

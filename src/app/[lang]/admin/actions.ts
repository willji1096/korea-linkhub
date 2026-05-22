'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';

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

type Catalog<T> = { $schema?: string; updatedAt: string; items: T[] };

const PHONE_CATS = ['emergency', 'tourist_help', 'embassy', 'transport', 'visa', 'living', 'health'] as const;
const LINK_CATS = ['tourism', 'region', 'attractions', 'visa', 'transport', 'health', 'safety', 'official', 'living', 'tools', 'money', 'esim', 'events', 'stay', 'news'] as const;

function dataPath(kind: 'phones' | 'links') {
  return path.join(process.cwd(), 'src', 'data', `${kind}.json`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function devOnly() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Admin actions are disabled in production');
  }
}

async function readCatalog<T>(kind: 'phones' | 'links'): Promise<Catalog<T>> {
  const raw = await fs.readFile(dataPath(kind), 'utf8');
  return JSON.parse(raw) as Catalog<T>;
}

async function writeCatalog<T extends { priority: number }>(kind: 'phones' | 'links', cat: Catalog<T>) {
  cat.updatedAt = today();
  cat.items.sort((a, b) => b.priority - a.priority);
  await fs.writeFile(dataPath(kind), JSON.stringify(cat, null, 2) + '\n', 'utf8');
}

function parseLanguages(value: FormDataEntryValue | null): string[] | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function strOrUndef(value: FormDataEntryValue | null): string | undefined {
  const v = str(value);
  return v || undefined;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertPhone(form: FormData): Promise<ActionResult> {
  devOnly();
  const id = str(form.get('id'));
  const category = str(form.get('category'));
  const priorityRaw = str(form.get('priority'));
  const number = str(form.get('number'));
  const nameEn = str(form.get('name_en'));
  const descEn = str(form.get('description_en'));

  if (!id || !category || !number || !nameEn) return { ok: false, error: 'id, category, number, name_en are required' };
  if (!(PHONE_CATS as readonly string[]).includes(category)) return { ok: false, error: `category must be one of: ${PHONE_CATS.join(', ')}` };
  const priority = Number(priorityRaw);
  if (!Number.isFinite(priority) || priority < 0 || priority > 100) return { ok: false, error: 'priority must be 0-100' };

  const item: PhoneItem = {
    id,
    category,
    priority,
    number,
    name: { en: nameEn },
    description: descEn ? { en: descEn } : undefined,
    languages: parseLanguages(form.get('languages')),
    hours: strOrUndef(form.get('hours')),
    free: form.get('free') === 'on',
  };

  const cat = await readCatalog<PhoneItem>('phones');
  const existing = cat.items.findIndex((i) => i.id === id);
  if (existing >= 0) {
    item.name = { ...cat.items[existing].name, en: nameEn };
    if (descEn) item.description = { ...(cat.items[existing].description ?? { en: '' }), en: descEn };
    cat.items[existing] = item;
  } else {
    cat.items.push(item);
  }
  await writeCatalog('phones', cat);
  revalidatePath('/[lang]/admin', 'page');
  revalidatePath('/[lang]', 'page');
  return { ok: true };
}

export async function upsertLink(form: FormData): Promise<ActionResult> {
  devOnly();
  const id = str(form.get('id'));
  const category = str(form.get('category'));
  const priorityRaw = str(form.get('priority'));
  const url = str(form.get('url'));
  const nameEn = str(form.get('name_en'));
  const descEn = str(form.get('description_en'));

  if (!id || !category || !url || !nameEn) return { ok: false, error: 'id, category, url, name_en are required' };
  if (!(LINK_CATS as readonly string[]).includes(category)) return { ok: false, error: `category must be one of: ${LINK_CATS.join(', ')}` };
  const priority = Number(priorityRaw);
  if (!Number.isFinite(priority) || priority < 0 || priority > 100) return { ok: false, error: 'priority must be 0-100' };
  try {
    new URL(url);
  } catch {
    return { ok: false, error: 'url is not a valid URL' };
  }

  const item: LinkItem = {
    id,
    category,
    priority,
    url,
    name: { en: nameEn },
    description: descEn ? { en: descEn } : undefined,
    languages: parseLanguages(form.get('languages')),
    verifiedAt: today(),
  };

  const cat = await readCatalog<LinkItem>('links');
  const existing = cat.items.findIndex((i) => i.id === id);
  if (existing >= 0) {
    item.name = { ...cat.items[existing].name, en: nameEn };
    if (descEn) item.description = { ...(cat.items[existing].description ?? { en: '' }), en: descEn };
    cat.items[existing] = item;
  } else {
    cat.items.push(item);
  }
  await writeCatalog('links', cat);
  revalidatePath('/[lang]/admin', 'page');
  revalidatePath('/[lang]', 'page');
  return { ok: true };
}

export async function deleteItem(kind: 'phones' | 'links', id: string): Promise<ActionResult> {
  devOnly();
  if (kind === 'phones') {
    const cat = await readCatalog<PhoneItem>('phones');
    cat.items = cat.items.filter((i) => i.id !== id);
    await writeCatalog('phones', cat);
  } else {
    const cat = await readCatalog<LinkItem>('links');
    cat.items = cat.items.filter((i) => i.id !== id);
    await writeCatalog('links', cat);
  }
  revalidatePath('/[lang]/admin', 'page');
  revalidatePath('/[lang]', 'page');
  return { ok: true };
}

type RequestItem = {
  id: string;
  url: string;
  category: string;
  reason: string;
  email?: string;
  role: 'user' | 'owner';
  createdAt: string;
};

async function readRequests() {
  const p = path.join(process.cwd(), 'src', 'data', 'requests.json');
  const raw = await fs.readFile(p, 'utf8').catch(() => null);
  return raw ? (JSON.parse(raw) as { items: RequestItem[]; updatedAt: string }) : { items: [], updatedAt: today() };
}

async function writeRequests(cat: { items: RequestItem[]; updatedAt: string }) {
  const p = path.join(process.cwd(), 'src', 'data', 'requests.json');
  cat.updatedAt = today();
  await fs.writeFile(p, JSON.stringify(cat, null, 2) + '\n', 'utf8');
}

export async function approveRequest(formOrId: FormData | string): Promise<ActionResult> {
  devOnly();
  const id = typeof formOrId === 'string' ? formOrId : String(formOrId.get('id') ?? '');
  if (!id) return { ok: false, error: 'Missing id' };

  const reqCat = await readRequests();
  const item = reqCat.items.find((r) => r.id === id);
  if (!item) return { ok: false, error: 'Request not found' };

  if (!(LINK_CATS as readonly string[]).includes(item.category)) {
    return { ok: false, error: `Category "${item.category}" is not in the link whitelist. Edit before approving.` };
  }

  const linkCat = await readCatalog<LinkItem>('links');
  const slug = (item.url.replace(/^https?:\/\//, '').split('/')[0] ?? '').replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-+|-+$/g, '') || `req-${id}`;
  if (linkCat.items.some((l) => l.id === slug)) {
    return { ok: false, error: `A link with id "${slug}" already exists.` };
  }

  linkCat.items.push({
    id: slug,
    category: item.category,
    priority: 60,
    url: item.url,
    name: { en: slug },
    description: { en: item.reason },
    languages: ['en'],
    verifiedAt: today(),
  });
  await writeCatalog('links', linkCat);

  reqCat.items = reqCat.items.filter((r) => r.id !== id);
  await writeRequests(reqCat);

  revalidatePath('/[lang]/admin', 'page');
  revalidatePath('/[lang]', 'page');
  return { ok: true };
}

export async function rejectRequest(id: string): Promise<ActionResult> {
  devOnly();
  const reqCat = await readRequests();
  reqCat.items = reqCat.items.filter((r) => r.id !== id);
  await writeRequests(reqCat);
  revalidatePath('/[lang]/admin', 'page');
  return { ok: true };
}

type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  relatedLinks?: string[];
  publishedAt: string;
  source?: { name: string; url: string };
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function readPosts() {
  const p = path.join(process.cwd(), 'src', 'data', 'posts.json');
  const raw = await fs.readFile(p, 'utf8').catch(() => null);
  return raw ? (JSON.parse(raw) as { items: Post[]; updatedAt: string }) : { items: [], updatedAt: today() };
}

async function writePosts(cat: { items: Post[]; updatedAt: string }) {
  const p = path.join(process.cwd(), 'src', 'data', 'posts.json');
  cat.updatedAt = today();
  cat.items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  await fs.writeFile(p, JSON.stringify(cat, null, 2) + '\n', 'utf8');
}

export async function upsertPost(form: FormData): Promise<ActionResult> {
  devOnly();
  const title = str(form.get('title'));
  const summary = str(form.get('summary'));
  const body = str(form.get('body'));
  const tagsRaw = str(form.get('tags'));
  const relatedRaw = str(form.get('related'));
  const sourceName = str(form.get('source_name'));
  const sourceUrl = str(form.get('source_url'));
  const editingId = str(form.get('editing_id'));
  const publishedRaw = str(form.get('published_at'));

  if (!title || !summary || !body) return { ok: false, error: 'Title, summary, and body are required.' };

  const tags = tagsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const related = relatedRaw.split(',').map((s) => s.trim()).filter(Boolean);

  const cat = await readPosts();
  const slug = editingId
    ? cat.items.find((p) => p.id === editingId)?.slug ?? slugify(title)
    : slugify(title);
  const id = editingId || slug;

  const item: Post = {
    id,
    slug,
    title,
    summary,
    body,
    tags,
    relatedLinks: related.length ? related : undefined,
    publishedAt: publishedRaw || new Date().toISOString(),
    source: sourceName && sourceUrl ? { name: sourceName, url: sourceUrl } : undefined,
  };

  const idx = cat.items.findIndex((p) => p.id === id);
  if (idx >= 0) {
    cat.items[idx] = item;
  } else {
    if (cat.items.some((p) => p.slug === slug)) {
      return { ok: false, error: `A post with slug "${slug}" already exists.` };
    }
    cat.items.unshift(item);
  }
  await writePosts(cat);
  revalidatePath('/[lang]/admin', 'page');
  revalidatePath('/[lang]', 'page');
  revalidatePath('/[lang]/blog', 'page');
  revalidatePath(`/[lang]/blog/${slug}`, 'page');
  return { ok: true };
}

export async function deletePost(id: string): Promise<ActionResult> {
  devOnly();
  const cat = await readPosts();
  cat.items = cat.items.filter((p) => p.id !== id);
  await writePosts(cat);
  revalidatePath('/[lang]/admin', 'page');
  revalidatePath('/[lang]/blog', 'page');
  return { ok: true };
}

export async function verifyLink(url: string): Promise<{ ok: boolean; code: number; finalUrl?: string }> {
  devOnly();
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'korea-linkhub/0.1 (admin verify)' },
    });
    return { ok: res.ok, code: res.status, finalUrl: res.url };
  } catch {
    return { ok: false, code: 0 };
  }
}

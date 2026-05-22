import { notFound } from 'next/navigation';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import phonesData from '@/data/phones.json';
import linksData from '@/data/links.json';
import { AdminPanel, type RequestItem } from './AdminPanel';

export const dynamic = 'force-dynamic';

async function readRequests(): Promise<RequestItem[]> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'src', 'data', 'requests.json'), 'utf8');
    const parsed = JSON.parse(raw) as { items: RequestItem[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const requests = await readRequests();
  return <AdminPanel phones={phonesData.items as never} links={linksData.items as never} requests={requests} />;
}

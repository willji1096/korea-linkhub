import postsData from '@/data/posts.json';

export type Post = {
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

export function allPosts(): Post[] {
  const items = (postsData.items as Post[]).slice();
  items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return items;
}

export function findPost(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

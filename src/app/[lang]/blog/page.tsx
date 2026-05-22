import { notFound } from 'next/navigation';
import { isLocale, getMessages } from '@/i18n/locales';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TodayBar } from '@/components/TodayBar';
import { PostList } from '@/components/blog/PostList';
import { allPosts } from '@/lib/posts';
import linksData from '@/data/links.json';

export default async function BlogIndex({ params }: PageProps<'/[lang]/blog'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getMessages(lang);
  const posts = allPosts();

  return (
    <>
      <TodayBar />
      <Header locale={lang} brand={m['site.name']} status={`${posts.length} posts`} />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-2 sm:px-8 sm:pt-12">
          <p className="caps text-[var(--ink-subtle)]">korea-linkhub · journal</p>
          <h1 className="mt-2 max-w-3xl text-[28px] font-semibold leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[36px]">
            Field notes for foreigners in Korea.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            Short guides on the things that catch first-timers off guard — visa paperwork, transit cards, hospital lines, where to actually buy a SIM. Hand-edited.
          </p>
        </section>
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pb-20">
          <PostList posts={posts} locale={lang} />
        </section>
      </main>
      <Footer
        brand={m['site.name']}
        disclaimer={m['footer.disclaimer']}
        updatedLabel={m['footer.updated']}
        updatedAt={linksData.updatedAt}
        locale={lang}
      />
    </>
  );
}

// Pagefind's browser library, loaded the first time something searches. The index is a static folder (/pagefind) made
// by `pnpm site:build`, so nothing typed into search leaves the page.

export interface PostHit {
  url: string;
  title: string;
  /** HTML in which Pagefind marks the matches with <mark>; the text comes from our own pages. */
  excerpt: string;
  published?: string;
  tags: string[];
}

interface PagefindResult {
  data(): Promise<{
    url: string;
    excerpt: string;
    meta: { title?: string; published?: string };
    filters?: { tag?: string[] };
  }>;
}
interface Pagefind {
  init(): Promise<void>;
  debouncedSearch(query: string, options?: object, wait?: number): Promise<{ results: PagefindResult[] } | null>;
}

let pagefind: Promise<Pagefind> | undefined;
function load(): Promise<Pagefind> {
  pagefind ??= (async () => {
    const url = '/pagefind/pagefind.js';
    const module = (await import(/* @vite-ignore */ url)) as Pagefind;
    await module.init();
    return module;
  })();
  return pagefind;
}

/**
 * The best posts for a query, or `null` when a newer search replaced this one.
 * Throws when the index is missing, as on the dev server.
 */
export async function searchPosts(query: string, limit = 8, wait = 0): Promise<PostHit[] | null> {
  const found = await (await load()).debouncedSearch(query, {}, wait);
  if (found === null) return null;
  const data = await Promise.all(found.results.slice(0, limit).map((result) => result.data()));
  return data.map((item) => ({
    url: item.url,
    title: item.meta.title ?? item.url,
    excerpt: item.excerpt,
    published: item.meta.published,
    tags: item.filters?.tag ?? [],
  }));
}

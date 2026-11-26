// What the agent may do: read. Each tool reads the published site and nothing else; none writes or reaches another host.
import { searchPosts } from '../scripts/pagefind';

export interface Hit {
  url: string;
  title: string;
  excerpt: string;
}

export interface Tools {
  /** The best posts for a query. */
  searchPosts(query: string): Promise<Hit[]>;
  /** The start of a post's text, from its Markdown copy. */
  getPost(url: string): Promise<string | null>;
  /** The topics, each with how many posts use it. */
  listTopics(): Promise<string[]>;
}

const stripTags = (html: string) => html.replace(/<[^>]*>/g, '');

/** The Markdown copy of a post lives beside it: /posts/2025/slug/ has /posts/2025/slug.md. */
export function markdownAddress(url: string): string {
  return `${url.replace(/\/$/, '')}.md`;
}

export const siteTools: Tools = {
  async searchPosts(query) {
    const hits = (await searchPosts(query, 5)) ?? [];
    return hits.map((hit) => ({ url: hit.url, title: hit.title, excerpt: stripTags(hit.excerpt) }));
  },
  async getPost(url) {
    // Only this site's posts: a path under /posts/, whatever address the model produced.
    const { origin, pathname } = new URL(url, location.origin);
    if (origin !== location.origin || !pathname.startsWith('/posts/')) return null;
    const response = await fetch(markdownAddress(pathname));
    return response.ok ? await response.text() : null;
  },
  async listTopics() {
    const response = await fetch('/assets/posts-index.json');
    const { posts } = (await response.json()) as { posts: { tags: string[] }[] };
    const counts = new Map<string, number>();
    for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).map(([tag, count]) => `${tag} (${count})`);
  },
};

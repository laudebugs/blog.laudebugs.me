import type { APIContext } from 'astro';
import { markdownFor } from '../lib/post-markdown';
import { allPosts } from '../lib/posts';

export async function GET(_context: APIContext) {
  const posts = await allPosts();
  const text = posts.map((post) => markdownFor(post)).join('\n\n---\n\n');
  return new Response(`${text}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

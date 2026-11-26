import type { APIContext } from 'astro';
import { allPosts, postPath } from '../lib/posts';

export async function GET(context: APIContext) {
  const site = context.site as URL;
  const posts = await allPosts();
  const lines = [
    "# Laurence Ininda's blog",
    '',
    '> Field notes on work and projects: AI tooling, agentic building, libraries and applications on web, mobile and desktop.',
    '',
    '## Pages',
    '',
    `- [Archive](${new URL('/archive', site)}): every post, newest first`,
    `- [Topics](${new URL('/topics', site)}): the posts by topic`,
    '',
    '## Posts',
    '',
    ...posts.map((post) => {
      const summary = post.data.summary ? `: ${post.data.summary.replace(/\s+/g, ' ').trim()}` : '';
      return `- [${post.data.title}](${new URL(`${postPath(post)}.md`, site)})${summary}`;
    }),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allPosts, postPath } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await allPosts();
  return rss({
    title: 'Laurence Ininda / blog',
    description: 'Field notes on work and projects: AI tooling, agentic building, libraries and applications.',
    site: context.site as URL,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(`${post.data.publishedOn}T00:00:00Z`),
      description: post.data.summary,
      link: postPath(post),
      categories: post.data.tags,
    })),
    customData: '<language>en</language>',
  });
}

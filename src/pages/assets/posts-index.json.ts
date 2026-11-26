import type { APIContext } from 'astro';
import { postsIndexSchema } from '../../lib/index-schema';
import { allPosts, postPath } from '../../lib/posts';

/** What laudebugs.me reads: five fields per post, newest first. Addresses are absolute because another site reads them. */
export async function GET(context: APIContext) {
  const site = context.site as URL;
  const posts = await allPosts();
  const index = postsIndexSchema.parse({
    version: 1,
    posts: posts.map((post) => ({
      title: post.data.title,
      publishedOn: post.data.publishedOn,
      url: new URL(postPath(post), site).href,
      tags: post.data.tags,
      image: post.data.image ? new URL(`/assets/post-covers/${post.data.image}`, site).href : null,
      imageAlt: post.data.imageDescription,
    })),
  });
  return new Response(JSON.stringify(index, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

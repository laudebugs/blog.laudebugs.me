import type { APIContext } from 'astro';
import { markdownFor } from '../../../lib/post-markdown';
import { allPosts, postYear } from '../../../lib/posts';

export async function getStaticPaths() {
  const posts = await allPosts();
  return posts.map((post) => ({ params: { year: postYear(post), slug: post.data.slug }, props: { post } }));
}

export function GET({ props }: APIContext) {
  return new Response(markdownFor(props.post), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}

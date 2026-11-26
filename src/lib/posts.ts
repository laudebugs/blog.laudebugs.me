import { type CollectionEntry, getCollection } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** The year folder a post lives in. The address of a post is /posts/<year>/<slug>, as on the old site. */
export function postYear(post: Post): string {
  const year = post.filePath?.split('/').at(-2);
  if (!year || !/^\d{4}$/.test(year)) throw new Error(`${post.id}: cannot read the year from ${post.filePath}`);
  return year;
}

export function postPath(post: Post): string {
  return `/posts/${postYear(post)}/${post.data.slug}`;
}

/** Every post, newest first. */
export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.publishedOn.localeCompare(a.data.publishedOn));
}

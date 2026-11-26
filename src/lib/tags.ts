/** Pure helpers for topics and year groups, kept apart from `astro:content` so tests can import them. */

/** The address segment of a topic: lower case, letters and digits, other runs become one hyphen. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Tagged {
  tags: string[];
}

/** Every tag with its post count, most used first and alphabetical among equals. */
export function countTags(posts: Tagged[]): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Groups posts that are already sorted newest first into years, newest year first. */
export function groupByYear<T>(posts: T[], yearOf: (post: T) => string): { year: string; posts: T[] }[] {
  const groups: { year: string; posts: T[] }[] = [];
  for (const post of posts) {
    const year = yearOf(post);
    const last = groups.at(-1);
    if (last?.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
}

/** "28 Jan": the day and month, for rows already grouped under their year. */
export function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

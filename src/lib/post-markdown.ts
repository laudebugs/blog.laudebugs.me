import { postMarkdown } from './markdown';
import type { Post } from './posts';
import { formatDate } from './text';

/** The Markdown copy of one post: its title, a byline line and the text. */
export function markdownFor(post: Post): string {
  const { title, heading, author, publishedOn, tags } = post.data;
  const byline = `_by ${author} on ${formatDate(publishedOn)}${tags.length ? ` · ${tags.join(', ')}` : ''}_`;
  return `# ${heading ?? title}\n\n${byline}\n\n${postMarkdown(post.body ?? '')}`;
}

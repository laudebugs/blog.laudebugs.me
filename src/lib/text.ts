/** Pure text helpers for posts, kept apart from `astro:content` so tests can import them. */

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Turns `code` spans in a heading into <code> elements; everything else is escaped. */
export function headingHtml(text: string): string {
  const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return text
    .split('`')
    .map((part, index) => (index % 2 ? `<code>${escapeHtml(part)}</code>` : escapeHtml(part)))
    .join('');
}

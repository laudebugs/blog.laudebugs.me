import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { moveIndex } from '../src/scripts/search';
import { read } from './helpers/build';

describe('moveIndex', () => {
  it('moves and wraps at both ends', () => {
    expect(moveIndex(-1, 1, 3)).toBe(0);
    expect(moveIndex(-1, -1, 3)).toBe(2);
    expect(moveIndex(2, 1, 3)).toBe(0);
    expect(moveIndex(0, -1, 3)).toBe(2);
    expect(moveIndex(1, 1, 3)).toBe(2);
  });

  it('has nothing to select with no results', () => {
    expect(moveIndex(-1, 1, 0)).toBe(-1);
  });
});

describe('the search index', () => {
  const out = inject('siteDir');

  it('is built next to the site and holds all 21 posts and nothing else', () => {
    expect(existsSync(join(out, 'pagefind/pagefind.js'))).toBe(true);
    expect(readdirSync(join(out, 'pagefind/fragment')).length).toBe(21);
  });

  it('keeps code popups and the Copy button out of the index', () => {
    const post = read(join(out, 'posts/2025/a-more-type-safe-ish-angular-router/index.html'));
    expect(post).toContain('twoslash-popup-container');
    expect(existsSync(join(out, 'pagefind/pagefind-entry.json'))).toBe(true);
  });

  it('has the dialog and a hidden-until-script trigger on every page kind', () => {
    for (const page of [
      'index.html',
      'archive/index.html',
      '404.html',
      'posts/2025/a-more-type-safe-ish-angular-router/index.html',
    ]) {
      const path = existsSync(join(out, page))
        ? join(out, page)
        : join(out, page.replace('404.html', '404/index.html'));
      const html = read(path);
      expect(html, page).toContain('data-search-open');
      expect(html, page).toMatch(/<dialog[^>]*data-search/);
      expect(html, page).toMatch(
        /<button[^>]*data-search-open[^>]*\bhidden\b|<button[^>]*\bhidden\b[^>]*data-search-open/,
      );
    }
  });

  it('offers the archive without JavaScript', () => {
    expect(read(join(out, 'index.html'))).toContain('href="/archive"');
  });
});

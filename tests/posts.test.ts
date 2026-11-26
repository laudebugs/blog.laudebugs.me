import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { postSchema } from '../src/lib/post-schema';
import { files, read } from './helpers/build';

const out = inject('siteDir');

const expected = read(join(__dirname, '../fixtures/addresses.txt')).trim().split('\n');

function postPages(): string[] {
  return files(join(out, 'posts'))
    .filter((file) => file.endsWith('index.html'))
    .map((file) => `/posts/${file.slice(join(out, 'posts').length + 1).replace(/\/index\.html$/, '')}`)
    .sort();
}

describe('the posts', () => {
  it('are served at exactly the addresses of the live site: none missing, none extra', () => {
    expect(postPages()).toEqual(expected);
    expect(expected).toHaveLength(21);
  });

  it('render with one title, the article panel and no leaked Vocs or MDX syntax', () => {
    for (const address of expected) {
      const html = read(join(out, address.slice(1), 'index.html'));
      expect(html.match(/<h1[ >]/g), address).toHaveLength(1);
      expect(html, address).toContain('class="sheet');
      expect(html, address).not.toMatch(/:::(tip|note|info|warning)/);
      expect(html, address).not.toContain('[!include');
      expect(html, address).not.toContain("from 'vocs");
    }
  });

  it('point only at cover files that exist', () => {
    for (const address of expected) {
      const html = read(join(out, address.slice(1), 'index.html'));
      for (const match of html.matchAll(/src="(\/assets\/[^"]+)"/g)) {
        expect(existsSync(join(out, decodeURIComponent(match[1]))), `${address}: ${match[1]}`).toBe(true);
      }
    }
  });
});

describe('the post schema', () => {
  const valid = { title: 'A post', publishedOn: '2026-01-28', slug: 'a-post' };

  it('accepts a minimal post and fills the defaults', () => {
    const post = postSchema.parse(valid);
    expect(post.author).toBe('Laurence Ininda');
    expect(post.tags).toEqual([]);
  });

  it('rejects an unknown or misspelt key', () => {
    expect(() => postSchema.parse({ ...valid, publishedon: '2026-01-28' })).toThrow();
    expect(() => postSchema.parse({ ...valid, imageCreditt: 'x' })).toThrow();
  });

  it('rejects a bad date or slug', () => {
    expect(() => postSchema.parse({ ...valid, publishedOn: '28 Jan 2026' })).toThrow();
    expect(() => postSchema.parse({ ...valid, slug: 'Not Kebab' })).toThrow();
  });
});

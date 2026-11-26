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

describe('cover images', () => {
  it('show once: the layout draws the cover, so a post must not repeat it in its text', () => {
    for (const address of expected) {
      const html = read(join(out, address.slice(1), 'index.html'));
      const covers = [...html.matchAll(/<img[^>]*src="(\/assets\/post-covers\/[^"]+)"/g)].map((match) => match[1]);
      expect(new Set(covers).size, `${address} shows a cover more than once: ${covers.join(', ')}`).toBe(covers.length);
    }
  });
});

describe('code blocks', () => {
  it('leak no notation markers or @error lines into the page', () => {
    for (const address of expected) {
      const html = read(join(out, address.slice(1), 'index.html'));
      expect(html, address).not.toMatch(/\[!code/);
      expect(html, address).not.toMatch(/\/\/ @error:/);
    }
  });

  it('put every block in a frame with a label and a Copy button', () => {
    let blocks = 0;
    for (const address of expected) {
      const html = read(join(out, address.slice(1), 'index.html'));
      // Blocks only: twoslash popups hold their own small <pre class="shiki"> previews.
      // The live examples (`data-example`) are framed by their own figure, not by a code frame.
      const pre =
        (html.match(/<pre class="astro-code/g)?.length ?? 0) - (html.match(/<figure[^>]*data-example/g)?.length ?? 0);
      expect(html.match(/class="code-frame"/g)?.length ?? 0, address).toBe(pre);
      expect(html.match(/class="code-label"/g)?.length ?? 0, address).toBe(pre);
      expect(html.match(/<button[^>]*\bdata-copy\b/g)?.length ?? 0, address).toBe(pre);
      blocks += pre;
    }
    expect(blocks).toBeGreaterThan(100);
  });

  it('run twoslash on the blocks that ask for it, with type popovers', () => {
    const html = read(join(out, 'posts/2025/a-more-type-safe-ish-angular-router/index.html'));
    expect(html).toContain('twoslash-popup-container');
  });

  it('mark the focus, highlight and diff lines', () => {
    expect(read(join(out, 'posts/2026/referencing-viewchild-queries-within-defer-blocks/index.html'))).toContain(
      'class="line focused"',
    );
    expect(
      read(join(out, 'posts/2022/nx-tips-managing-tsconfig-paths-with-multiple-angular-libraries/index.html')),
    ).toContain('class="line diff add"');
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

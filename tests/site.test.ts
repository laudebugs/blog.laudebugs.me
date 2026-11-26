import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { postsIndexSchema } from '../src/lib/index-schema';
import { read } from './helpers/build';

const out = inject('siteDir');
const page = (path: string) => read(join(out, path));
const addresses = read(join(__dirname, '../fixtures/addresses.txt')).trim().split('\n');

describe('listing pages', () => {
  it('lists the latest post on the home page and links to the archive', () => {
    const home = page('index.html');
    expect(home).toContain('/posts/2026/problem-definition-as-the-new-frontier');
    expect(home).toContain('All 21 posts');
  });

  it('lists every post once on the archive, grouped by year', () => {
    const archive = page('archive/index.html');
    for (const address of addresses) expect(archive, address).toContain(`href="${address}"`);
    expect(archive).toContain('All 21 posts since 2020');
    expect(archive.match(/id="y20\d\d"/g)).toHaveLength(7);
  });

  it('has a page for the topics and one for each topic, and counts every tag', () => {
    const topics = page('topics/index.html');
    expect(topics).toContain('href="/topics/angular"');
    expect(page('topics/angular/index.html')).toContain('9 posts');
    expect(page('topics/module-federation/index.html')).toContain('1 post,');
  });

  it('has a 404 page that points back to the archive', () => {
    expect(page('404.html')).toContain('href="/archive"');
  });
});

describe('machine-readable files', () => {
  it('writes posts-index.json in the agreed shape: 21 posts, newest first, absolute addresses', () => {
    const index = postsIndexSchema.parse(JSON.parse(page('assets/posts-index.json')));
    expect(index.posts).toHaveLength(21);
    const dates = index.posts.map((post) => post.publishedOn);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(index.posts[0].url).toBe('https://blog.laudebugs.me/posts/2026/problem-definition-as-the-new-frontier');
    expect(
      index.posts.every(
        (post) => post.image === null || post.image.startsWith('https://blog.laudebugs.me/assets/post-covers/'),
      ),
    ).toBe(true);
  });

  it('writes an RSS feed with every post', () => {
    const rss = page('rss.xml');
    expect(rss.match(/<item>/g)).toHaveLength(21);
    // The RSS package writes addresses with a trailing slash; the site serves both.
    expect(rss).toContain('<link>https://blog.laudebugs.me/posts/2026/the-gap-between-man-and-machine/</link>');
  });

  it('writes a sitemap that includes the posts', () => {
    const sitemap = page('sitemap-0.xml');
    for (const address of addresses) expect(sitemap, address).toContain(`https://blog.laudebugs.me${address}`);
  });

  it('writes llms.txt with a full title for every post, and llms-full.txt with the text', () => {
    const llms = page('llms.txt');
    expect(llms).toContain('[Referencing viewChild queries within defer blocks]');
    for (const address of addresses) expect(llms, address).toContain(`${address}.md`);
    const full = page('llms-full.txt');
    expect(full).toContain('# Referencing `viewChild` queries within `@defer` blocks');
    expect(full).not.toMatch(/:::tip|\[!code|\[!include|from 'vocs/);
  });

  it('writes a Markdown copy of each post and links it from the post page', () => {
    for (const address of addresses) {
      expect(page(`${address.slice(1)}.md`), address).toMatch(/^# /);
      expect(page(`${address.slice(1)}/index.html`), address).toContain(
        `rel="alternate" type="text/markdown" href="${address}.md"`,
      );
    }
  });
});

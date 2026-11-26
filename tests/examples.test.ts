import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { execute } from '../src/runner/execute';

const files = readdirSync('examples').filter((name) => name.endsWith('.ts'));

describe('examples/', () => {
  it('has at least one example', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s prints exactly its recorded output', async (name) => {
    const recorded = join('examples', name.replace(/\.ts$/, '.out.txt'));
    expect(existsSync(recorded), `${recorded} is missing`).toBe(true);
    const result = await execute(readFileSync(join('examples', name), 'utf8'));
    expect(result.ok).toBe(true);
    expect(result.output.trimEnd()).toBe(readFileSync(recorded, 'utf8').trimEnd());
  });

  it('every <Example file="…"> in a post is a file in examples/', () => {
    const years = readdirSync('src/content/posts');
    const used: string[] = [];
    for (const year of years) {
      for (const post of readdirSync(join('src/content/posts', year))) {
        const text = readFileSync(join('src/content/posts', year, post), 'utf8');
        for (const match of text.matchAll(/<Example\s+file="([^"]+)"/g)) used.push(match[1] as string);
      }
    }
    expect(used.length).toBeGreaterThan(0);
    for (const file of used) expect(files, `${file} is not in examples/`).toContain(file);
  });
});

describe('the built post', () => {
  const page = readFileSync(
    join(inject('siteDir'), 'posts/2026/referencing-viewchild-queries-within-defer-blocks/index.html'),
    'utf8',
  );

  it('shows the code and its recorded output without JavaScript', () => {
    expect(page).toContain('data-example');
    expect(page).toContain('galleryRef');
    expect(page).toMatch(/data-out[^>]*>before: undefined\nafter: 12</);
  });

  it('does not load the editor with the page: it is fetched when Edit is pressed', () => {
    expect(page).not.toMatch(/codemirror|code-editor/i);
    expect(readdirSync(join(inject('siteDir'), '_astro')).some((name) => name.startsWith('code-editor.'))).toBe(true);
  });

  it('keeps the editor and buttons hidden until the script runs', () => {
    expect(page).toMatch(/<div[^>]*\bhidden\b[^>]*data-editor/);
    expect(page).toMatch(/<button[^>]*\bhidden\b[^>]*data-edit>Edit</);
    expect(page).toMatch(/<button[^>]*\bhidden\b[^>]*data-run/);
  });
});

describe('the framework examples', () => {
  const pages = [
    'posts/2022/dynamic-components-angular',
    'posts/2023/guarding-against-unsaved-changes-with-route-guards-angular',
    'posts/2022/rxjx-pitfalls-passing-observer-next-to-pipe-able-operator',
  ];

  it.each(pages)('%s loads nothing from an embed host until the button is pressed', (page) => {
    const html = readFileSync(join(inject('siteDir'), page, 'index.html'), 'utf8');
    expect(html).toContain('Load the example');
    // The only address allowed is a plain link; no iframe or script from the embed hosts is in the page.
    // (A post may hold other embeds, such as the Spotify track, which are not this component's concern.)
    expect(html).not.toMatch(/<iframe[^>]*(stackblitz|codesandbox)/);
    expect(html).not.toMatch(/<script[^>]*src="https:\/\/(stackblitz|[a-z0-9.-]*codesandbox)/);
  });
});

import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { files, read } from './helpers/build';

const out = inject('siteDir');

const text = (extension: string) =>
  files(out)
    .filter((file) => file.endsWith(extension))
    .map((file) => ({ file, content: read(file) }));

describe('the built site', () => {
  it('writes a home page with the title and the header', () => {
    const home = read(join(out, 'index.html'));
    expect(home).toMatch(/<h1[^>]*>Field notes on <em[^>]*>work and projects<\/em><\/h1>/);
    expect(home).toContain('Laurence Ininda');
  });

  it('makes no request to a font host: the fonts are self-hosted', () => {
    for (const { file, content } of [...text('.html'), ...text('.css')]) {
      expect(content, file).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    }
    expect(files(out).some((file) => file.endsWith('.woff2'))).toBe(true);
    const css = text('.css')
      .map(({ content }) => content)
      .join('\n');
    for (const family of ['Lora', 'Karla', 'DM Mono']) expect(css, family).toContain(family);
  });

  it('keeps every corner square and uses no shadows', () => {
    for (const { file, content } of text('.css')) {
      const radii = [...content.matchAll(/border-radius:\s*([^;}]+)/g)].map((match) => match[1].trim());
      expect(
        radii.filter((value) => !/^0(px)?$/.test(value)),
        file,
      ).toEqual([]);
      expect(content, file).not.toMatch(/box-shadow:\s*(?!none)/);
    }
  });

  it('inlines the theme script in the head, before the body', () => {
    const home = read(join(out, 'index.html'));
    expect(home.indexOf('localStorage.getItem')).toBeGreaterThan(-1);
    expect(home.indexOf('localStorage.getItem')).toBeLessThan(home.indexOf('<body'));
  });
});

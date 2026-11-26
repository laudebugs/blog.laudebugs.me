import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

// One real build into a temporary folder, shared by every test below.
let out = '';

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const text = (extension: string) =>
  files(out)
    .filter((file) => file.endsWith(extension))
    .map((file) => ({ file, content: readFileSync(file, 'utf8') }));

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'blog-build-'));
  execFileSync('pnpm', ['exec', 'astro', 'build', '--outDir', out], {
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    stdio: 'pipe',
  });
});

describe('the built site', () => {
  it('writes a home page with the title and the header', () => {
    const home = readFileSync(join(out, 'index.html'), 'utf8');
    expect(home).toContain('<h1>Field notes on <em>work and projects</em></h1>');
    expect(home).toContain('Laurence Ininda');
  });

  it('makes no request to a font host: the fonts are self-hosted', () => {
    for (const { file, content } of [...text('.html'), ...text('.css')]) {
      expect(content, file).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    }
    expect(files(out).some((file) => file.endsWith('.woff2'))).toBe(true);
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
    const home = readFileSync(join(out, 'index.html'), 'utf8');
    expect(home.indexOf('localStorage.getItem')).toBeGreaterThan(-1);
    expect(home.indexOf('localStorage.getItem')).toBeLessThan(home.indexOf('<body'));
  });
});

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** One real build of the site into a temporary folder. */
export function buildSite(): string {
  const out = mkdtempSync(join(tmpdir(), 'blog-build-'));
  execFileSync('pnpm', ['exec', 'astro', 'build', '--outDir', out], {
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    stdio: 'pipe',
  });
  execFileSync('pnpm', ['exec', 'pagefind', '--site', out], { stdio: 'pipe' });
  return out;
}

export function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

export function read(path: string): string {
  return readFileSync(path, 'utf8');
}

import { describe, expect, it } from 'vitest';
import { check, expectedPaths } from '../scripts/parity.mjs';

describe('parity', () => {
  it('expects every old address, its Markdown copy and each cover', () => {
    const paths = expectedPaths(['/posts/2020/a'], ['a.jpg']);
    expect(paths).toContain('/posts/2020/a');
    expect(paths).toContain('/posts/2020/a.md');
    expect(paths).toContain('/assets/post-covers/a.jpg');
    expect(paths).toContain('/assets/posts-index.json');
  });

  it('passes a 200 and names a 404 or a network error', async () => {
    const answer = (status: number) => async () => ({ status }) as Response;
    expect(await check('https://x.test', '/ok', answer(200))).toBeNull();
    expect(await check('https://x.test', '/gone', answer(404))).toBe('/gone: 404');
    expect(
      await check('https://x.test', '/down', async () => {
        throw new Error('offline');
      }),
    ).toBe('/down: offline');
  });
});

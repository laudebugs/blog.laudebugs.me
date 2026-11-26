import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { read } from './helpers/build';

describe('response headers', () => {
  // laudebugs.me fetches the index from the browser; without this header the request is blocked and its post list is empty.
  it('let another origin read the posts index', () => {
    const headers = read(join(inject('siteDir'), '_headers'));
    expect(headers).toMatch(/\/assets\/posts-index\.json\n\s+Access-Control-Allow-Origin: \*/);
  });

  it('keep the long cache on the fingerprinted files only', () => {
    const headers = read(join(inject('siteDir'), '_headers'));
    expect(headers).toMatch(/\/_astro\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
    expect(headers.match(/max-age=31536000/g)).toHaveLength(1);
  });
});

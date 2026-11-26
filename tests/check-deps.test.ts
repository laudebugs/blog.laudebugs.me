import { describe, expect, it } from 'vitest';
import { findInexact, findTooNew, pinned } from '../scripts/check-deps.mjs';

describe('findInexact', () => {
  it('names a range, a tag and a url, in either section', () => {
    const found = findInexact({
      dependencies: { a: '^1.2.3', b: 'latest', c: '1.2.3' },
      devDependencies: { d: '~2.0.0', e: 'github:x/y', f: '5.1.1-beta.2' },
    });
    expect(found.map((item: { name: string }) => item.name)).toEqual(['a', 'b', 'd', 'e']);
  });

  it('accepts a package with only exact versions', () => {
    expect(findInexact({ dependencies: { a: '1.0.0' } })).toEqual([]);
    expect(findInexact({})).toEqual([]);
  });
});

describe('pinned', () => {
  it('lists the exact ones only', () => {
    expect(pinned({ dependencies: { a: '1.0.0', b: '^2.0.0' }, devDependencies: { c: '3.0.0' } })).toEqual([
      ['a', '1.0.0'],
      ['c', '3.0.0'],
    ]);
  });
});

describe('findTooNew', () => {
  const now = Date.parse('2026-11-26T12:00:00Z');
  const published = [
    { name: 'old', version: '1.0.0', time: '2026-11-01T00:00:00Z' },
    { name: 'young', version: '2.0.0', time: '2026-11-25T00:00:00Z' },
    { name: 'edge', version: '3.0.0', time: '2026-11-19T11:00:00Z' },
  ];

  it('flags a release under seven days old', () => {
    expect(findTooNew(published, {}, now).map((item: { name: string }) => item.name)).toEqual(['young']);
  });

  it('lets a recorded exception through, for that version only', () => {
    expect(findTooNew(published, { 'young@2.0.0': { reason: 'security', date: '2026-11-26' } }, now)).toEqual([]);
    expect(findTooNew(published, { 'young@1.9.0': { reason: 'x', date: 'y' } }, now)).toHaveLength(1);
  });
});

import { describe, expect, it } from 'vitest';
import { countTags, groupByYear, shortDate, tagSlug } from '../src/lib/tags';

describe('tagSlug', () => {
  it('makes a lower case address segment', () => {
    expect(tagSlug('angular')).toBe('angular');
    expect(tagSlug('module federation')).toBe('module-federation');
    expect(tagSlug('Node.js')).toBe('node-js');
    expect(tagSlug(' aws lambda ')).toBe('aws-lambda');
  });
});

describe('countTags', () => {
  it('counts every tag, most used first, alphabetical among equals', () => {
    const counted = countTags([{ tags: ['b', 'a'] }, { tags: ['a'] }, { tags: ['c', 'b'] }]);
    expect(counted.map((item) => [item.tag, item.count])).toEqual([
      ['a', 2],
      ['b', 2],
      ['c', 1],
    ]);
  });
});

describe('groupByYear', () => {
  it('groups posts already sorted newest first, keeping their order', () => {
    const posts = [{ y: '2026' }, { y: '2026' }, { y: '2025' }, { y: '2023' }];
    expect(groupByYear(posts, (post) => post.y).map((group) => [group.year, group.posts.length])).toEqual([
      ['2026', 2],
      ['2025', 1],
      ['2023', 1],
    ]);
  });
});

describe('shortDate', () => {
  it('shows the day and month without a time zone shift', () => {
    expect(shortDate('2026-01-01')).toBe('1 Jan');
    expect(shortDate('2025-12-31')).toBe('31 Dec');
  });
});

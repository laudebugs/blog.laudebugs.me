import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';

interface Question {
  ask: string;
  expect: string;
}
const { questions } = JSON.parse(readFileSync('tests/fixtures/ask-questions.json', 'utf8')) as {
  questions: Question[];
};
const index = JSON.parse(readFileSync(join(inject('siteDir'), 'assets/posts-index.json'), 'utf8')) as {
  posts: { url: string }[];
};

describe('the Ask evaluation questions', () => {
  it('each point at a post that exists', () => {
    const addresses = index.posts.map((post) => new URL(post.url).pathname);
    for (const question of questions) expect(addresses, question.ask).toContain(question.expect);
  });
});

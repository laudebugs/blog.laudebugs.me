import { describe, expect, it } from 'vitest';
import { runAgent, STEP_SCHEMA } from '../src/agent/loop';
import type { ModelSession } from '../src/agent/model';
import { markdownAddress, type Tools } from '../src/agent/tools';

/** A model that gives the replies it was handed, in order, and records what it was asked. */
function scripted(...replies: (string | Error)[]): ModelSession & { asked: string[] } {
  const asked: string[] = [];
  return {
    asked,
    async prompt(text) {
      asked.push(text);
      const reply = replies.shift();
      if (reply === undefined) throw new Error('the script ran out');
      if (reply instanceof Error) throw reply;
      return reply;
    },
    destroy() {},
  };
}

const hits = [
  {
    url: '/posts/2026/defer/',
    title: 'Referencing viewChild queries within @defer blocks',
    excerpt: 'viewChild and defer',
  },
  { url: '/posts/2025/router/', title: 'A More Type Safe-ish Angular Router', excerpt: 'typed routes' },
];

function tools(overrides: Partial<Tools> = {}): Tools & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async searchPosts(query) {
      calls.push(`search:${query}`);
      return hits;
    },
    async getPost(url) {
      calls.push(`get:${url}`);
      return 'x'.repeat(5000);
    },
    async listTopics() {
      calls.push('topics');
      return ['angular (14)'];
    },
    ...overrides,
  };
}

const search = (query: string) => JSON.stringify({ action: 'search_posts', query });
const answer = (...picks: { url: string; why: string }[]) => JSON.stringify({ action: 'answer', picks });

describe('runAgent', () => {
  it('searches, then answers with the posts the search found', async () => {
    const model = scripted(
      search('defer viewchild'),
      answer({ url: '/posts/2026/defer/', why: 'It covers exactly this.' }),
    );
    const t = tools();
    const result = await runAgent('how do I reach a component inside @defer?', model, t);
    expect(result).toEqual({
      ok: true,
      picks: [{ url: '/posts/2026/defer/', title: hits[0]?.title, why: 'It covers exactly this.' }],
    });
    expect(t.calls).toEqual(['search:defer viewchild']);
    expect(model.asked[1]).toContain('/posts/2026/defer/');
  });

  it('drops a post the tools never returned and keeps the real ones', async () => {
    const model = scripted(
      search('router'),
      answer({ url: '/posts/2099/invented/', why: 'Made up.' }, { url: '/posts/2025/router/', why: 'Typed routes.' }),
    );
    const result = await runAgent('typed routing', model, tools());
    expect(result.ok && result.picks.map((pick) => pick.url)).toEqual(['/posts/2025/router/']);
  });

  it('fails, so the page shows plain results, when every pick is invented', async () => {
    const model = scripted(search('x'), answer({ url: '/posts/2099/invented/', why: 'Made up.' }));
    expect(await runAgent('q', model, tools())).toEqual({ ok: false, reason: 'no real post was picked' });
  });

  it('fails when the model does not reply with JSON', async () => {
    const result = await runAgent('q', scripted('Sure! Here you go.'), tools());
    expect(result).toEqual({ ok: false, reason: 'the model did not reply with JSON' });
  });

  it('fails when the model throws', async () => {
    const result = await runAgent('q', scripted(new Error('out of memory')), tools());
    expect(result).toEqual({ ok: false, reason: 'out of memory' });
  });

  it('stops after the step limit instead of looping', async () => {
    const t = tools();
    const result = await runAgent('q', scripted(...Array(10).fill(search('again'))), t, { maxSteps: 3 });
    expect(result.ok).toBe(false);
    expect(t.calls).toHaveLength(3);
  });

  it('only reads a post it has found, and cuts what it reads', async () => {
    const model = scripted(
      JSON.stringify({ action: 'get_post', url: '/posts/2026/defer/' }),
      search('defer'),
      JSON.stringify({ action: 'get_post', url: '/posts/2026/defer/' }),
      answer({ url: '/posts/2026/defer/', why: 'ok' }),
    );
    const t = tools();
    await runAgent('q', model, t);
    expect(t.calls).toEqual(['search:defer', 'get:/posts/2026/defer/']);
    expect(model.asked[1]).toBe('That is not a post you have found yet.');
    expect(model.asked[3]?.length).toBe(1500);
  });

  it('limits and trims what it shows', async () => {
    const many = Array.from({ length: 6 }, (_, i) => ({ url: `/p/${i}/`, title: `Post ${i}`, excerpt: '' }));
    const model = scripted(search('x'), answer(...many.map((hit) => ({ url: hit.url, why: ` ${'w'.repeat(400)} ` }))));
    const result = await runAgent('q', model, tools({ searchPosts: async () => many }));
    expect(result.ok && result.picks).toHaveLength(3);
    expect(result.ok && result.picks[0]?.why).toHaveLength(220);
  });

  it('rejects an unknown action', async () => {
    const result = await runAgent('q', scripted(JSON.stringify({ action: 'delete_everything' })), tools());
    expect(result).toEqual({ ok: false, reason: 'unknown action delete_everything' });
  });
});

describe('the agent contract', () => {
  it('offers only read-only actions', () => {
    expect(STEP_SCHEMA.properties.action.enum).toEqual(['search_posts', 'get_post', 'list_topics', 'answer']);
  });

  it('finds the Markdown copy beside it', () => {
    expect(markdownAddress('/posts/2025/router/')).toBe('/posts/2025/router.md');
  });
});

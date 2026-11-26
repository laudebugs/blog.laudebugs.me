import type { ModelSession } from './model';
import type { Hit, Tools } from './tools';

export interface Pick {
  url: string;
  title: string;
  /** Why the post answers the question, in the model's words. Shown as plain text, never as HTML. */
  why: string;
}

export type AgentResult = { ok: true; picks: Pick[] } | { ok: false; reason: string };

export const SYSTEM_PROMPT = `You help readers find posts on a personal technical blog about Angular, TypeScript and building with AI.
Answer by calling tools, one per message, and reply only with JSON.
Tools: search_posts(query) finds posts; get_post(url) reads the start of one post; list_topics() lists the topics.
When you know which posts answer the question, reply with action "answer" and up to 3 picks, each with the post's url exactly as a tool returned it and a one-sentence reason. Never invent a url.`;

/** The reply the model must give: one action per step. */
export const STEP_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['search_posts', 'get_post', 'list_topics', 'answer'] },
    query: { type: 'string' },
    url: { type: 'string' },
    picks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { url: { type: 'string' }, why: { type: 'string' } },
        required: ['url', 'why'],
      },
    },
  },
  required: ['action'],
} as const;

interface Step {
  action?: string;
  query?: string;
  url?: string;
  picks?: { url?: string; why?: string }[];
}

const MAX_PICKS = 3;
const MAX_WHY = 220;
const MAX_POST_TEXT = 1500;

function parseStep(reply: string): Step | undefined {
  try {
    const value: unknown = JSON.parse(reply);
    return value && typeof value === 'object' ? (value as Step) : undefined;
  } catch {
    return undefined;
  }
}

const describe = (hits: Hit[]) =>
  hits.length === 0 ? 'No posts found.' : hits.map((hit) => `- ${hit.title} (${hit.url}): ${hit.excerpt}`).join('\n');

/**
 * Runs the question through the model and the read-only tools. The answer is only ever posts the tools returned in
 * this run: a url the model made up is dropped, and if nothing real is left the result is a failure, which the page
 * answers with plain search.
 */
export async function runAgent(
  question: string,
  session: ModelSession,
  tools: Tools,
  options: { maxSteps?: number; signal?: AbortSignal } = {},
): Promise<AgentResult> {
  const { maxSteps = 5, signal } = options;
  const seen = new Map<string, string>();
  let message = question;
  for (let step = 0; step < maxSteps; step++) {
    let reply: string;
    try {
      reply = await session.prompt(message, STEP_SCHEMA, signal);
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message : 'the model failed' };
    }
    const next = parseStep(reply);
    if (!next) return { ok: false, reason: 'the model did not reply with JSON' };

    if (next.action === 'answer') {
      const picks: Pick[] = [];
      for (const candidate of next.picks ?? []) {
        const url = candidate.url ?? '';
        const title = seen.get(url);
        if (title === undefined || picks.some((pick) => pick.url === url)) continue;
        picks.push({ url, title, why: (candidate.why ?? '').trim().slice(0, MAX_WHY) });
        if (picks.length === MAX_PICKS) break;
      }
      return picks.length > 0 ? { ok: true, picks } : { ok: false, reason: 'no real post was picked' };
    }

    if (next.action === 'search_posts') {
      const hits = await tools.searchPosts(String(next.query ?? question));
      for (const hit of hits) seen.set(hit.url, hit.title);
      message = describe(hits);
    } else if (next.action === 'get_post') {
      const url = String(next.url ?? '');
      const text = seen.has(url) ? await tools.getPost(url) : null;
      message = text === null ? 'That is not a post you have found yet.' : text.slice(0, MAX_POST_TEXT);
    } else if (next.action === 'list_topics') {
      message = (await tools.listTopics()).join(', ');
    } else {
      return { ok: false, reason: `unknown action ${String(next.action)}` };
    }
  }
  return { ok: false, reason: 'the model did not answer in time' };
}

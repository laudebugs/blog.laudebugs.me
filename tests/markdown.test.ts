import { describe, expect, it } from 'vitest';
import { postMarkdown } from '../src/lib/markdown';

describe('postMarkdown', () => {
  it('drops import lines outside code but keeps imports inside code blocks', () => {
    const md = postMarkdown("import Callout from '../x.astro';\n\nText\n\n```ts\nimport { a } from 'b';\n```");
    expect(md).not.toContain('astro');
    expect(md).toContain("import { a } from 'b';");
  });

  it('turns a Callout component and a :::tip block into quoted notes', () => {
    const md = postMarkdown('<Callout type="info">\nSome note.\n</Callout>\n\n:::tip\nA tip.\n:::');
    expect(md).toBe('> **Note**\n>\n> Some note.\n\n> **Tip**\n>\n> A tip.');
  });

  it('replaces embeds, including multi-line ones, with one sentence', () => {
    const md = postMarkdown('Before\n\n<StackBlitzEmbed \n  projectId="x"\n  view="preview"\n/>\n\nAfter');
    expect(md).toBe('Before\n\n_An interactive example is on the web version of this post._\n\nAfter');
  });

  it('strips code annotations and the twoslash fence meta, and leaves the code alone', () => {
    const md = postMarkdown('```ts twoslash\n// @noErrors\nconst a = 1; // [!code focus]\n```');
    expect(md).toBe('```ts\nconst a = 1;\n```');
  });
});

# Layout

One line per top-level path: what it is, and which ADR explains it. Keep long explanations in each folder's own README.

| Path | What it holds |
|---|---|
| `docs/` | Everything written down; see [docs/README.md](../README.md) |
| `docs/design/` | The agreed look: mockups, tokens, logo files |
| `astro.config.mjs`, `tsconfig.site.json`, `biome.json`, `vitest.config.ts` | The Astro site's config (BL2). |
| `src/` | The Astro site (pages: home, archive, topics, 404, `posts/`, and the files `rss.xml`, `llms.txt`, `llms-full.txt`, `assets/posts-index.json`): `content/posts/<year>/<slug>.mdx` (the 21 posts), `content.config.ts`, `layouts/`, `components/`, `pages/`, `lib/` (post helpers, the schema, tags, Markdown copies, the index schema), `plugins/` (the `:::tip` remark plugin, the code frame and the shared code theme), `components/FrameworkExample.tsx` (the React island behind `StackBlitzEmbed` and `CodeSandBox`: loads nothing until a button is pressed), `agent/` (the Ask mode: the model provider, three read-only tools and the bounded loop that only suggests posts the tools returned), `runner/` (the in-browser runner: Sucrase, a module worker, a 30 second limit), `styles/` (`tokens.css` holds the design tokens), `scripts/` (theme logic, Copy, the example buttons, search) |
| `tests/fixtures/ask-questions.json` | The 14 questions with their right posts: the evaluation set for Ask (ADR 0003) |
| `scripts/check-deps.mjs`, `scripts/dependency-exceptions.json` | The exact-pin and release-age check, and the recorded exceptions to it (see ci-and-release.md) |
| `wrangler.jsonc`, `public/_headers`, `scripts/parity.mjs`, `scripts/cloudflare-create-tokens.sh` | Cloudflare static-assets config, cache and security headers, the old-address parity check, and the script that makes the scoped deploy token (see the migration guide) |
| `pagefind.yml` | What the search index leaves out (code popups, code frame labels); the article body is marked `data-pagefind-body` in `src/layouts/Article.astro` |
| `examples/` | Tested examples: `<name>.ts` is a plain script (no imports) that prints with `console.log`, and `<name>.out.txt` is the output it must print. `tests/examples.test.ts` runs each one and compares; `tsc` type-checks them; a post shows one with `<Example file="<name>.ts" />` |
| `public/` | Icons and favicon (from `docs/design/logo`), `assets/post-covers/` and `assets/images/` |
| `fixtures/` | Test inputs: the 21 post addresses of the live site |
| `tests/` | Vitest tests: the theme logic and one real build of the site |
| `.nvmrc` | Node version for local work and CI |
| `scripts/` | Repo tooling: todo board check, doc-index check, worktree helpers |
| `.github/` | Workflows, dependabot, PR and issue templates |
| `.agents/skills/` | Skills; `.claude/skills` symlinks here |

The site source follows [plan D9](../plans/astro-rebuild.md). BL2 added the first part; BL2 and BL3 added the first parts; `examples/` (the tested example files) arrives with BL6. Update this table as each lands.

## One home per concept

- One home per concept: search before writing a helper or a doc.
- A new top-level folder needs a row here and, if it is a design choice, an ADR.

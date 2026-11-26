# Rebuild the blog on Astro

- **Status:** In progress (BL1 done 2026-11-26)
- **Date:** 2026-11-26
- **Baseline:** `laudebugs/blog.laudebugs.me` `main` at `723d680` (2 February 2026), inspected 2026-11-26
- **Asked for by:** the owner
- **Builds on:** the design mockups agreed in this session (links in section 4, D3); the `laudebugs/scaffold` repo layout; the Lamina PDF docs (`apps/docs`) and the Build an Agent manual (`apps/manual`)
- **Todos:** BL1 to BL12, plus BL4b and BL13 in the main-site repo (section 5). None created yet.

## 1. Goal

Move the blog from Vocs 1.4.1 to a plain Astro site, in the design agreed in this session, so that every post can carry examples that run in the reader's browser, and the search box can answer questions about the posts. The old site's addresses, feeds and the post list that laudebugs.me reads must keep working. We will know it is done when a reader can open any old link, read in light or dark, run the live example in a post, and ask the search agent a question, and when `make check` passes in a repo laid out like `scaffold`.

## 2. What the system does today

As of 2026-11-26, from the repository at `723d680`.

- **Framework.** Vocs 1.4.1 (`vocs.config.ts`), with `react`, `react-dom` and `typescript` set to `latest` in `package.json`. Vocs 2.14.1 is the current release and is a different architecture (Waku, Vite 8, React 19, Tailwind 4), so staying on Vocs also means a major migration.
- **Content.** 21 posts, one MDX file each, in `docs/pages/posts/<year>/<slug>.mdx`, 2020 to 2026. Front matter holds `title`, `publishedOn`, `author`, `summary`, `slug`, `tags`, `image`, `imageCredit` and a few others. Covers are in `docs/public/assets/post-covers/`.
- **Custom pieces.** `docs/components/`: `AuthorAndDate`, `CoverPhoto`, `LatestPosts`, `PostsArchive`, `CodeSandBox` (Sandpack), `StackBlitzEmbed`, `SpotifyTrack`. Posts also use `Callout` from `vocs/components`.
- **Code blocks.** Shiki through Vocs, themes `github-light` and `night-owl`, with twoslash in 8 posts (35 lines mention it): focus lines, error lines and type popovers. Sandpack or StackBlitz embeds appear in 3 posts.
- **Pages.** Home (`index.mdx`, latest posts), `archive.mdx`, `topics.mdx`, and the sidebar built by `docs/helpers/get-tagged-posts.js` (tags counted by each post's first tag only).
- **Generated files.** `docs/helpers/gen-post-archive.js` writes `docs/public/assets/posts.json` before every build. Each entry holds the post body, its front matter and its cover file name. **laudebugs.me reads this file** (title, `publishedOn`, `blogSlug`, `tags` and the cover) for its latest-post card and its "More from the blog" row, so its shape is a contract.
- **Feeds and AI files.** The `feed` and `feed-core` packages are dependencies. Vocs writes `llms.txt` and `llms-full.txt`.
- **Dependencies that do not belong to a blog.** `@angular/core`, `@angular/router`, `@angular/platform-browser`, `rxjs`, `@module-federation/enhanced` and `@nx/module-federation` most likely appear because post code blocks import them, so twoslash can type-check the examples (to confirm in BL5). `@uidotdev/usehooks`, `date-fns`, `marked`, `gray-matter` and `ts-node` are small helpers. `prettier` is the only formatter.
- **Repo structure.** One `docs/` folder holds the site content, so there is nowhere for plans, decisions or guidelines. There is no CI, no `AGENTS.md`, and no Makefile. The owner says it is hosted on Vercel and will move to Cloudflare (D12).
- **Not touched.** `laudebugs/blog` is a separate Nx workspace and is out of scope.

## 3. What others do

- **Lamina PDF docs** (`apps/docs`, as of 2026-11-26). Astro with Starlight. A `Snippet` component reads a file of the repository at build time, so every code sample on a page is a file that CI runs. An `Example` component shows the code and what it makes. Selected examples get an "Edit and run" button: CodeMirror in the page, and the code runs in a module worker (`runner/`) after Sucrase strips the types. Every page has a Markdown copy, plus `llms.txt` and "Copy as Markdown".
- **Build an Agent manual** (`apps/manual`). Plain Astro with no adapter, Pagefind search, content collections with strict front matter (a `check:book` command fails on a bad key), listings taken from type-checked files, and static output on Cloudflare Workers assets with a preview for every pull request.
- **Vocs 2.14.1.** Ships a built-in `Sandbox` (Sandpack, Node template, TypeScript through Sucrase, a Run button) and layout slots. I did not check whether the Sandbox can run Angular, or how far the layout can be restyled. We chose Astro for design control (D1), not because Vocs lacks live examples.
- **`scaffold`** (`laudebugs/scaffold`). A stack-agnostic repo template: `AGENTS.md` with `CLAUDE.md` as a symlink, `docs/` with plans, todos (`ready/ongoing/done`), ADRs, bugs, research, guidelines, standards, guides and a README index in every folder, one `Makefile`, `scripts/` for the todo board and index checks, and CI with one aggregate `gate` job.
- **Versions** (npm, as of 2026-11-26): `astro` 7.4.13, `@astrojs/mdx` 8.1.6, `@astrojs/react` 7.1.9, `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.6, `@astrojs/cloudflare` 14.4.9, `pagefind` 1.6.0, `shiki`, `@shikijs/transformers` and `@shikijs/twoslash` 4.6.0, `sucrase` 3.35.1, `typescript` 7.0.2 and 6.0.3, `@biomejs/biome` 2.6.9, `vitest` 5.1.2.

## 4. Decisions

**D1. Plain Astro 7, static output, MDX posts.** Not Starlight, which is shaped like a docs site with a sidebar. Reasons: the agreed design is far from a docs template, and both reference projects already use Astro. Hard to reverse, so it also gets an ADR (BL1).

**D2. Keep every address; replace `posts.json` with a slim index.** Posts stay at `/posts/<year>/<slug>`, plus `/archive`. The feed, `llms.txt` and `llms-full.txt` keep working, each post also gets a Markdown copy at `<post>.md`, and cover images keep their paths under `/assets/post-covers/`. The 167 KB `/assets/posts.json` is retired (O5, owner's choice D) and replaced by `/assets/posts-index.json`, described in section 6. A parity check (BL4, BL12) compares the old and new address lists before the switch.

**D3. Design: the one agreed in this session.**
- **Colour and type:** the Orchid palette on graph paper (tokens in [docs/design/README.md](../design/README.md)), Lora for titles and reading, DM Mono for labels and code, light and dark following the system with a toggle that remembers the choice.
- **Shape:** every corner square, no shadows, no borders around sections. Callouts, chips, cards and the live example are quiet tints. Only the header and footer rules remain.
- **Code blocks:** frosted glass (a lilac tint, no border) with a filename label and Copy; keep the old blog's dimmed focus lines, error band and callout.
- **Article:** the text on a white panel (a dark purple one in dark mode), cover with credit, an "On this page" rail, previous and next.
- **Pages:** home, article, archive, topics, one topic, search and 404.
- **Mark:** the blog's own "L B I" mark, chosen 2026-11-26: a big L, a small B in the L's inner corner and an I standing to its right, no border and one colour. The favicon follows the system theme; the app icon sits on a dark square. The main site keeps its own L logo.
- **Source of truth:** the final mockup `docs/design/blog-site.html` (open it in a browser; also at https://claude.ai/artifact/UakAnvKGezMFGV7E67MAhQ), the logo mock `docs/design/blog-logos.html` and the logo files in `docs/design/logo/`. Tokens live in one `src/styles/tokens.css` (BL2).

**D4. Fonts self-hosted** from `@fontsource` (Lora and DM Mono; the design uses no other face), so the site makes no request to Google Fonts, as laudebugs.me does.

**D5. Code blocks use Shiki with transformers.** `@shikijs/transformers` for focus, highlight and error lines, `@shikijs/twoslash` for the 35 existing twoslash blocks, and a small rehype step that wraps each block in the glass frame with its label and Copy. The site pins **TypeScript 6.0.3**, not 7, because `astro check` refuses TypeScript 7 and TypeScript 7 has no compiler API (Build an Agent's notes say both; the second is about TypeDoc, which uses the same API twoslash does, so BL5 re-verifies on this repo).

**D6. Live examples, three kinds**, chosen per post:
1. **Tested snippet:** the code comes from a file in `examples/`, which CI type-checks and runs, as in Lamina's `Snippet`. No code is pasted into a post.
2. **Edit and run:** for plain TypeScript or JavaScript, the Lamina pattern: CodeMirror in the page, Sucrase to strip types, a module worker to run it, a 30 second limit, output shown below.
3. **Framework example:** the three Angular posts that embed Sandpack or StackBlitz today move to this stack as click-to-load islands (a React island through `@astrojs/react`), so no post keeps an old embed. Owner's answer 2026-11-26: all three move. My reading of "the updated demo stack" is this decision (D6 as a whole); correct me if you meant something else.

**D7. Search is Pagefind** over the built site, opened with `/` in a modal that matches the design.

**D8. The search agent runs in the browser** (owner's decision, 2026-11-26). It sits in the same modal as an "Ask" mode.
- **The model is local.** It is downloaded only when a visitor turns "Ask" on, runs on their device, and nothing they type leaves it. There is no server, no per-question cost and no spend cap to manage. The static site stays static, with no Worker for the model.
- **Which runtime and model is the first job of BL9**, a spike that measures download size, first answer time and answer quality on a phone and a laptop. Candidates are the browser's built-in model API (Chrome only) and a small open model through WebGPU (for example through Transformers.js or WebLLM). The spike decides; the plan does not.
- **Tools are read-only:** `search_posts` (the Pagefind index), `get_post` and `list_topics`. It cannot write or fetch anything else.
- **Answers cite posts:** every result is a link to a real post from the index, and the result list is filled from those links. The agent never produces HTML.
- **Fallback:** a browser without the needed support, a declined download or a failed run shows plain Pagefind results, so search always works.
- **Whether `@buildanagent/sdk` runs in the browser** is checked in the spike; if it does not, BL9 writes a small loop of its own.

**D9. Repo layout copied from `scaffold`.** `AGENTS.md` (with `CLAUDE.md` as a symlink), `Makefile` as the one entry point (`check`, `test`, `fmt`, `todos`, `doctor`, `ci`), `docs/` with plans, todos, decisions, bugs, research, guidelines, standards, guides and `agents/`, `scripts/`, `.agents/skills/`, `.github/` with CI and one `gate` job, Dependabot with a cooldown, and the PR and issue templates. The site source moves out of `docs/`:

```
src/content/posts/<year>/<slug>.mdx   posts
src/components/  layouts/  pages/  styles/  lib/
public/                               covers, icons, fonts, posts.json
examples/                             the tested example files
scripts/                              repo tooling
docs/                                 plans, decisions, guidelines (never site content)
```

**D10. Tooling.** pnpm, Node 24, Biome (as Build an Agent) in place of Prettier, Vitest, `tsc` plus `astro check` for types, Playwright for the browser checks.

**D11. Dependencies are pinned exactly**, to releases at least one week old (Build an Agent's rule), and each is added only when a todo needs it.
- **Keep:** `astro`, `@astrojs/mdx`, `@astrojs/react` (islands only), `@astrojs/rss`, `@astrojs/sitemap`, `@codesandbox/sandpack-react`, `@stackblitz/sdk`, `typescript` (6.0.3).
- **Replace:** `gray-matter` and `marked` (Astro content collections), `feed` and `feed-core` (`@astrojs/rss`), `prettier` (Biome), `vocs`, `react` and `react-dom` (pinned, not `latest`).
- **Move:** the Angular, RxJS and module-federation packages become dev dependencies of `examples/` only, so twoslash can still type-check those posts.
- **Drop:** `@uidotdev/usehooks`, `date-fns`, `ts-node`, `@nx/module-federation`.
- **Add:** `pagefind`, `shiki`, `@shikijs/transformers`, `@shikijs/twoslash`, `sucrase`, `@fontsource/lora`, `@fontsource/dm-mono`, `@biomejs/biome`, `vitest`, `@astrojs/check`, `playwright`.

**D12. Move hosting from Vercel to Cloudflare.** Static output on Cloudflare Workers assets with a preview for each pull request, as Build an Agent does. No adapter is needed (D8 has no server part). The domain `blog.laudebugs.me` moves with the cutover (BL12): the Cloudflare project is deployed and checked on its own address first, then the DNS record changes, and the Vercel project is retired only after the new site has served real traffic for a few days.

**D13. The switch is one cut.** Build the new site alongside the old, run the parity checks (D2), then change the deploy and delete Vocs in BL12. The old site stays live until the checks pass.

## 5. Order of work

| ID | Todo | Depends on |
|---|---|---|
| BL1 | Lay out the repo like `scaffold`: `AGENTS.md`, `Makefile`, `docs/`, `scripts/`, CI with `gate`, Dependabot; first ADR for Astro (D1, D9) | None |
| BL2 | Astro skeleton: tokens, self-hosted fonts, layout, header, footer, light and dark toggle, Layers mark and icons (D3, D4) | BL1 |
| BL3 | Posts collection with strict front matter; move the 21 posts; rewrite `AuthorAndDate`, `CoverPhoto` and the callout as Astro components; address parity (D2) | BL2 |
| BL4 | Home, archive, topics and topic pages; `posts.json` with the same fields; RSS, sitemap, `llms.txt`, `llms-full.txt`, Markdown copies; 404 | BL3 |
| BL4b | In the main-site repo (`laudebugs.me`): read `posts-index.json` and fall back to the old `posts.json` when the new file is missing, so the main site works before and after the cutover | BL4 |
| BL5 | Code blocks: glass frame, label, Copy, focus, highlight and error lines, twoslash on TypeScript 6 (D5) | BL3 |
| BL6 | Live examples: `examples/` with CI, the `Example` component, the module-worker runner (D6.1, D6.2) | BL5 |
| BL7 | Framework examples: the three Angular posts move to islands (D6.3) | BL5 |
| BL8 | Search: Pagefind and the modal, "/" shortcut (D7) | BL4 |
| BL9 | Search agent: spike to choose the in-browser model and runtime, then the tools, the opt-in download, the fallback and evals (D8) | BL8 |
| BL10 | Dependencies: exact pins, the keep, replace, move and drop lists (D11); a check that fails on a range or a package under a week old | BL4 |
| BL11 | Browser checks: every page at 390 and 1440 px in light and dark, no sideways scroll, axe, links, square-corner and no-border check | BL4, BL5 |
| BL12 | Cutover: parity report, Cloudflare project and previews, DNS change, retire Vercel, delete Vocs (D12, D13) | BL6, BL7, BL9, BL10, BL11 |
| BL13 | In the main-site repo: remove the fallback to the old file once the new blog has served real traffic | BL12 |

BL2 to BL4 are the critical path. BL5, BL6 and BL7 can run in parallel after BL3, and BL8 after BL4.

## 6. Risks, resolved questions and open questions

**Resolved by the owner on 2026-11-26**
- **O1. Hosting:** Vercel today, Cloudflare after the move (D12).
- **O2. Search model:** in the browser (D8).
- **O3. Angular examples:** all three move to the new demo stack (D6.3).
- **O4. twoslash on TypeScript 6 with the Angular type packages:** expected to work. Vocs's twoslash already builds all 21 posts on TypeScript 6.0.3 once `ignoreDeprecations: '6.0'` is set (BL2; the built page is byte-for-byte the same size as the live one). BL5 still proves the Astro and Shiki twoslash on one post before moving the rest.
- **O6. Navigation:** the two "More Links" (Dev Journal, Imperfect Place) are dropped.
- **O7. Topics:** every tag counts, so the numbers change.
- **O8. Logo:** the blog's mark is the "L B I" mark (D3). The main site keeps its own logo.
- **Scope risk:** twelve todos is a lot; the owner accepts it. Each ships alone, so the site can run on Astro without the agent (BL9) or the runner (BL6) and gain them later.

**O5. What `/assets/posts.json` becomes: decided, option D (2026-11-26).** The old file is retired and the new site publishes only a slim index. laudebugs.me reads five fields, and the old file was 167 KB, of which 141 KB was the full text of all 21 posts.

The new file is `/assets/posts-index.json`:

```json
{
  "version": 1,
  "posts": [
    {
      "title": "Referencing viewChild queries within @defer blocks",
      "publishedOn": "2026-01-28",
      "url": "https://blog.laudebugs.me/posts/2026/referencing-viewchild-queries-within-defer-blocks",
      "tags": ["angular"],
      "image": "https://blog.laudebugs.me/assets/post-covers/referencing-viewchild-queries-within-defer-blocks.jpg",
      "imageAlt": ""
    }
  ]
}
```

- **The cover is in the file.** `image` is the full address of the cover, or `null` for a post without one. Today laudebugs.me builds that address itself from a file name, so it now takes the address as given. Cover files keep their paths, so old links and caches keep working.
- **Why full addresses:** the file is read from another site, so a path alone is not enough. Both are built from the site's own origin, so a preview deploy points at its own covers.
- **`imageAlt`** is empty today (the cards treat covers as decoration). It is there so it can be filled in without changing the format.
- **Newest first, `version` for future changes.** The top level is an object, not an array, so fields can be added without breaking readers.
- **Safe order for "D":** retiring the old file and changing laudebugs.me in the same hour is fragile, because the two sites deploy separately. Instead BL4b makes laudebugs.me read the new file and fall back to the old one, and ships first. The cutover (BL12) then needs no coordination, and BL13 removes the fallback afterwards. Until the cutover the new file returns 404 on the old Vercel site, and the fallback covers that gap.

- **Risk: the old site breaks during the move.** Mitigated by D13: nothing is switched until BL12.

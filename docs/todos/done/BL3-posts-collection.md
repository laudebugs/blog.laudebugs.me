# BL3: Posts collection and the 21 posts

| Field | Value |
|---|---|
| ID | `BL3` |
| Status | `done` |
| Plan | [plan](../../plans/astro-rebuild.md), D2, D9 |
| Depends on | BL2 |
| ADRs | None |
| Branch | `feat/bl3-posts-collection` |
| PR title | `feat: move the 21 posts to an Astro content collection` |
| Size | L (split by year if needed) |
| PR | — |

## Goal

All 21 posts render in Astro at their current addresses, with strict front matter and the custom pieces rewritten as Astro components.

## Context

- Today: `docs/pages/posts/<year>/<slug>.mdx`, `docs/components/*`.
- [plan](../../plans/astro-rebuild.md) section 2.

## Scope

**In scope:** Move posts to `src/content/posts/<year>/<slug>.mdx`; a Zod schema; `AuthorAndDate`, `CoverPhoto`, `Callout` as Astro components; the article layout; address parity; move the other Vocs content out of `docs/` and remove the doc-index exemption.

**Out of scope:** Code block styling (BL5), live examples (BL6, BL7), listing pages (BL4).

## Target files

| File | Change |
|---|---|
| `src/content.config.ts` | (new) schema: title, publishedOn, slug, tags, image, imageCredit, summary, author |
| `src/content/posts/**` | (moved) 21 MDX files |
| `src/components/*.astro` | (new) AuthorAndDate, CoverPhoto, Callout |
| `src/layouts/Article.astro`, `src/pages/posts/[year]/[slug].astro` | (new) the article page |
| `public/assets/post-covers/` | (moved) covers keep their paths |
| `docs/pages`, `components`, `helpers`, `public`, `snippets` | unchanged: the Vocs copies stay until BL12 |

## Steps

- [x] Write the schema and fail the build on an unknown key.
- [x] Move the posts and covers; fix imports.
- [x] Rewrite the three components.
- [x] Generate the address list from the old site and compare with the new.
- [x] Keep the Vocs copies until BL12 (see the record).

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| Post with no cover | `image` empty, no broken image |
| Unknown front matter key | Build fails with the file name |
| Old address `/posts/2023/<slug>` | Same page, same address |

## Acceptance criteria

- All 21 posts at their old addresses.
- Parity report: zero missing and zero extra addresses.
- `make check` passes.

## Tests

A test that builds the site and compares its post addresses with `fixtures/addresses.txt`, made from the live site's `posts.json`.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/layout.md`, `docs/README.md`.

## Risks and open questions

The 8 posts with twoslash and the 3 with embeds render without their special blocks until BL5 to BL7; the parity check covers addresses, not those blocks.

## Definition of done

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Built:** a strict content collection (`src/content.config.ts`, schema in `src/lib/post-schema.ts`); the 21 posts in `src/content/posts/<year>/<slug>.mdx`; the article page `/posts/<year>/<slug>` with the white panel, cover and credit, an "On this page" rail, topic chips and newer and older links; the `Callout` component and a remark plugin that turns `:::tip` blocks into the same tinted notes; placeholders for the three embed components; basic styles for text, callouts and code (BL5 replaces the code styles).
- **The conversion is a script**, `scripts/migrate-posts.mjs`, not hand edits, so it can be re-run. It drops the Vocs-only lines, moves the cover file, photo credit and the H1 into front matter, points imports at the Astro components, inlines the one `// [!include ...]` snippet, and points the two images that were hosted in the private `blog-posts` repository (broken on the live site) at the copies in `public/assets/images`.
- **Deviation: the Vocs copies stay.** The todo said to move the posts and remove the Vocs folders. Moving them would break `pnpm build`, which Vercel runs until the cutover, so the posts, components and covers exist twice until BL12 deletes the Vocs copies. The doc-index exemption stays too.
- **Astro 7 needed `@astrojs/markdown-remark`** (7.3.8) and `unified()` in `astro.config.mjs`: the default Markdown processor runs no remark plugins.
- **Checked:** `make check` and `make test` (20 tests: the 21 addresses match the live site exactly with none missing or extra; no leaked `:::tip`, `[!include` or Vocs imports; every image path exists; the schema rejects unknown keys, bad dates and bad slugs; the heading and date helpers). Three posts viewed in a browser in light and dark, and one at 390 px: no sideways scroll, no console errors, no broken local image.
- **Still open:**
  - Code markers such as `// [!code focus]` and `// @error:` show as plain text until BL5.
  - The three embeds show a placeholder until BL7.
  - Three posts still link to images in other GitHub repositories (`kenya-web-project`, `articles`, `hnp-utilities`); not checked.
  - The home page is still the placeholder; the listing pages are BL4.

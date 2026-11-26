# BL3: Posts collection and the 21 posts

| Field | Value |
|---|---|
| ID | `BL3` |
| Status | `ready` |
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
| `docs/pages|components|helpers|public|snippets` | removed; update `scripts/check-doc-indexes.mjs` |

## Steps

- [ ] Write the schema and fail the build on an unknown key.
- [ ] Move the posts and covers; fix imports.
- [ ] Rewrite the three components.
- [ ] Generate the address list from the old site and compare with the new.
- [ ] Remove the Vocs folders from `docs/` and the exemption.

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

A test that builds the site and compares the address list with `docs/design`-independent fixture `fixtures/addresses.txt` made from the live site.

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

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

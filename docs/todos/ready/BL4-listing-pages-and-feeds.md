# BL4: Home, archive, topics, topic pages, feeds and the posts index

| Field | Value |
|---|---|
| ID | `BL4` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D2, O5 |
| Depends on | BL3 |
| ADRs | None |
| Branch | `feat/bl4-listing-pages-and-feeds` |
| PR title | `feat: add listing pages, feeds, llms.txt and posts-index.json` |
| Size | L |
| PR | — |

## Goal

Every listing page of the design, plus the machine-readable files: RSS, sitemap, `llms.txt`, `llms-full.txt`, Markdown copies of posts, 404, and `/assets/posts-index.json`.

## Context

- [plan O5](../../plans/astro-rebuild.md): the exact shape of `posts-index.json`.
- [docs/design/blog-site.html](../../design/blog-site.html).

## Scope

**In scope:** Pages: home, `/archive`, `/topics`, `/topics/<tag>`, 404. Files: `rss.xml`, `sitemap`, `llms.txt`, `llms-full.txt`, `<post>.md`, `/assets/posts-index.json`.

**Out of scope:** Search (BL8). Changing `laudebugs.me` (BL4b).

## Target files

| File | Change |
|---|---|
| `src/pages/index.astro`, `archive.astro`, `topics/index.astro`, `topics/[tag].astro`, `404.astro` | (new) |
| `src/pages/rss.xml.ts`, `llms.txt.ts`, `llms-full.txt.ts`, `posts/[year]/[slug].md.ts` | (new) |
| `src/pages/assets/posts-index.json.ts` | (new) version, posts with title, publishedOn, url, tags, image, imageAlt |

## Steps

- [ ] Build the pages from the mockup.
- [ ] Count every tag on the topics page.
- [ ] Write `posts-index.json` with absolute addresses from `site` in `astro.config.mjs`; `image` is `null` without a cover.
- [ ] Keep the old feed address.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| Post without a cover | `image: null` |
| Preview deploy | Addresses use the preview origin, not production |

## Acceptance criteria

- Pages match the mockup at 390 and 1440 px in light and dark.
- `posts-index.json` validates against its schema and has 21 posts newest first.
- Feed validates; `llms.txt` lists every post.

## Tests

Schema test for `posts-index.json`; feed and `llms.txt` snapshot tests.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/layout.md`; the plan's O5 stays the source for the file shape.

## Risks and open questions

The old `posts.json` is not produced any more; see BL4b and BL12.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

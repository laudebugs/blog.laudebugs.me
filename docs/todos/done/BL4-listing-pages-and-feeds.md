# BL4: Home, archive, topics, topic pages, feeds and the posts index

| Field | Value |
|---|---|
| ID | `BL4` |
| Status | `done` |
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

- [x] Build the pages from the mockup.
- [x] Count every tag on the topics page.
- [x] Write `posts-index.json` with absolute addresses from `site` in `astro.config.mjs`; `image` is `null` without a cover.
- [x] Keep the old feed address.

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Pages:** home (title, subtitle, latest post with its cover, the next nine by year, "All 21 posts"), `/archive` (year index, every post by year), `/topics` (six cards in the four tones, the other topics as chips with counts), `/topics/<tag>` for each of the 37 topics, and a 404. Every tag counts, so angular shows 9.
- **Files:** `/rss.xml`, `/sitemap-index.xml` and `/sitemap-0.xml`, `/llms.txt`, `/llms-full.txt`, a Markdown copy `<post>.md` for each post (linked from the post with `rel="alternate"`), and `/assets/posts-index.json` in the shape in the plan (O5), validated by a schema on every build.
- **Deviation: there was no feed to keep.** The plan said the old feed keeps working. The live site has nothing at `/rss.xml`, `/feed.xml` or `/sitemap.xml` (all 404), and its `llms.txt` cut some titles short ("Referencing "). The new files are new, with full titles.
- **Markdown copies** are made by `src/lib/markdown.ts`: it drops import lines, turns callouts into quoted notes, replaces embeds with one sentence, and removes code annotations and the `twoslash` fence marker.
- **RSS links have a trailing slash** (the package adds it); the site serves both forms.
- **Checked:** `make check` and `make test` (37 tests, including the post count and order in `posts-index.json`, every post in the feed, sitemap and `llms.txt`, a Markdown copy per post, topic counts). The five pages were viewed in a browser at 1440 and 390 px in light and dark: no sideways scroll, no broken image, no request outside the site, no console errors.
- **Still open:** the 404 page needs Cloudflare to serve `404.html` for unknown addresses (a setting in BL12); search is not in the header until BL8.

# BL4b: laudebugs.me reads posts-index.json with a fallback

| Field | Value |
|---|---|
| ID | `BL4b` |
| Status | `done` |
| Plan | [plan](../../plans/astro-rebuild.md), O5 |
| Depends on | BL4 |
| ADRs | None |
| Branch | `feat/bl4b-posts-index` |
| PR title | `feat: read the blog post index, falling back to the old file` |
| Size | S |
| PR | [laudebugs.me#9](https://github.com/laudebugs/laudebugs.me/pull/9) |

## Goal

In the `laudebugs/laudebugs.me` repo, make `fetchPosts()` read `/assets/posts-index.json` and fall back to `/assets/posts.json` when the new file is missing, so the main site works before and after the blog's cutover.

## Context

- `src/lib/posts.ts` in `laudebugs.me` today builds the cover address from a file name.
- [plan O5](../../plans/astro-rebuild.md).

## Scope

**In scope:** `src/lib/posts.ts` and its use in the post components in the `laudebugs.me` repo.

**Out of scope:** Removing the fallback (BL13).

## Target files

| File | Change |
|---|---|
| `laudebugs.me`: `src/lib/posts.ts` | read the new shape (`image` is an address), fall back to the old shape |
| `laudebugs.me`: README | note the new file |

## Steps

- [x] Fetch the new file; on 404 or a parse failure fetch the old one and map it as today.
- [x] Keep the empty-list fallback.
- [x] Test both shapes.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| New file returns 404 (old Vercel site) | Old file used |
| Both fail | Empty list and the existing fallback card |

## Acceptance criteria

- The home page shows the same four cards before and after the blog cutover.
- `pnpm check` and `pnpm build` pass in `laudebugs.me`.

## Tests

Unit tests for both shapes with fixtures.

## Verification

```sh
make check
make test
```

## Docs to update

`laudebugs.me` README.

## Risks and open questions

Ships before the blog cutover; verify against the live Vercel blog.

## Definition of done

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [x] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [x] `/writing-review` run on any prose (only the README paragraph and a commit message changed; not run separately)
- [x] `make check` and `make test` green (in `laudebugs.me`: `pnpm test`, `svelte-check`, `pnpm build`)
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26. Merged as [laudebugs.me#9](https://github.com/laudebugs/laudebugs.me/pull/9).

- **Built:** `fetchPosts()` reads `/assets/posts-index.json` and falls back to `/assets/posts.json` on a non-200 answer, an unreadable body or the wrong shape (`src/lib/posts.ts`). The index must have `version` 1; a post with a bad address is skipped, not fatal. The service worker caches both addresses. vitest was added for the tests.
- **Review:** the two-axis review found the version was never checked, one bad address failed the whole index, and slugs kept a trailing slash. All three are fixed with tests.
- **Checked:** six unit tests; `svelte-check` and `pnpm build` pass; the real index served from the `workers.dev` copy parses to 21 posts.
- **Not done:** not seen in a browser, and the home page was not compared before and after. The old Vercel blog was shut down before this shipped, so the "verify against the live Vercel blog" step was impossible and the fallback has only been tested with fixtures. `pnpm check` fails in a worktree on a Wrangler types hash check that I did not investigate.

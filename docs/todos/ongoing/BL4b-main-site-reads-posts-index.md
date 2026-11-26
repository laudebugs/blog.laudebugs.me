# BL4b: laudebugs.me reads posts-index.json with a fallback

| Field | Value |
|---|---|
| ID | `BL4b` |
| Status | `ongoing` |
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

- [ ] Fetch the new file; on 404 or a parse failure fetch the old one and map it as today.
- [ ] Keep the empty-list fallback.
- [ ] Test both shapes.

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

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

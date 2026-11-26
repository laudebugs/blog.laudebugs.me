# BL13: laudebugs.me drops the old posts.json fallback

| Field | Value |
|---|---|
| ID | `BL13` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), O5 |
| Depends on | BL12 |
| ADRs | None |
| Branch | `chore/bl13-remove-fallback` |
| PR title | `chore: remove the old posts.json fallback` |
| Size | S |
| PR | — |

## Goal

In the `laudebugs/laudebugs.me` repo, remove the fallback to `/assets/posts.json` once the new blog has served real traffic.

## Context

- BL4b added the fallback.

## Scope

**In scope:** `src/lib/posts.ts` and its tests in `laudebugs.me`.

**Out of scope:** Anything on the blog.

## Target files

| File | Change |
|---|---|
| `laudebugs.me`: `src/lib/posts.ts` | remove the old-shape mapping |

## Steps

- [ ] Remove the fallback and its test.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| New file missing | Empty list and the existing fallback card |

## Acceptance criteria

- The home page still shows its cards; `pnpm check` and `pnpm build` pass.

## Tests

Unit tests.

## Verification

```sh
make check
make test
```

## Docs to update

`laudebugs.me` README.

## Risks and open questions

None.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

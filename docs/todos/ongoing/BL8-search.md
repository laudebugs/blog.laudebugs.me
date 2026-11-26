# BL8: Search: Pagefind and the search modal

| Field | Value |
|---|---|
| ID | `BL8` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D7 |
| Depends on | BL4 |
| ADRs | None |
| Branch | `feat/bl8-search` |
| PR title | `feat: add Pagefind search with a modal` |
| Size | M |
| PR | — |

## Goal

Search over the built site, opened with `/` from any page, in the modal from the design.

## Context

- Build an Agent manual: Pagefind after `astro build`.
- [docs/design/blog-site.html](../../design/blog-site.html), Search page.

## Scope

**In scope:** Pagefind index at build time; the modal; keyboard use; result list.

**Out of scope:** The search agent (BL9).

## Target files

| File | Change |
|---|---|
| `package.json` build script | `astro build && pagefind --site dist` |
| `src/components/SearchModal.astro`, `search.ts` | (new) |

## Steps

- [ ] Index titles, tags and text.
- [ ] Open on `/`, close on Escape, move with arrow keys, open with Enter.
- [ ] Focus trap and return focus on close.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| No results | A message and a link to the archive |
| No JavaScript | A link to the archive |

## Acceptance criteria

- `/` opens search on every page; results link to the posts.
- axe finds no issues in the open modal.

## Tests

Playwright keyboard test; axe.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/commands.md`.

## Risks and open questions

Pagefind needs the built `dist/`, so dev mode has no index.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

# BL11: Browser checks for every page

| Field | Value |
|---|---|
| ID | `BL11` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D3 |
| Depends on | BL4, BL5 |
| ADRs | None |
| Branch | `test/bl11-browser-checks` |
| PR title | `test: check every page in a browser at phone and desktop width` |
| Size | M |
| PR | — |

## Goal

Automated browser checks that every page matches the design rules.

## Context

- [docs/design/README.md](../../design/README.md).

## Scope

**In scope:** Playwright against the built site at 390 and 1440 px, light and dark: no sideways scroll, axe, links, every corner square, no section borders, no shadow, no request to a font host.

**Out of scope:** Visual diffs against the mockup.

## Target files

| File | Change |
|---|---|
| `tests/browser/*.spec.ts` | (new) |
| `playwright.config.ts` | (new) |
| `.github/workflows/ci.yml` | add the browser job |

## Steps

- [ ] Serve the built site.
- [ ] Loop over every address from the sitemap.
- [ ] Assert the rules.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| A page with a wide code block | Scrolls inside the block, not the page |

## Acceptance criteria

- The checks run in CI and fail on a rounded corner, a shadow or sideways scroll.

## Tests

The checks are the tests.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/commands.md`.

## Risks and open questions

Flaky timing: wait on the page's ready state, not on time.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

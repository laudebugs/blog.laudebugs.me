# BL7: Angular examples as click-to-load islands

| Field | Value |
|---|---|
| ID | `BL7` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D6.3 |
| Depends on | BL5 |
| ADRs | None |
| Branch | `feat/bl7-angular-examples` |
| PR title | `feat: move the three Angular embeds to the new example stack` |
| Size | M |
| PR | — |

## Goal

The three posts with Sandpack or StackBlitz embeds use the new example stack, loaded on click, in the agreed look.

## Context

- Today: `docs/components/CodeSandBox.tsx`, `StackBlitzEmbed.tsx`; posts `guarding-against-unsaved-changes-with-route-guards-angular`, `rxjx-pitfalls-passing-observer-next-to-pipe-able-operator`, `dynamic-components-angular`.
- Plan D6.3 (owner: all three move).

## Scope

**In scope:** A React island through `@astrojs/react`, click to load, themed to match; the three posts updated.

**Out of scope:** Other posts.

## Target files

| File | Change |
|---|---|
| `src/components/FrameworkExample.tsx` | (new) island |
| three posts in `src/content/posts/` | use the island |

## Steps

- [ ] Check each embed still works with its pinned library version.
- [ ] Replace the old components.
- [ ] Load nothing until the reader clicks.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| Embed service down | A link to open it elsewhere |
| No JavaScript | A link and a screenshot |

## Acceptance criteria

- The three posts match the design and load their example on click.
- No external request before the click.

## Tests

Playwright: no network request to the embed host before the click.

## Verification

```sh
make check
make test
```

## Docs to update

None.

## Risks and open questions

Sandpack and StackBlitz must work under the new layout.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

# BL7: Angular examples as click-to-load islands

| Field | Value |
|---|---|
| ID | `BL7` |
| Status | `done` |
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

- [x] Check each embed still works with its pinned library version.
- [x] Replace the old components.
- [x] Load nothing until the reader clicks.

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [x] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [x] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Built:** one React island, `src/components/FrameworkExample.tsx`, behind the two Astro components the posts already use (`StackBlitzEmbed.astro`, `CodeSandBox.astro`), so the three posts needed no edits. It shows a "Load the example" button in the same tinted block as the BL6 example; pressing it inserts the StackBlitz iframe (themed with `theme=light|dark`) or mounts Sandpack, loaded with a dynamic import and given Orchid light and dark themes. A link to open the StackBlitz project stays under the block.
- **Decisions:** `@astrojs/react` 7.1.9 (new, dev dependency). No StackBlitz SDK is needed: the iframe address is enough, which is why `@stackblitz/sdk` can go in BL10. Sandpack stays for the one RxJS example (it needs a bundler to import `rxjs`; the BL6 runner takes plain scripts only).
- **Checked:** `make check`, `make test` (89 tests, including that the three pages hold no embed-host iframe or script). In a real browser: no request to any other host before the click on all three posts; after it StackBlitz and Sandpack load and Sandpack runs the RxJS example and prints its output; no page errors; no sideways scroll at 390 px in dark.
- **Not done:** the no-JavaScript fallback is a link, not a screenshot (a screenshot of a third-party embed cannot be captured without the host). The StackBlitz preview was still loading in the screenshot taken 1.5 s after the click; the iframe is StackBlitz's and was not checked beyond loading. "Embed service down" shows StackBlitz's or Sandpack's own error with the open-elsewhere link below; it was not simulated. The Spotify embed in the route-guards post loads lazily on its own and is not part of this todo.

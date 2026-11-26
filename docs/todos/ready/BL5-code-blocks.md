# BL5: Code blocks: glass frame, focus lines, twoslash

| Field | Value |
|---|---|
| ID | `BL5` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D3, D5 |
| Depends on | BL3 |
| ADRs | None |
| Branch | `feat/bl5-code-blocks` |
| PR title | `feat: add glass code blocks with focus lines and twoslash` |
| Size | L |
| PR | — |

## Goal

Code blocks in the agreed design with the old blog's behaviours: dimmed focus lines, an error band, a highlighted line, a filename label and Copy, and twoslash type popovers on TypeScript 6.

## Context

- [docs/design/blog-site.html](../../design/blog-site.html), article page.
- Plan D5 and open question O4 (twoslash on TypeScript 6 with the Angular type packages).

## Scope

**In scope:** Shiki with `@shikijs/transformers` and `@shikijs/twoslash`; a rehype step wrapping each block; callout styles (note, tip, warning); inline code.

**Out of scope:** Live examples (BL6, BL7).

## Target files

| File | Change |
|---|---|
| `astro.config.mjs` | Shiki config, themes, transformers |
| `src/plugins/code-frame.ts` | (new) wraps a block with label and Copy |
| `src/components/CopyButton.astro` | (new) |
| `src/styles/code.css` | (new) glass, focus, error band, tones for light and dark |

## Steps

- [ ] Prove twoslash on one post (the `@defer` post) first; record the result in the PR.
- [ ] Move the Angular type packages to a dev dependency used only by twoslash.
- [ ] Port the 35 twoslash lines.
- [ ] Check contrast of every code colour in both themes.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| Block with no filename | No label, Copy still shown |
| Clipboard blocked | Selects the text instead |
| Long line | Scrolls inside the block |

## Acceptance criteria

- The `@defer` post matches the mockup in light and dark.
- All posts with twoslash build without errors.
- Contrast at least 4.5:1 for code text.

## Tests

Build test for twoslash posts; a contrast test over the tokens; a browser test for Copy.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/design/README.md` if tokens change.

## Risks and open questions

If twoslash fails on TypeScript 6, stop and record it; do not drop type checking silently.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

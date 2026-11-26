# BL5: Code blocks: glass frame, focus lines, twoslash

| Field | Value |
|---|---|
| ID | `BL5` |
| Status | `done` |
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

- [x] Prove twoslash on one post (the `@defer` post) first; record the result in the PR.
- [x] Move the Angular type packages to a dev dependency used only by twoslash.
- [x] Port the 35 twoslash lines.
- [x] Check contrast of every code colour in both themes.

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Built:** the frosted-glass frame (a lilac tint, no border, no shadow) with a label and a Copy button on every block; dimmed focus lines, highlighted lines, diff lines (`+` and `-` markers as well as a tint), an error band, and twoslash type popovers. Code colours are CSS variables (`--code-*`, from Shiki's css-variables theme) that follow the design tokens, so light and dark need no second theme. Files: `src/plugins/code-frame.mjs`, `src/styles/code.css`, `src/scripts/copy-code.ts`, and the Shiki settings in `astro.config.mjs`.
- **Twoslash on TypeScript 6 with the Angular type packages works** (plan O4): it ran on every block that asks for it across the 8 posts with no type error thrown, and real errors show as a band with a wavy underline.
- **Shiki settings go in `markdown.shikiConfig`, not in `unified()`.** `unified()` ignores them. BL3's two Shiki themes were therefore silently never applied (the posts used Shiki's default theme); that is now fixed.
- **HTML, JSON and plain text need the plugin's own handling** of `// [!code focus]`, `highlight`, `++` and `--`, because Shiki's notation transformers only read comments that the language has. `// @error: message` in an HTML block becomes the same band twoslash draws in TypeScript. TypeScript, JavaScript and SCSS use the stock transformers.
- **Copy** copies the code as written (it leaves out popups, completion lists and error bands) and falls back to selecting the text when the clipboard is blocked. The button stays hidden without JavaScript.
- **Labels** are the block's `title="..."` if there is one, otherwise the language. The posts have no filenames, so every label is a language today (`txt`, `text` and `plaintext` all read "text").
- **The twoslash stylesheet is ours**, not the package's: the stock one has rounded corners and a shadow.
- **Contrast:** `tests/contrast.test.ts` checks every code colour at 4.5:1 on the glass, highlighted, added and removed lines and the error band, in both themes, computed from `tokens.css`. The design's tone colours were just under 4.5:1 in light mode, so the code colours are those tones mixed 8 to 20 percent toward the ink colour.
- **Also fixed:** a long inline code span on the dynamic-components post pushed the page 72 px wide at 390 px (it was already like that since BL3); inline code now wraps.
- **Checked:** `make check` and `make test` (73 tests, including that no `[!code` marker or `@error:` line is left in any of the 21 posts, every one of the 100-plus blocks has a frame, label and Copy button, twoslash popups exist, and focus and diff lines are marked). In a browser: the error band, the diff block, a type popup and a TypeScript error band in light mode, one block in dark mode, Copy putting the code on the clipboard without the error text, and no sideways scroll at 390 px on three posts.
- **Not done:** the Angular type packages are still in `dependencies`; BL10 moves them. The popups and the diff block were not viewed in dark mode or on a phone. The embeds are still placeholders (BL7).

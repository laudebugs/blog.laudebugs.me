# BL2: Astro skeleton: tokens, fonts, layout, theme, logo

| Field | Value |
|---|---|
| ID | `BL2` |
| Status | `done` |
| Plan | [plan](../../plans/astro-rebuild.md), D1, D3, D4, D10 |
| Depends on | BL1 |
| ADRs | [0002](../../decisions/0002-rebuild-the-blog-on-astro.md) |
| Branch | `feat/bl2-astro-skeleton` |
| PR title | `feat: add the Astro skeleton with tokens, fonts and layout` |
| Size | L (split if over 400 lines) |
| PR | — |

## Goal

A new Astro 7 site that builds and shows a placeholder home page in the agreed look: tokens, self-hosted fonts, the page layout with header and footer, the light and dark theme, the logo and icons.

## Context

- [docs/design/README.md](../../design/README.md): tokens and decisions.
- [docs/design/blog-site.html](../../design/blog-site.html): the reference.
- Plan D3, D4, D10.

## Scope

**In scope:** Astro config, `src/styles/tokens.css`, `@fontsource` fonts, `Base` layout, header (brand, nav, search link), footer, theme toggle with no flash, favicon and icons, `make check-code` and `make test` wired to the real commands.

**Out of scope:** Posts (BL3), listing pages (BL4), code blocks (BL5), search (BL8).

## Target files

| File | Change |
|---|---|
| `astro.config.mjs`, `package.json`, `tsconfig.json`, `biome.json` | (new) Astro 7, TypeScript 6.0.3, Biome, exact pins |
| `src/styles/tokens.css`, `global.css` | (new) the tokens from docs/design, graph paper, square corners |
| `src/layouts/Base.astro`, `src/components/Header.astro`, `Footer.astro`, `ThemeToggle.astro` | (new) |
| `public/` icons and favicon | (new) from docs/design/logo |
| `Makefile` | wire `check-code`, `test`, `fmt` |

## Steps

- [x] Add the Astro app beside the Vocs site, in the repo root, without removing Vocs.
- [x] Pin dependencies exactly, each at least one week old.
- [x] Port the tokens, fonts and the layout from the mockup.
- [x] Theme: follow `prefers-color-scheme`, toggle stored in `localStorage`, set before first paint.
- [x] Fill the Makefile targets.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| No JavaScript | Theme follows the system; the page still reads |
| localStorage blocked | Falls back to the system theme without an error |
| Reduced motion | No transitions |

## Acceptance criteria

- `pnpm build` writes a static site.
- Placeholder home page matches blog-site.html at 390 and 1440 px in light and dark.
- No external font requests; every corner square; no shadows.
- `make check` and `make test` run real checks.

## Tests

Vitest for the theme script; a build test that fails on a request to `fonts.googleapis.com`.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/layout.md`, `docs/agents/commands.md`, `AGENTS.md`.

## Risks and open questions

Astro, Biome and TypeScript 6 must work together (`astro check` needs TypeScript 6).

## Definition of done

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Built:** Astro 7.4.13 beside Vocs, static output; design tokens in `src/styles/tokens.css` (light, and dark twice: system and explicit); self-hosted Lora (400, 400 italic, 500, 600) and DM Mono from `@fontsource`; the layout with header, footer and the inline mark; a light and dark toggle that remembers the choice and sets the theme before first paint; icons from `docs/design/logo`; a placeholder home page.
- **Pinned, each at least a week old:** `astro` 7.4.13, `@astrojs/check` 0.9.12, `typescript` 6.0.3, `@biomejs/biome` 2.6.9, `vitest` 5.1.2, `@fontsource/lora` and `@fontsource/dm-mono` 5.3.0. The rest of `package.json` is Vocs's and is pinned in BL10.
- **Checked in a browser** at 390 and 1440 px, light and dark: no sideways scroll, no request outside the site, the five faces used all load from the site, the toggle changes the theme and keeps it after a reload, and with JavaScript off the button stays hidden. Compared with the mockup by eye, not by pixel diff.
- **Deviations from the sketch:**
  - The header has no search link until BL8. Its "archive", "topics", RSS and `llms.txt` links point at pages that arrive in BL3 and BL4, so they 404 until then.
  - The theme button shows the name of the theme it would switch to.
  - Biome covers the Astro site's code only (`src`, `tests` and config); the scaffold's `scripts/` and `.astro` files are left to `astro check`.
  - `engines.node` is `>=22` and `.nvmrc` is 24, so Vercel's build of the Vocs site is not affected.
- **TypeScript 6 broke the Vocs build** (twoslash sets options TypeScript 6 deprecates). Fixed with `twoslash.compilerOptions.ignoreDeprecations: '6.0'` in `vocs.config.ts`; the 21 posts build and the sampled page is byte-for-byte the same size as the live one. Remove with Vocs in BL12.
- **Still open:** the CI workflow is staged, not installed (see BL1); the `code` job runs once the owner installs it.

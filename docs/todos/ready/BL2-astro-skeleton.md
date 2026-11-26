# BL2: Astro skeleton: tokens, fonts, layout, theme, logo

| Field | Value |
|---|---|
| ID | `BL2` |
| Status | `ready` |
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

- [ ] Add the Astro app beside the Vocs site, in the repo root, without removing Vocs.
- [ ] Pin dependencies exactly, each at least one week old.
- [ ] Port the tokens, fonts and the layout from the mockup.
- [ ] Theme: follow `prefers-color-scheme`, toggle stored in `localStorage`, set before first paint.
- [ ] Fill the Makefile targets.

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

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

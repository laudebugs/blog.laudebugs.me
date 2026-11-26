# BL8: Search: Pagefind and the search modal

| Field | Value |
|---|---|
| ID | `BL8` |
| Status | `done` |
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

- [x] Index titles, tags and text.
- [x] Open on `/`, close on Escape, move with arrow keys, open with Enter.
- [x] Focus trap and return focus on close.

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [x] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [x] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Built:** Pagefind 1.6.0 (MIT) indexes the built site: `pnpm site:build` runs `astro build && pagefind --site dist`, and only the article of each post is indexed (21 pages, 2,607 words, the topics as a filter). The dialog is a native `<dialog>` (focus trap, Escape and focus return come from the browser) with a combobox input and a listbox of results; `src/components/SearchDialog.astro`, `src/scripts/search.ts`, `src/styles/search.css`. The header's "search /" button and the `/` key open it. The index is loaded on first open, so reading a post fetches nothing.
- **Results** show the title, date and topics and an excerpt with the matches marked; each links to its post. Excerpts leave out bylines, cover credits, the code frame labels and twoslash popups (`pagefind.yml`), which had made them noisy.
- **No results:** a message with a link to the archive. **No JavaScript:** the trigger stays hidden and the archive link is in the header. **Dev server:** no index, so the dialog says search needs the built site.
- **Changed with it:** the build test scans the site's own CSS, not Pagefind's stock UI files, which the site does not use.
- **Checked:** `make check`, `make test` (95 tests: index holds 21 posts, dialog and trigger on every kind of page, arrow-key wrapping). In a real browser: `/` opens the dialog with focus in the input and nothing from Pagefind loaded before; typing gives results; arrows move and wrap; Enter opens the highlighted post; Escape closes; a no-match query shows the archive link; typing `/` inside the input types a slash; at 390 px in dark there is no sideways scroll. axe-core found no violations in the open modal in light and dark (two were found first and fixed: a low-contrast match highlight and a button name that did not contain its visible text).
- **Not done:** axe was run by hand (axe-core in a scratch folder), not in CI, and the keyboard use was checked by hand: the owner decided against end-to-end tests, so there is no Playwright test file. Search was not tried on a phone, only at a 390 px window.

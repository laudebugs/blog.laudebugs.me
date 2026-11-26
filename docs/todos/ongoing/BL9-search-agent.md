# BL9: Search agent in the browser

| Field | Value |
|---|---|
| ID | `BL9` |
| Status | `ongoing` |
| Plan | [plan](../../plans/astro-rebuild.md), D8 |
| Depends on | BL8 |
| ADRs | A new ADR for the runtime and model chosen |
| Branch | `feat/bl9-search-agent` |
| PR title | `feat: add an in-browser search agent` |
| Size | L (spike first, then split) |
| PR | — |

## Goal

An Ask mode in the search modal where a model that runs in the visitor's browser searches the posts with read-only tools, fills the result list with links to real posts and says why they match.

## Context

- Plan D8: in-browser, opt-in download, read-only tools, fallback to plain search.
- `@buildanagent/sdk` (alpha): check whether it runs in a browser.

## Scope

**In scope:** A spike measuring download size, first answer time and answer quality for the built-in browser model API and a small WebGPU model on a phone and a laptop; the tools; the opt-in UI; the fallback; a small evaluation set.

**Out of scope:** Any server component.

## Target files

| File | Change |
|---|---|
| `docs/research/search-agent/README.md` | (new) the spike's results |
| `docs/decisions/0003-*.md` | (new) the runtime and model chosen |
| `src/agent/**` | (new) tools, loop, model loader |
| `src/components/AskMode.astro` | (new) |

## Steps

- [x] Run the spike and write it up before choosing.
- [x] Write the ADR.
- [x] Build the tools over the Pagefind index.
- [x] Download only after the visitor opts in; show progress; allow cancel. (Chrome owns the download and does not tell us its size, so the dialog shows progress, not a size.)
- [x] Test the fallback.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| No WebGPU or no built-in model | Ask mode hidden; plain search |
| Download declined or fails | Plain search |
| Model returns a post that does not exist | It is dropped; only indexed posts are shown |

## Acceptance criteria

- The evaluation set meets a threshold recorded in the ADR.
- Nothing the visitor types leaves the browser (a network test).
- Search works with Ask off.

## Tests

Evaluation set; a Playwright test that blocks all network except the model files and checks no request carries the query.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/layout.md`.

## Risks and open questions

Quality of a small model: the spike can conclude that it is not good enough yet; then this todo records that and ships plain search only.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record (in progress)

Built 2026-11-26. This todo stays in `ongoing/` because its first acceptance criterion needs a real browser model, which this session could not run.

- **Spike:** [docs/research/search-agent](../../research/search-agent/README.md). A CPU model in the page is too slow (about 1 token a second) and the two small ones tried ignored the instruction; the built-in model API is stubbed in this container's Chromium; there is no GPU. Plain search finds the right post in the top 3 for 5 of 14 questions, or 9 of 14 with keywords written by hand.
- **Decision:** [ADR 0003](../../decisions/0003-search-agent-on-the-browsers-built-in-model.md), Proposed: Chrome's built-in Prompt API behind a `ModelProvider` interface; a WebGPU model is not built.
- **Built:** `src/agent/` (`model.ts` the provider, `tools.ts` three read-only tools, `loop.ts` the bounded loop and its grounding), `src/scripts/pagefind.ts` (the shared index loader), the Ask toggle, consent panel and progress in the search dialog (`src/components/SearchDialog.astro`, `src/scripts/search.ts`). The model's reply is limited to four actions by a JSON schema; every suggested address must be one a tool returned in that run; reasons are shown as text.
- **Fallback:** the Ask button appears only when `availability()` is not `unavailable`; a model that fails, does not return JSON, takes too many steps or suggests only invented posts gives the ordinary results with a note.
- **Checked:** `make check`, `make test` (11 loop tests with a scripted model: grounding, invented addresses dropped, step limit, bad JSON, a thrown error, read-only actions; the 14 questions point at real posts). In a real browser with a scripted stand-in for the built-in model: no model, so Ask hidden and plain search works; a `downloadable` model shows the consent panel and sends no prompt before it is accepted; a grounded answer shows only the real post with its reason as plain text; no request carried the question and no host other than the site was contacted; a junk reply falls back to the usual results.
- **Not done (pending):** the evaluation on a real Chrome with the model (needs at least 11 of 14 in the top 3, per the ADR); any timing, download size or memory on a real device; a WebGPU runtime; a Playwright test file in the repo (BL11 adds Playwright). The browser checks above were run by hand against a stand-in, so they show the page's behaviour, not any model's quality.

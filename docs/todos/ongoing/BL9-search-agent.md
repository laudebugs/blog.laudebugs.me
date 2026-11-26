# BL9: Search agent in the browser

| Field | Value |
|---|---|
| ID | `BL9` |
| Status | `ready` |
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

- [ ] Run the spike and write it up before choosing.
- [ ] Write the ADR.
- [ ] Build the tools over the Pagefind index.
- [ ] Download only after the visitor opts in; show size and progress; allow cancel.
- [ ] Test the fallback.

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

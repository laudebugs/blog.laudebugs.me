# BL6: Live examples: tested files, Example component, in-browser runner

| Field | Value |
|---|---|
| ID | `BL6` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D6 |
| Depends on | BL5 |
| ADRs | None |
| Branch | `feat/bl6-live-examples` |
| PR title | `feat: add tested live examples with an in-browser runner` |
| Size | L (split runner and component if needed) |
| PR | — |

## Goal

Examples whose code comes from a tested file in `examples/`, shown with their output, with an Edit and run button for plain TypeScript and JavaScript that runs in a module worker.

## Context

- Lamina PDF docs: `Snippet.astro`, `Example.astro`, `runner/` (CodeMirror, Sucrase, a module worker, a 30 second limit).
- [docs/design/blog-site.html](../../design/blog-site.html): the live example block.

## Scope

**In scope:** `examples/` with CI type-check and run; `Example` component; the runner worker; the first example, the `@defer` demo from the mockup.

**Out of scope:** Angular examples (BL7).

## Target files

| File | Change |
|---|---|
| `examples/**` | (new) tested files |
| `src/components/Example.astro` | (new) reads a file at build time |
| `src/runner/worker.ts`, `run.ts` | (new) Sucrase strips types, worker runs, 30 s limit |
| `src/components/Editor.tsx` or CodeMirror island | (new) |

## Steps

- [ ] Add `make check-code` coverage for `examples/`.
- [ ] Port the Lamina `Example` and runner pattern.
- [ ] Style the block as in the mockup (glass, Run, output).
- [ ] Stop runaway code after 30 seconds and start a fresh worker.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| Code throws | Message shown in the output area |
| Infinite loop | Stopped after 30 s |
| No JavaScript | The code and its recorded output are still shown |

## Acceptance criteria

- The `@defer` example runs in the browser and its output matches the recorded one.
- A test fails if a shown file is not in `examples/`.

## Tests

Vitest for the runner with a fake worker; Playwright for Run.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/layout.md`, `docs/agents/commands.md`.

## Risks and open questions

Running arbitrary edited code: it runs in a worker with no access to the page.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

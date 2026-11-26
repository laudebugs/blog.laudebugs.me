# BL6: Live examples: tested files, Example component, in-browser runner

| Field | Value |
|---|---|
| ID | `BL6` |
| Status | `done` |
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

- [x] Add `make check-code` coverage for `examples/`.
- [x] Port the Lamina `Example` and runner pattern.
- [x] Style the block as in the mockup (glass, Run, output).
- [x] Stop runaway code after 30 seconds and start a fresh worker.

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [x] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [x] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Built:** `examples/defer-viewchild.ts` with its recorded output; `src/components/Example.astro` (reads both files at build time and fails the build if either is missing); `src/runner/` (`execute.ts` strips types with Sucrase and runs the script with a collecting console, `worker.ts` runs it in a module worker, `run.ts` starts a fresh worker per run and stops it after 30 seconds); `src/scripts/example.ts` (the buttons) and `src/styles/example.css`. The example sits in the viewChild post as "Fig. 1 · Try it".
- **Decisions:** a plain `<textarea>` as in the design mockup, not CodeMirror (no new dependency; the example is a dozen lines). The only new dependency is `sucrase` 3.35.1 (MIT, published 2025-11-19). The code is shown by Astro's `Code` with the blog's css-variables theme (now in `src/plugins/code-theme.mjs`, shared with `astro.config.mjs`), so it follows light and dark.
- **Scope of the runner:** plain scripts only; imports and exports give a clear message. The three Angular examples are BL7's islands, not this runner.
- **Checked:** `make check`, `make test` (86 tests: the runner with a fake worker including the time limit, every example against its recorded output, every `<Example file>` in a post exists, and the built page shows code and output without JavaScript). In a real browser: Edit and run, Run gives the recorded output, a throw shows `Error: boom`, an infinite loop is stopped with the 30 second message (clock fast-forwarded, not waited out) and the next run works, no console errors, no sideways scroll at 390 px in dark, and with JavaScript off the code and recorded output show and the buttons do not.
- **Not done:** only one example exists; the Vocs copy of the post has none; the 30 second limit was tested with a fast-forwarded clock, not 30 real seconds.

**Follow-up, 2026-11-26:** Edit and Run are now two buttons, and Edit opens CodeMirror 6 with line numbers and the same syntax colours as the code blocks (`src/scripts/code-editor.ts`), replacing the textarea. It is a separate chunk loaded only when Edit is pressed, so reading a post downloads nothing extra. Escape leaves the editor for the Run button, because Tab indents inside it. New dependencies, pinned to releases at least a week old, all MIT: `@codemirror/state` 6.7.6, `view` 6.43.15, `commands` 6.11.1, `language` 6.13.1, `lang-javascript` 6.2.5 and `@lezer/highlight` 1.2.5.

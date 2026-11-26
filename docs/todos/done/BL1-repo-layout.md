# BL1: Lay out the repo like scaffold

| Field | Value |
|---|---|
| ID | `BL1` |
| Status | `done` |
| Plan | [plan](../../plans/astro-rebuild.md), D1, D9 |
| Depends on | None |
| ADRs | [0002](../../decisions/0002-rebuild-the-blog-on-astro.md) |
| Branch | `docs/bl1-repo-layout` |
| PR title | `docs: lay out the repo like scaffold and record the Astro plan` |
| Size | L (mostly copied files) |
| PR | — |

## Goal

Give the blog repo the `scaffold` structure (agent rules, one `Makefile`, `docs/` with indexes, todo board, CI with a `gate` job, Dependabot) and record the Astro decision, the plan, the design and the todos, without touching the running Vocs site.

## Context

- [plan](../../plans/astro-rebuild.md): D1, D9.
- `laudebugs/scaffold`: the layout copied.
- [ADR 0002](../../decisions/0002-rebuild-the-blog-on-astro.md): the decision.

## Scope

**In scope:** `AGENTS.md` (with the `CLAUDE.md` symlink), `Makefile`, `docs/` folders and indexes, `scripts/`, `.github/`, `.agents/skills/`, config files, ADR 0002, the plan, `docs/design/`, all todos.

**Out of scope:** Any Astro code (BL2). Moving the Vocs site out of `docs/` (BL3). Filling `check-code` and `test` (BL2, BL11).

## Target files

| File | Change |
|---|---|
| `AGENTS.md`, `CLAUDE.md` | (new) agent rules; `CLAUDE.md` is a symlink |
| `Makefile`, `scripts/*` | (new) one entry point and the todo and doc-index checks |
| `docs/**` | (new) scaffold folders, ADR 0002, the plan, `docs/design/`, `docs/todos/` |
| `.github/**`, `docs/guides/ci-workflow.yml` | (new) Dependabot with a cooldown, PR and issue templates; the CI workflow with `gate`, staged for the owner to install |
| .agents/`, `.claude/ | (new) skills and settings |
| .gitignore, .editorconfig, .gitattributes, .env.example, .jscpd.json | (new or merged) |

## Steps

- [x] Copy the scaffold files, leaving out its scaffold-only docs.
- [x] Fill `AGENTS.md`, `docs/agents/*` and the README for this repo.
- [x] Exempt the Vocs folders in `docs/` from the doc-index check until BL3.
- [x] Write ADR 0002, copy the plan, add `docs/design/`.
- [x] Write the todos BL1 to BL13 from the plan.
- [x] `make check` passes.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| A Vocs folder in `docs/` has no README | The doc-index check skips it until BL3 |
| Vocs routing | Only `docs/pages` is routed, so the new folders in `docs/` are not pages |

## Acceptance criteria

- `make check` passes.
- The Vocs site is unchanged: `package.json`, `vocs.config.ts` and `docs/pages` are as before.
- Every `docs/` folder has a README index that links its files.

## Tests

`scripts/check-todos.mjs` and `scripts/check-doc-indexes.mjs` (from the scaffold).

## Verification

```sh
make check
make test
```

## Docs to update

None beyond the files this todo adds.

## Risks and open questions

`check-code` and `test` are still stubs, so CI's code job proves nothing until BL2.

## Definition of done

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26. Built from the scaffold at `d2a1a6b`. Differences from the scaffold: the doc-index check skips the Vocs folders in `docs/`; `scaffold-origins`, `bootstrap.md` and `using-this-scaffold.md` were left out; `.gitignore` keeps the blog's own lines; Dependabot also covers npm with the same 7 day cooldown. No licence file was added: the repo had none and the choice is the owner's. Still open, for the owner: install the CI workflow (`docs/guides/install-the-ci-workflow.md`; a session cannot push workflow files), then set branch protection with the `gate` check and squash-only merges.

# <ID>: <Title>

<!-- Copy to docs/todos/ready/<ID>-<kebab-slug>.md. One todo is one pull request. If it is bigger than one reviewable PR, split (B4a, B4b) and chain with "Depends on". Keep the section order; write "None" where a section does not apply. -->

| Field | Value |
|---|---|
| ID | `<ID>` |
| Status | `ready` |
| Plan | [plan](../../plans/<plan>.md), section and decision |
| Depends on | None |
| ADRs | None |
| Branch | `<type>/<id>-<slug>` |
| PR title | `<type>(<scope>): <summary>` |
| Size | S (under 200 changed lines) / M (200-400) / L (over 400: split before you start) |
| PR | — |

## Goal

One paragraph.

## Context

Links to research, ADRs, spikes, earlier PRs, each with one line on why it matters.

## Scope

**In scope:**

**Out of scope** (name the todo that covers it):

## Target files

| File | Change |
|---|---|
| `path/to/file` | (new) what it does |

## Steps

- [ ] Detailed enough that someone new can do them in order.

## Edge cases (must be covered)

| Input | Expected |
|---|---|

## Acceptance criteria

Observable and checkable. CI green is implied.

## Tests

Which kinds, where, which fixtures, minimum case counts.

## Verification

```sh
make check
make test
```

## Docs to update

Plans, ADR status, `AGENTS.md`, `docs/agents/`, READMEs, guidelines.

## Risks and open questions

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

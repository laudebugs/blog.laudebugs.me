# BL10: Pin and police dependencies

| Field | Value |
|---|---|
| ID | `BL10` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D11 |
| Depends on | BL4 |
| ADRs | None |
| Branch | `chore/bl10-dependencies` |
| PR title | `chore: pin dependencies exactly and add a release-age check` |
| Size | M |
| PR | — |

## Goal

Every dependency is pinned exactly, at least one week old, with the keep, replace, move and drop lists applied.

## Context

- Plan D11. Build an Agent's rule: exact pins, at least a week old.

## Scope

**In scope:** `package.json`, `.npmrc` (`save-exact`), `pnpm-workspace.yaml` build-script allowlist, a script that fails on a range or a version under a week old, Dependabot npm settings.

**Out of scope:** Runtime code.

## Target files

| File | Change |
|---|---|
| `.npmrc` | (new) `save-exact=true` |
| `scripts/check-deps.mjs` | (new) |
| `package.json` | apply D11 |
| `.github/dependabot.yml` | npm with cooldown |

## Steps

- [ ] Remove the dropped packages and move the Angular packages to dev dependencies.
- [ ] Pin exactly.
- [ ] Write the check and add it to `make check-code`.
- [ ] Run an audit and record any exception with a reason and a date.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| A range in `package.json` | Check fails naming the package |
| A release under a week old | Check fails unless a security exception is recorded |

## Acceptance criteria

- `make check` passes with the new check.
- No `latest` tags remain.

## Tests

Unit tests for the check script.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/ci-and-release.md`.

## Risks and open questions

None.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

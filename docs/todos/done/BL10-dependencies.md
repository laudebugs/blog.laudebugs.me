# BL10: Pin and police dependencies

| Field | Value |
|---|---|
| ID | `BL10` |
| Status | `done` |
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

- [x] Remove the dropped packages and move the Angular packages to dev dependencies.
- [x] Pin exactly.
- [x] Write the check and add it to `make check-code`.
- [x] Run an audit and record any exception with a reason and a date.

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [x] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [x] `/writing-review` run on any prose
- [x] `make check` and `make test` green
- [x] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

## Implementation Record

Done 2026-11-26.

- **Pinned:** every dependency is an exact version (no `^`, `~` or `latest`); `.npmrc` has `save-exact=true`. `scripts/check-deps.mjs` fails on anything else and, with `--age` (which `make check-code` passes), on a version under 7 days old unless `scripts/dependency-exceptions.json` has an exception. It found two real problems on its first run: Biome 2.6.9 and Vitest 5.1.2 were under a week old, so they are now 2.6.8 and 5.1.1.
- **Removed:** `ts-node`, `feed`, `feed-core` and `marked` (nothing imports them; Vocs still builds with `pnpm build`).
- **Moved to dev dependencies:** the Angular packages, `rxjs`, `@module-federation/enhanced` and `@nx/module-federation` (only twoslash reads them). `@angular/common` is now listed too, because pnpm had picked an old copy of it as a peer.
- **Kept for now, because Vocs still builds on Vercel until BL12:** `@uidotdev/usehooks`, `date-fns`, `gray-matter`, `@stackblitz/sdk`, `prettier`, `vocs`. The plan's "drop" list is therefore smaller than planned: `@nx/module-federation` stays because a twoslash block in the module-federation post imports its types. `@stackblitz/sdk` is no longer used by the Astro site but is used by the Vocs component.
- **Audit:** the Angular packages are now 21.2.26 (they had seven high or moderate advisories at 21.1.1); `pnpm.overrides` pins `mdast-util-to-hast`, `yaml` and `source-map-js` to patched releases. `pnpm audit` went from 258 findings (1 critical, 101 high) to 240 (1 critical, 89 high). What remains comes through `vocs` (126 advisories), the two module-federation type packages and `@astrojs/check`; it is recorded with its reason in [ci-and-release.md](../../agents/ci-and-release.md#dependencies) and is reviewed at BL12.
- **Checked:** `make check`, `make test` (112 tests, 5 new for the check), and `pnpm build` (Vocs).
- **Not done:** the `pnpm approve-builds` warning on install is still shown; `ignoredBuiltDependencies` in `pnpm-workspace.yaml` and in `package.json` did not silence it on pnpm 10.28, so neither was kept. The Dependabot file already had npm with a 7 day cooldown, so it is unchanged. `playwright` is added by BL11.

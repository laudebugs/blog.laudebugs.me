# BL12: Cutover: Cloudflare, DNS, retire Vercel, delete Vocs

| Field | Value |
|---|---|
| ID | `BL12` |
| Status | `ready` |
| Plan | [plan](../../plans/astro-rebuild.md), D12, D13 |
| Depends on | BL6, BL7, BL9, BL10 |
| ADRs | None |
| Branch | `chore/bl12-cutover` |
| PR title | `chore: cut over to the Astro site on Cloudflare` |
| Size | M |
| PR | — |

## Goal

The new site serves `blog.laudebugs.me` from Cloudflare, the old site and Vocs are gone.

## Context

- The step-by-step runbook, with what a session has already prepared, is [docs/guides/migrate-to-cloudflare.md](../../guides/migrate-to-cloudflare.md).
- Plan D12, D13. Build an Agent's deploy workflows are the pattern (build with no secrets, deploy from `main`, a preview per pull request).

## Scope

**In scope:** Cloudflare project and previews; deploy workflow; the parity report; the DNS change; retire the Vercel project after a few days of real traffic; delete Vocs, its config and its dependencies.

**Out of scope:** Removing the fallback in `laudebugs.me` (BL13).

## Target files

| File | Change |
|---|---|
| `wrangler.jsonc`, `public/_headers`, `scripts/parity.mjs` | Done in advance (see the guide); the `routes` entry is added at step 8 |
| `.github/workflows/deploy.yml`, `preview.yml` | Staged in `docs/guides/cloudflare/`; the owner installs them |
| `vocs.config.ts`, Vocs dependencies | (removed) |

## Steps

- [ ] Deploy to the Cloudflare address and run the parity report: addresses, feed, covers, `posts-index.json`.
- [ ] Owner changes DNS.
- [ ] Watch for a few days; then retire Vercel and delete Vocs.

## Edge cases (must be covered)

| Input | Expected |
|---|---|
| An old address returns 404 on the new site | Cutover is blocked |
| The main site cannot read the new index | Its fallback (BL4b) covers it |

## Acceptance criteria

- Parity report clean.
- The old Vercel project is retired only after the new one has served real traffic.

## Tests

The parity script.

## Verification

```sh
make check
make test
```

## Docs to update

`docs/agents/ci-and-release.md`, `README.md`.

## Risks and open questions

DNS and Vercel actions need the owner.

## Definition of done

- [ ] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [ ] Follows the applicable guidelines
- [ ] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [ ] `/writing-review` run on any prose
- [ ] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added

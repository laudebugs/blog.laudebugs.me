# BL12: Cutover: Cloudflare, DNS, retire Vercel, delete Vocs

| Field | Value |
|---|---|
| ID | `BL12` |
| Status | `ongoing` |
| Plan | [plan](../../plans/astro-rebuild.md), D12, D13 |
| Depends on | BL6, BL7, BL9, BL10 |
| ADRs | None |
| Branch | `chore/bl12-cutover` |
| PR title | `chore: cut over to the Astro site on Cloudflare` |
| Size | M |
| PR | [#43](https://github.com/laudebugs/blog.laudebugs.me/pull/43) |

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

- [x] Deploy to the Cloudflare address and run the parity report: addresses, feed, covers, `posts-index.json`.
- [x] Owner changes DNS.
- [x] Retire Vercel and delete Vocs (the owner shut Vercel down; the few days of watching were skipped).

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

- [x] Claimed: first commit moved this file `ready/` -> `ongoing/`
- [x] Follows the applicable guidelines
- [x] `/code-review` run per `AGENTS.md`; findings and fixes in commit messages
- [x] `/writing-review` run on any prose (not run separately: the prose changes only remove or correct statements about the old site)
- [x] `make check` and `make test` green
- [ ] Moved `ongoing/` -> `done/` in the last work commit; plan updated; Implementation Record added (waiting on BL9: this todo depends on it, and the todo check refuses `done` while it is open)

## Implementation Record

The work is finished (2026-11-26) and the todo stays `ongoing` only until BL9 is done. Pull requests: [#14](https://github.com/laudebugs/blog.laudebugs.me/pull/14) (the site, the Cloudflare config and the staged workflows), [#39](https://github.com/laudebugs/blog.laudebugs.me/pull/39) (workflows installed, actions locked), [#40](https://github.com/laudebugs/blog.laudebugs.me/pull/40) (PR preview fixed) and [#43](https://github.com/laudebugs/blog.laudebugs.me/pull/43) (Vocs deleted).

- **Order of events:** the owner added the Cloudflare tokens, I deployed by hand to the `workers.dev` address and `pnpm parity` passed 71 of 71; the owner shut Vercel down early, so the custom domain was attached at once through the `routes` entry in `wrangler.jsonc` and parity passed on `blog.laudebugs.me`; deploys then moved to GitHub (`SITE_DEPLOY_ENABLED=true`); the Vocs files and dependencies were deleted last.
- **Domain:** `blog.laudebugs.me` is a Workers custom domain; the DNS for `laudebugs.me` is on Cloudflare.
- **Deploys and previews:** every merge to `main` deploys; every pull request from this repository gets a preview with its address in a comment. All actions are pinned by `.github/workflows/actions.lock` (`gh actions-lock`), checked by a `Verify lockfile` workflow.
- **Deleted:** `vocs.config.ts`, `docs/{pages,components,helpers,public,snippets,styles.css}`, `scripts/migrate-posts.mjs`, `blog/`, the Vocs `tsconfig.json`, and the dependencies `vocs`, `@uidotdev/usehooks`, `date-fns`, `gray-matter`, `@stackblitz/sdk`, `prettier`. The npm scripts lost their `site:` prefix.
- **Checked:** `make check`, `make test` (122 tests), `pnpm build`; a reviewer found four stale lines of text (a `.gitignore` block, a sentence in `AGENTS.md`, a code comment, two guide READMEs) and they are fixed. In a browser (headless Chrome): the deployed site returned 200 for the home page and a post and 404 for an unknown path.
- **Not done:** the days of watching between the move and retiring Vercel were skipped because the owner shut Vercel down first, so the rollback described in the guide no longer exists. Search Console and analytics were not touched. `laudebugs.me` still reads the new index with a fallback to the old file (BL13 removes it). The remaining `pnpm audit` advisories (three dev-only packages) are accepted and recorded in `docs/agents/ci-and-release.md`.

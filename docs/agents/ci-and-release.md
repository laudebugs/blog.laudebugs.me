# CI and release

## Principles

- CI calls the same `make` targets developers run.
- **One aggregate gate job** (`gate`) is the only required status check in branch protection. Individual jobs can then change without editing the protection rule.
- Permissions default to `contents: read`; a job asks for more only when it needs it.
- Concurrency cancels superseded runs on a PR. Deploys are serialized and never cancelled.
- Every job has `timeout-minutes`.
- No retries in PR lanes: report flaky tests, do not hide them.
- Hangs are caught by the test runner's timeout, not by wall-clock assertions.

## Supply chain (turn these on when the project has dependencies)

- Pin actions: `gh actions-lock` records each tag's commit in `.github/workflows/actions.lock`; a CI job verifies it.
- Dependabot weekly with a cooldown, and the same minimum release age in your package manager.
- Every audit or licence ignore carries a reason and a review date.
- Workflows that handle untrusted PR code use `pull_request_target` only to read, never to run PR code; pass PR fields through `env:`, never `${{ }}` inside `run:`.
- Build with no secrets; deploy from `main` with the secrets.

## Workflow changes are staged, not pushed

A session cannot push workflow files. The owner installed `.github/workflows/ci.yml` on 2026-11-26 from `docs/guides/ci-workflow.yml` ([guide](../guides/update-the-ci-workflow.md)); the two must stay the same. To change the workflow, edit the staged copy and ask the owner to copy it over.

## Dependencies

- **Exact pins, at least a week old.** `.npmrc` sets `save-exact`; `scripts/check-deps.mjs` (part of `make check-code`) fails on a range or a tag such as `latest`, and, when the npm registry is reachable, on a pinned version published less than 7 days ago. A newer release is allowed only for a known vulnerability, with an entry in `scripts/dependency-exceptions.json` (name@version, reason, date). If the registry cannot be reached the age check is skipped with a warning.
- **Transitive fixes** go in `pnpm.overrides` in `package.json`, each pinned to one release and limited to the vulnerable range.
- **Audit exceptions, reviewed at BL12 (recorded 2026-11-26):** `pnpm audit` still reports advisories that are accepted for now. Those through `vocs` go away when Vocs is deleted at the cutover. `@module-federation/enhanced` and `@nx/module-federation` (one critical, in `proxy-addr`) are dev dependencies that exist only so twoslash can type-check one post; nothing runs or ships from them. `@astrojs/check` is a dev tool. None of these reach the built site. Remove or re-check them at BL12.
- Biome and Vitest were first set to their newest releases and moved back when the check found them under a week old.

## Releases

The blog is a static site, so there are no package releases. Deploys are described by [plan D12](../plans/astro-rebuild.md):

- **Today:** Vercel builds the Vocs site from `main`. Nothing in this repo controls it.
- **After BL12:** a workflow builds the site with no secrets and uploads `dist/`; a second workflow runs from `main` and deploys to Cloudflare Workers assets with the secrets. Each pull request from a branch of this repository gets a preview.
- **Supply chain:** Dependabot (weekly, 7 day cooldown) for GitHub Actions and npm; exact pins and a minimum release age of one week (BL10).

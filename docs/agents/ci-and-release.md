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

Workflow files can be pushed only with a GitHub token that has the `workflow` scope; check `gh auth status` before assuming either way. `ci.yml`, `deploy.yml` and `preview.yml` are each kept twice, in `.github/workflows/` and under `docs/guides/` (`ci-workflow.yml`, `cloudflare/deploy.yml`, `cloudflare/preview.yml`); change both so they stay the same.

**Actions are locked.** `.github/workflows/actions.lock` (made by GitHub's `gh actions-lock` extension) pins every direct and transitive action to a verified commit, and the `Verify lockfile` workflow fails a pull request when it is out of date. After you add a workflow or change any `uses:` line, run `gh actions-lock` and commit the lockfile with it; `gh actions-lock --verify` checks it without writing.

## Dependencies

- **Exact pins, at least a week old.** `.npmrc` sets `save-exact`; `scripts/check-deps.mjs` (part of `make check-code`) fails on a range or a tag such as `latest`, and, when the npm registry is reachable, on a pinned version published less than 7 days ago. A newer release is allowed only for a known vulnerability, with an entry in `scripts/dependency-exceptions.json` (name@version, reason, date). If the registry cannot be reached the age check is skipped with a warning.
- **Transitive fixes** go in `pnpm.overrides` in `package.json`, each pinned to one release and limited to the vulnerable range.
- **Audit exceptions (recorded 2026-11-26):** `pnpm audit` may still report advisories that are accepted for now. `@module-federation/enhanced` and `@nx/module-federation` (one critical, in `proxy-addr`) are dev dependencies that exist only so twoslash can type-check one post; nothing runs or ships from them. `@astrojs/check` is a dev tool. None of these reach the built site. Re-check them when `pnpm audit` is run.
- Biome and Vitest were first set to their newest releases and moved back when the check found them under a week old.

## Releases

The blog is a static site, so there are no package releases. Deploys are described by [plan D12](../plans/astro-rebuild.md):

- **Today:** a workflow builds the site with no secrets and uploads `dist/`; a second job runs from `main` and deploys to Cloudflare Workers assets with the secrets, when the repository variable `SITE_DEPLOY_ENABLED` is `true`. Each pull request from a branch of this repository gets a preview, with its address in a comment. The domain is attached by the `routes` entry in `wrangler.jsonc`. Vercel is shut down.
- **Supply chain:** Dependabot (weekly, 7 day cooldown) for GitHub Actions and npm; exact pins and a minimum release age of one week (BL10).

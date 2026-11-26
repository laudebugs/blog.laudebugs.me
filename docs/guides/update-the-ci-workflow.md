# Update the CI workflow

For the repo owner. A Claude Code session cannot push files under `.github/workflows/` (GitHub refuses the push without the `workflow` scope), so a changed workflow is staged here for you to install.

`.github/workflows/ci.yml` is already installed (commit `858fe65`), but it is the first version, which only runs `make check-code` and `make test` as stubs. Since BL2 those targets are real and need Node and pnpm, so **a newer version is staged at [ci-workflow.yml](ci-workflow.yml)**. Until you install it, the `code` job on pull requests fails with "pnpm: command not found".

## Steps

1. Copy the staged file over the installed one: `cp docs/guides/ci-workflow.yml .github/workflows/ci.yml`.
2. Commit and push it yourself (a normal push from your machine has the right scope), or paste it in the GitHub web editor.
3. Delete `docs/guides/ci-workflow.yml` in the same commit, so there is one copy.
4. In the repository settings, make the `gate` job the only required status check on `main`, require pull requests, and allow squash merges only.

The workflow runs `make check-docs` on every pull request and, when code changes, installs Node and pnpm and runs `make check-code` and `make test` (Biome, `astro check`, `tsc`, and Vitest with one real build).

## Roll back

Restore the previous `ci.yml` from git history. Nothing else depends on it.

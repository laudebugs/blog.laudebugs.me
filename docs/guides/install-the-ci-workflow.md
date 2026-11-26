# Install the CI workflow

For the repo owner. The Claude Code session that set up this repo cannot push files under `.github/workflows/` (GitHub refuses a push from its token without the `workflow` scope), so the workflow is staged here instead.

## Steps

1. Copy the file: `mkdir -p .github/workflows && cp docs/guides/ci-workflow.yml .github/workflows/ci.yml`.
2. Commit and push it yourself (a normal push from your machine has the right scope).
3. Delete `docs/guides/ci-workflow.yml` in the same commit, so there is one copy.
4. In the repository settings, make the `gate` job the only required status check on `main`, require pull requests, and allow squash merges only.

The workflow runs `make check-docs` on every pull request and `make check-code` and `make test` when code changes. They are stubs until BL2, so the `code` job passes without checking anything until then.

## Roll back

Delete `.github/workflows/ci.yml`. Nothing else depends on it.

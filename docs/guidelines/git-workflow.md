# Git workflow

## Use a bare repo and one worktree per todo

```sh
scripts/setup-bare-clone.sh git@github.com:you/project.git ~/git
# -> ~/git/project.git/{main, feat-login, fix-crash, ...}
```

- `main/` is **read-only**. Never commit in it, and never reuse another todo's worktree.
- One worktree per todo, named after the branch with `/` replaced by `-`. Review worktrees: `pr-<number>-review`.
- A plain clone also works; `scripts/worktree-new.sh` creates sibling worktrees there too.
- Dependencies (`node_modules/`, `target/`) are per worktree: install in each.
- **MUST NOT `git stash`.** `refs/stash` is shared by every worktree. Commit `wip: ...` and squash later.

## Start

```sh
scripts/worktree-new.sh feat/b2a-login-form   # pulls main, creates ../feat-b2a-login-form
```

## Branches

`<type>/<short-description>` in kebab-case. `type` is a Conventional Commit type: `feat fix docs refactor test perf build ci chore spike`. Include the todo ID when there is one: `feat/b2a-login-form`. Branches are short-lived. Rebase on `origin/main`; do not merge main in. Plans get their own `docs/<name>-plan` branch, so a plan lands before implementation.

## Commits

Conventional Commits: `type(scope): summary`. Summary is imperative, lowercase, no period, about 72 characters. Breaking changes use `!` or a `BREAKING CHANGE:` footer. The body explains **why**. Agent commits end with the attribution trailer the harness configures.

## Pull requests

- One PR per todo; one thing; under about 400 changed lines (the todo template's size L is the exception: split it if you can).
- The title is a Conventional Commit line: it becomes the squash commit.
- Description: Summary, what changed, sources and decisions, Test plan.
- Docs change in the same PR as the code.
- Claim a todo by opening the PR at once, with a first commit that moves the todo to `ongoing/` marked `[skip ci]`.

## Review

1. `/code-review high <PR#>` without `--comment`, so findings stay out of PR comments.
2. Fix findings in new commits; each message lists the findings it fixes. A regression test for a finding should fail on the pre-fix code.
3. More than 6 confirmed findings: run a second, lower-effort review. A finding shown false does not count.
4. Prose changes: `/writing-review` after the code is final. If a prose fix changed code, run one more low review, then stop; further findings go in the PR description as follow-ups.
5. Reviewer order: correctness and safety, API surface, boundaries, tests, then docs and style. Leave to tools what a tool can enforce.

## Squash-merge with an explicit body

Squash-merge when CI is green and every finding is fixed or explained. Linear history.

```sh
gh pr merge <PR#> --squash --delete-branch --body "<summary of the change>"
```

**Always pass `--body`.** The default squash body lists every commit message, including the claim commit's `[skip ci]`, which would skip every workflow on `main`.

## Clean up

```sh
scripts/worktree-clean.sh feat/b2a-login-form   # refuses unless the PR is MERGED
```

`git worktree list` should show only live work.

## Releases

After a version PR merges, merge nothing else until the release run completes: `gh run list --workflow release.yml --limit 1 --json status,conclusion`.

#!/usr/bin/env bash
# Clone a repo in the bare + worktrees layout:  <name>.git/{main, feat-x, ...}
#   scripts/setup-bare-clone.sh git@github.com:you/project.git [parent-dir]
set -euo pipefail
url="${1:?usage: setup-bare-clone.sh <url> [parent-dir]}"
parent="${2:-.}"
name="$(basename "$url" .git)"
git clone --bare "$url" "$parent/$name.git"
cd "$parent/$name.git"
git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'   # bare clones lack this
git fetch origin --quiet
default="$(git symbolic-ref --short HEAD)"
git worktree add main "$default"
echo "ready: $PWD/main  (read-only: never commit here; use scripts/worktree-new.sh)"
[ "$default" = "main" ] || echo "note: default branch is '$default'; the docs and scripts assume 'main'. Rename it on GitHub."

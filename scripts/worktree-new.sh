#!/usr/bin/env bash
# Create a todo's worktree next to the repo, branched from origin/main.
#   scripts/worktree-new.sh feat/b2a-login-form
# Folder name = branch name with "/" replaced by "-". Works in a bare-repo layout
# (run from <name>.git/main) and in a normal clone. Never touches your current branch.
set -euo pipefail
branch="${1:?usage: worktree-new.sh <type>/<short-description>}"
if ! printf '%s' "$branch" | grep -Eq '^(feat|fix|docs|refactor|test|perf|build|ci|chore|spike)/[a-z0-9]+(-[a-z0-9]+)*$'; then
  echo "branch must be <type>/<kebab-description>; type is one of: feat fix docs refactor test perf build ci chore spike" >&2
  exit 1
fi
top="$(git rev-parse --show-toplevel)"
git -C "$top" fetch origin main --quiet
dest="$(dirname "$top")/${branch//\//-}"
git -C "$top" worktree add -b "$branch" "$dest" origin/main
echo "worktree ready: $dest"
echo "next: cd \"$dest\" and install dependencies there (they are per worktree)"

#!/usr/bin/env bash
# Remove a merged todo's worktree and branch. Run from any worktree except the one being removed.
#   scripts/worktree-clean.sh feat/b2a-login-form
set -euo pipefail
branch="${1:?usage: worktree-clean.sh <type>/<short-description>}"
state="$(gh pr view "$branch" --json state -q .state 2>/dev/null || echo UNKNOWN)"
if [ "$state" != "MERGED" ]; then echo "PR for $branch is $state, not MERGED. Refusing." >&2; exit 1; fi

# Find worktrees by branch, so this works wherever they live.
wt_for() { git worktree list --porcelain | awk -v b="refs/heads/$1" '/^worktree /{p=substr($0,10)} $0=="branch " b {print p}'; }
dest="$(wt_for "$branch")"
main_wt="$(wt_for main)"
[ -n "$main_wt" ] || { echo "no worktree has main checked out; create one: git worktree add main main" >&2; exit 1; }
if [ -n "$dest" ]; then
  case "$PWD/" in "$dest"/*) echo "you are inside $dest; cd to another worktree first" >&2; exit 1 ;; esac
  git -C "$main_wt" worktree remove "$dest"
fi
git -C "$main_wt" branch -D "$branch"          # squash merges need -D
git -C "$main_wt" push origin --delete "$branch" 2>/dev/null || true
git -C "$main_wt" worktree prune
git -C "$main_wt" pull --ff-only origin main
git -C "$main_wt" worktree list

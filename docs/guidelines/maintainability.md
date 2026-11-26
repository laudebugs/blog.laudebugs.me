# Maintainability

Each rule names its check. A rule with no script is a reviewer's call.

| Rule | Check (wire to your stack in `make check-code`) |
|---|---|
| One home per concept: search before writing a helper | Duplication detector (e.g. `jscpd`, min 10 lines / 50 tokens) |
| Function and module size budgets (suggested: functions <= 100 lines, modules <= 800) | Linter size and complexity rules |
| No unused files, exports, or dependencies | Dead-code tool (e.g. `knip`) |
| No import cycles; packages reach each other by name, never by relative path | Dependency graph checker (e.g. `dependency-cruiser`) |
| One public path per item | Reviewer |
| No test code in shipped code | Reviewer / build config |
| No todo IDs in source (they belong in commits and plans) | Script: grep source for ID patterns |
| Comments say why, not what | Reviewer |
| Licences allow the dependency; advisories are triaged | Licence/advisory tool; every ignore carries a **reason and a review date** |

## Baselines that only shrink

To adopt a strict rule on a messy codebase without a big-bang refactor:

1. Record every current violation in a baseline file (per-file worst value for size/complexity).
2. New or grown violations fail the check.
3. **The check also fails when the code improved and the baseline did not**, so you must lower the entry. Values only go down.
4. Compare against the merge base with `main`.
5. A new allow-list entry is a warning, not a failure: a reviewer decides.

Derive the health report's limits from the same linter config, so the limits never drift.

## Pin and age dependencies

Pin exactly (`save-exact`). Choose releases at least a week old, matched in dependabot's cooldown and the package manager's minimum release age. Exception: a known vulnerability moves you to the fixing release however new; record the alert in the upgrade commit.

## Never run third-party code with your credentials

Spawn it with an allowlisted environment (`PATH`, a temp `HOME`, `TMPDIR`, `LANG`, plus what the run needs), never the inherited environment, and block outbound network where you can. Tests are offline by default and fail if real credentials are set.

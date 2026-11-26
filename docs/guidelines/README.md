# Guidelines

How we work. Rules use **MUST**, **SHOULD**, **MUST NOT**. When a guideline and a skill disagree, the guideline wins; if the skill is better, change the guideline in its own PR.

| Guideline | Summary |
|---|---|
| [git-workflow.md](git-workflow.md) | Worktrees, branches, commits, PRs, review, merge, cleanup |
| [bug-triage.md](bug-triage.md) | Reproduce, measure, fix the cause, prove it, record it |
| [maintainability.md](maintainability.md) | One home per concept, size budgets, baselines that only shrink |
| [docs-writing.md](docs-writing.md) | Sentence and paragraph limits, banned words, headings that state claims |

## Known gaps tell old debt from new violations

A rule with no script is a reviewer's call. List known violations here so a reviewer can tell old debt from a new violation.

| Gap | Rule it breaks | Todo that closes it |
|---|---|---|
| Many headings in `docs/` are topic labels, not claims | [docs-writing.md](docs-writing.md), first rule | none yet |

# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. `CLAUDE.md` is a symlink to this file, so edit `AGENTS.md` only.

This file holds what every session needs. Detail lives in `docs/agents/`, one file per topic: read the one for your area before you start. Keep this file short; when it grows, move the detail out and leave a pointer.

## What this project is

Laurence Ininda's technical blog at https://blog.laudebugs.me: field notes on work and projects, with 21 posts (2020 to 2026) that are mostly about Angular, TypeScript and building with AI. It is being rebuilt from Vocs on Vercel to a plain Astro 7 site on Cloudflare, in the design recorded in `docs/design/` ([ADR 0002](docs/decisions/0002-rebuild-the-blog-on-astro.md), [plan](docs/plans/astro-rebuild.md)). Until the cutover (BL12) the repo holds both: the running Vocs site (`vocs.config.ts`, and under `docs/`: `pages/`, `components/`, `helpers/`, `public/`, `snippets/`) and the written docs.

Decisions are recorded as ADRs (architecture decision records) in `docs/decisions/`. Do not assume a decision that is not written there.

## Read the detail doc for your area first

| Read | Before you work on |
|---|---|
| `docs/agents/layout.md` | Adding or moving files and folders |
| `docs/agents/commands.md` | Running checks, tests, or builds |
| `docs/agents/ci-and-release.md` | CI, releases, dependency updates |
| `docs/guidelines/git-workflow.md` | Branches, worktrees, commits, PRs, merging |
| `docs/guidelines/bug-triage.md` | Diagnosing and recording a bug |
| `docs/guidelines/maintainability.md` | Size budgets, duplication, dead code, baselines |
| `docs/guidelines/docs-writing.md` | Any prose a human will read |
| `docs/standards/` | Coding, writing, and other standards for this project |

Update the `docs/agents/` file a change affects **in the same PR**.

## Repository layout

```
AGENTS.md  CLAUDE.md -> AGENTS.md   agent rules (this file)
Makefile                            single task entry point; CI runs the same targets
.agents/skills/                     skills (source of truth); .claude/skills symlinks here
docs/                               everything written down; every folder has a README index
  agents/ decisions/ plans/ todos/{ready,ongoing,done}/ bugs/ design/
  research/ guidelines/ standards/ guides/ reference/
  pages/ components/ helpers/ public/ snippets/   the current Vocs site (moved out by BL3)
scripts/                            repo tooling (todo board, doc-index check, worktree helpers)
.github/                            workflows, dependabot, PR and issue templates
vocs.config.ts, package.json        the current Vocs site (replaced by BL2 to BL12)
```

The Astro source (`src/`, `examples/`, `public/`) appears with BL2 and BL3; the line above moves with it.

## Twelve working agreements

1. **Work in a worktree, never on `main`.** `scripts/worktree-new.sh <type>/<desc>` creates one. Never commit on `main`; never stash (stashes are shared across worktrees; commit `wip:` instead). Remove the worktree after merge. Detail: `docs/guidelines/git-workflow.md`.
2. **Work from the todo board.** One todo is one branch and one PR. Pick the next todo in `docs/todos/ready/` whose `Depends on` are all in `done/`. Claim it in your first commit by moving it to `ongoing/`; move it to `done/` in your last work commit. The open PR is the lock: check `gh pr list` before starting.
3. **Plan before building.** Non-trivial work gets a plan in `docs/plans/` (copy `TEMPLATE.md`), then todos that link to it. Decisions that are hard to reverse get an ADR in `docs/decisions/`.
4. **Pull requests only.** Branch `<type>/<short-description>`; Conventional Commits (`type(scope): summary`); PR title is the squash commit. Squash-merge when CI is green and every review finding is fixed or explained.
5. **Review every PR before merging.** Run `/code-review high <PR#>` without `--comment`. Fix findings in new commits whose messages list each finding and its fix. If more than 6 findings were confirmed, run a second, lower-effort review. Prose changes also get `/writing-review`.
6. **Never patch code only to make a test pass.** Find out why it fails. Fix the product, or fix or remove a nonsensical test and say why in the commit message.
7. **Prove it works the way a user meets it.** UI changes are checked in a real browser; API-level tests do not prove a UI works. Record what you actually tested, and mark checks you could not run as pending.
8. **Document as you go.** Research, plans, decisions, bugs, and guides each have a folder. Add your file to that folder's README index in the same PR. Cite sources; label opinions.
9. **Comments say why, never which todo or review caused the code.** No todo IDs in source files; they belong in commits and plans.
10. **Never commit secrets.** Commit `.env.example`, never `.env`. Do not add a dependency without checking its licence.
11. **Use the project's skills** (`.agents/skills/`) and tell subagents to load them. Where a skill and a guideline disagree, the guideline wins; if the skill is better, change the guideline in its own PR.
12. **Name your session after its work**: `<AccountName>::<ProjectName>::<SessionName> - [<todo>:#<PR>]` (PascalCase). See the `session-name` skill.

## Environment quirks, dated, with the reason

- **2026-11-26: `/assets/posts.json` is read by laudebugs.me.** Do not rename or reshape it until BL4b has shipped there; `docs/plans/astro-rebuild.md` (O5) says how it is replaced.
- **2026-11-26: the site pins TypeScript 6.0.3, not 7.** `astro check` refuses TypeScript 7 and twoslash needs the compiler API (BL2, BL5).
- **2026-11-26: a session cannot push `.github/workflows/*`.** GitHub refuses it without the `workflow` scope. Stage the file under `docs/guides/` and add a guide for the owner, as `docs/guides/install-the-ci-workflow.md` does.
- **2026-11-26: the blog is hosted on Vercel until BL12.** Do not change DNS or the Vercel project; the owner does that.

## Run `make check` before every commit

`make help` lists everything. The ones you will use:

```
make check     # docs checks + your stack's gates: exactly what CI runs
make todos     # print the todo board (derived; never committed)
make doctor    # are the required tools installed?
make ci        # the whole fast lane locally
```

Detail: `docs/agents/commands.md`.

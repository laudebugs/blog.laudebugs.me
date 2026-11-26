# Skills

`.agents/skills/` is the source of truth. `.claude/skills` is a relative symlink to it.

One folder per skill, kebab-case, containing `SKILL.md` with YAML front matter:

```yaml
---
name: <must match the folder name>
description: <when to load this skill. Agents choose from this line alone, so say when, not what>
---
```

## Skill rules

- Keep a skill short enough to load in full. Link to references instead of copying them.
- State the version or date a skill was checked against, and update the skill when its subject changes.
- **Vendoring a third-party skill:** copy it at a recorded upstream commit, leave its files unchanged, and note the source and licence in `THIRD-PARTY-NOTICES.md`. Override anything you do not want in `AGENTS.md`. Update it only by copying a newer upstream commit.
- Skills the repo's rules depend on but does not vendor (for example `/code-review`, `/writing`, `/writing-review`) are installed in the maintainer's own Claude configuration. A session without them says so in the PR description.

| Skill | Use it when |
|---|---|
| [`session-name`](session-name/SKILL.md) | Several agent sessions run in parallel and need names that show the account, project, work item, and PR each owns |

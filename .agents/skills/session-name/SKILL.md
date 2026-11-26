---
name: session-name
description: Use when starting, finishing, or changing the PRs of a work session, to name the session after its account, project, and the todos and pull requests it owns.
---

# Naming a session

Several agent sessions run in parallel, often across accounts and projects. Name each one so the owner can tell at a glance whose project it is, which work item it holds, and which PRs it owns.

## Format

```
<AccountName>::<ProjectName>::<SessionName> - [<todoId>:#<PR>, <todoId>:#<PR>]
```

Example: `Laudebugs::Scaffold::Yanny - [B2a:#12, B3:#15]`. A PR with no todo is `#449` alone. A session with no PRs yet has no bracket: `Laudebugs::Scaffold::Yanny`.

- All three names are **PascalCase**: each word starts with a capital, no spaces, hyphens, or underscores. `build-an-agent` becomes `BuildAnAgent`; `lamina.git` becomes `Lamina`.
- `<AccountName>` is the account that owns the repo: `owner` in the `origin` remote's `owner/repo`.
- `<ProjectName>` is the repo name from the same remote, without a `.git` suffix.
- `<SessionName>` is a short, friendly, stable name for the session. Keep it for the session's whole life.
- Add a bracket entry when you open a PR. Drop it when the PR merges or the work moves to someone else.
- The three names never change mid-session; only the bracket does.

## You cannot rename yourself

An agent cannot rename its own session. Whenever the name changes, ask the owner to run `/rename <new name>`, in the same message that reports the change. State the full new name so they can paste it.

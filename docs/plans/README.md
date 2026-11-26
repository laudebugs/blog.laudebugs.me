# Plans

A plan is the design: what we build and why, the current state, the decisions, and the order. It never holds task specs; those are [todos](../todos/README.md) that link back to the plan.

- File: `kebab-case.md`. Copy [TEMPLATE.md](TEMPLATE.md).
- Status line at the top: `Draft`, `In progress`, `Done`, `Abandoned`. A plan stays `In progress` until its acceptance evidence (including live or device checks) is recorded.
- Rebaseline a plan against `main` before starting work from it (record the date and commit), so stale assumptions are caught.
- When two plans touch the same files, say which lands first.
- Add a row below in the same PR.

| Plan | Status |
|---|---|
| [astro-rebuild.md](astro-rebuild.md) | In progress |

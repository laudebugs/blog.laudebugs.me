# Todos

The work board. **One todo is one pull request.** The folder is the state.

| Folder | Meaning |
|---|---|
| `ready/` | Not started. Work may begin only if every `Depends on` is in `done/`. |
| `ongoing/` | A PR is open, or required acceptance is still outstanding. |
| `done/` | Delivered and verified for the stated scope. Keep results and limits; do not reuse old results as proof of new checks. |

## The folder is the state and the PR is the lock

- File: `<ID>-<kebab-slug>.md`. Copy [TEMPLATE.md](TEMPLATE.md). IDs are a short letter code per plan plus a number (`BL4`); split with a suffix (`BL4a`, `BL4b`).
- The `Status` field must equal the folder. A banner such as "On hold" overrides `Depends on`. A folder name never clears a gate.
- **Claim by PR.** Your first commit moves the file `ready/` -> `ongoing/` (use `[skip ci]`). The open PR is the lock: check `gh pr list`. Your last work commit moves it to `done/`.
- `Depends on` is the only record of ordering. There is no `Blocks` row.
- **The board is derived.** `make todos` prints it. Never commit one: it would change in every PR that moves a todo and make open PRs conflict.
- `make check-docs` fails on: status not matching folder, unknown dependency, a cycle, a done todo that depends on an unfinished one, a `Blocks` row.
- If work stops, close the PR. The todo is still in `ready/` on `main`.
- Exempt from needing a todo: bot PRs, CI maintenance, typos, bug fixes recorded in [bugs/](../bugs/README.md), refreshes of generated files.
- Todos must be low-level enough to execute: exact paths, signatures, edge cases, and the literal verification commands. Vague bullets are not todos.
- When a todo is done, add an **Implementation Record** (dated): what was built, deviations from the sketch, what is still open.


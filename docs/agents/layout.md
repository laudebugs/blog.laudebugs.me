# Layout

One line per top-level path: what it is, and which ADR explains it. Keep long explanations in each folder's own README.

| Path | What it holds |
|---|---|
| `docs/` | Everything written down; see [docs/README.md](../README.md) |
| `docs/design/` | The agreed look: mockups, tokens, logo files |
| `docs/pages/`, `components/`, `helpers/`, `public/`, `snippets/`, `styles.css` | **The current Vocs site** (21 posts, custom components, covers). Moved out of `docs/` by BL3; the doc-index check skips them until then |
| `vocs.config.ts`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json` | The current Vocs site's config. Replaced by the Astro config in BL2 and deleted in BL12 |
| `blog/` | An empty folder (`.gitkeep`) that `vocs.config.ts` names as `blogDir`. Deleted with Vocs in BL12 |
| `scripts/` | Repo tooling: todo board check, doc-index check, worktree helpers |
| `.github/` | Workflows, dependabot, PR and issue templates |
| `.agents/skills/` | Skills; `.claude/skills` symlinks here |

After BL2 and BL3 (see [plan D9](../plans/astro-rebuild.md)) the site source is `src/content/posts/<year>/<slug>.mdx`, `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/`, `src/lib/`, `public/` (covers, icons, `assets/`), and `examples/` (the tested example files). Update this table in those PRs.

## One home per concept

- One home per concept: search before writing a helper or a doc.
- A new top-level folder needs a row here and, if it is a design choice, an ADR.

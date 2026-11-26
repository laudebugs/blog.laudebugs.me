# Commands

`make help` is the source of truth. CI runs the same targets, so green locally means green in CI.

| Command | What it runs |
|---|---|
| `make check` | `check-docs` + `check-code` |
| `make check-docs` | `scripts/check-todos.mjs` (board consistency), `scripts/check-doc-indexes.mjs` (every doc is indexed) |
| `make check-code` | `pnpm run site:check`: Biome, `astro check` and `tsc` on the Astro site (the dependency check arrives with BL10; duplication: `.jscpd.json` is ready, `npx jscpd .`) |
| `make test` | `pnpm run site:test`: Vitest, including one real `astro build` into a temporary folder (the browser checks arrive with BL11); it also runs every file in `examples/` and compares it with its `.out.txt` |
| `make fmt` | `pnpm run site:fmt`: Biome formats the Astro site's code |
| `make todos` | Prints the derived todo board |
| `make doctor` | Verifies git, gh, node and pnpm are installed |
| `make ci` | `check` + `test`: the whole fast lane |

## The Astro site

| Script | What it does |
|---|---|
| `pnpm site:dev` | Dev server (http://localhost:4321) |
| `pnpm site:build` | Static build into `dist/`, then `pagefind --site dist` writes the search index to `dist/pagefind/` (config in `pagefind.yml`). `pnpm site:dev` has no index, so the dialog says search needs the built site; use `site:build` then `site:preview` to try search |
| `pnpm site:preview` | Serves `dist/` |
| `pnpm site:check` | Biome, `astro check --tsconfig tsconfig.site.json`, `tsc -p tsconfig.site.json` |
| `pnpm site:test` | Vitest |

Astro's anonymous telemetry is switched off in these scripts.

## The current Vocs site

Until the cutover (BL12) it still builds with `pnpm install` and `pnpm build` (`prebuild` writes `docs/public/assets/posts.json`) and runs with `pnpm dev`. These go away with BL12.

## Pin tool versions in one place

Node is pinned by `.nvmrc` (24) and `engines` (`>=22`); pnpm by `packageManager` in `package.json`. `make doctor` checks that node and pnpm exist.

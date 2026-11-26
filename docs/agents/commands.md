# Commands

`make help` is the source of truth. CI runs the same targets, so green locally means green in CI.

| Command | What it runs |
|---|---|
| `make check` | `check-docs` + `check-code` |
| `make check-docs` | `scripts/check-todos.mjs` (board consistency), `scripts/check-doc-indexes.mjs` (every doc is indexed) |
| `make check-code` | **Stub until BL2.** Then: `astro check`, Biome, `tsc`, the dependency check (BL10), duplication (`.jscpd.json` is ready: `npx jscpd .`) |
| `make test` | **Stub until BL2.** Then: Vitest, plus the browser checks (BL11) |
| `make todos` | Prints the derived todo board |
| `make doctor` | Verifies git, gh, node and pnpm are installed |
| `make ci` | `check` + `test`: the whole fast lane |

## The current Vocs site

Until the cutover (BL12) it still builds with `pnpm install` and `pnpm build` (`prebuild` writes `docs/public/assets/posts.json`) and runs with `pnpm dev`. These go away with BL12.

## Pin tool versions in one place

Pin runtimes and package managers in a file CI also reads (`.nvmrc`, `packageManager` in `package.json`), and have `make doctor` verify them. BL2 adds both.

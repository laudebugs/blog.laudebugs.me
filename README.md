# Laurence's Technical Blog

The source of https://blog.laudebugs.me: field notes on work and projects, mostly Angular, TypeScript and building with AI.

> **Being rebuilt.** The site is moving from Vocs on Vercel to a plain Astro 7 site on Cloudflare, in a new design. Start with [AGENTS.md](AGENTS.md), the [plan](docs/plans/astro-rebuild.md) and the [design](docs/design/README.md). Until the cutover this repo still holds the running Vocs site.

## Where things are

| | |
|---|---|
| [docs/design/](docs/design/README.md) | The agreed look: open `blog-site.html` in a browser |
| [docs/plans/astro-rebuild.md](docs/plans/astro-rebuild.md) | The plan: decisions and the order of work |
| [docs/todos/](docs/todos/README.md) | The work board: `make todos` |
| [docs/decisions/](docs/decisions/README.md) | ADRs |

## The current site (until BL12)

Built with [Vocs](https://vocs.dev), with [Sandpack](https://sandpack.codesandbox.io/) and [StackBlitz](https://stackblitz.com/) embeds in three posts.

```sh
pnpm install
pnpm dev      # writes docs/public/assets/posts.json first, then runs vocs dev
pnpm build
```

`prebuild` runs `docs/helpers/gen-post-archive.js`, which writes `docs/public/assets/posts.json`. laudebugs.me reads that file for its latest-post cards.

When using twoslash, the `// comments` must be at the start of the line.

## Checks

```sh
make check     # todo board, doc indexes, Biome, astro check and tsc
make test      # Vitest, including one real build
```

## The Astro site (in progress)

```sh
pnpm install
pnpm site:dev     # http://localhost:4321
pnpm site:build   # static build into dist/
```

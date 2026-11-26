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

The Vocs files are still in the repo but nothing builds them any more: Vercel is shut down and the `pnpm dev` and `pnpm build` scripts are gone. They are deleted in the last step of [the cutover guide](docs/guides/migrate-to-cloudflare.md). Use the `site:*` commands below.

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

# Laurence's Technical Blog

The source of https://blog.laudebugs.me: field notes on work and projects, mostly Angular, TypeScript and building with AI.

> The site is a plain Astro 7 site served by Cloudflare. It was rebuilt from Vocs on Vercel; start with [AGENTS.md](AGENTS.md), the [plan](docs/plans/astro-rebuild.md) and the [design](docs/design/README.md).

## Where things are

| | |
|---|---|
| [docs/design/](docs/design/README.md) | The agreed look: open `blog-site.html` in a browser |
| [docs/plans/astro-rebuild.md](docs/plans/astro-rebuild.md) | The plan: decisions and the order of work |
| [docs/todos/](docs/todos/README.md) | The work board: `make todos` |
| [docs/decisions/](docs/decisions/README.md) | ADRs |

## Writing posts

Posts are MDX files in `src/content/posts/<year>/`. Some have Sandpack and StackBlitz embeds, and one has a live example.

When using twoslash, the `// comments` must be at the start of the line.

## Checks

```sh
make check     # todo board, doc indexes, Biome, astro check and tsc
make test      # Vitest, including one real build
```

## The Astro site (in progress)

```sh
pnpm install
pnpm dev     # http://localhost:4321
pnpm build   # static build into dist/
```

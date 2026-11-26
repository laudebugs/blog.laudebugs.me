# 0002. Rebuild the blog on Astro 7 and host it on Cloudflare

- **Status:** Accepted (owner, 2026-11-26)
- **Date:** 2026-11-26
- **Plan:** [astro-rebuild.md](../plans/astro-rebuild.md), D1 and D12

## Context

The blog runs on Vocs 1.4.1 and is hosted on Vercel. Vocs 2.14.1 (as of 2026-11-26) is a different architecture (Waku, Vite 8, React 19, Tailwind 4), so staying on Vocs means a major migration too. Vocs 2 has a built-in `Sandbox` for live examples, but it ships its own layout, and the agreed design (graph-paper pages, a year-grouped list, glass code blocks, a margin rail, no shadows or borders) is far from it. The owner's other projects, Lamina PDF's docs and the Build an Agent manual, already use Astro and have patterns the blog wants: tested code snippets, in-browser editable examples, Markdown copies of every page, Pagefind search and a preview for each pull request.

## Decision

- The blog becomes a **plain Astro 7 site** (not Starlight), static output, MDX posts in a content collection with a strict schema.
- It is **hosted on Cloudflare** (static assets, a preview for each pull request) instead of Vercel. The domain moves at cutover; the old site stays live until the parity checks pass.
- The repo follows the `scaffold` layout: `AGENTS.md`, `Makefile`, `docs/`, `scripts/`, `.github/`.
- Addresses, the feed, `llms.txt` and the cover images keep their paths. `/assets/posts.json` is replaced by a slim `/assets/posts-index.json` (plan O5).

## Consequences

- Twelve todos (BL1 to BL12) plus two in the `laudebugs.me` repo (BL4b, BL13), in [docs/todos/](../todos/README.md).
- The 21 posts and their custom components are rewritten for Astro (BL3). The Vocs site and its dependencies are deleted at cutover (BL12).
- Live examples and the search agent are built by us (BL6, BL7, BL9) rather than taken from Vocs's `Sandbox`.

## Alternatives considered

- **Upgrade to Vocs 2.** Smaller content migration and a ready-made `Sandbox`, but the design would fight its layout, and Vocs 2 depends on Waku, still a release candidate. Not verified: how far Vocs 2's layout slots can be restyled, and whether its `Sandbox` can run Angular.
- **Astro with Starlight.** Shaped like a docs site, with a sidebar and a docs theme.
- **Stay on Vocs 1.4.1.** Leaves the blog unstyled to the new design and on dependencies that are a major version behind.

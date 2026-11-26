# Decisions (ADRs)

One file per hard-to-reverse decision. Agents must not assume a decision that is not recorded here.

- **Name:** `NNNN-kebab-title.md`, numbered in order of creation. Numbers are never reused.
- **Title** states the decision, with the reason when short.
- **Status:** `Proposed`, `Accepted (owner, YYYY-MM-DD)`, or `Superseded by NNNN`. A provisional record names the todo whose check can change it.
- **Never rewrite an accepted record.** Add a dated `Amended` bullet under the header for a small change, or write a new record and mark the old one superseded.
- Copy [TEMPLATE.md](TEMPLATE.md). Add a row below in the same PR.

| ADR | Decision | Status | Plan |
|---|---|---|---|
| [0001](0001-record-decisions-as-adrs.md) | Record decisions as ADRs | Accepted | n/a |
| [0002](0002-rebuild-the-blog-on-astro.md) | Rebuild the blog on Astro 7 and host it on Cloudflare | Accepted | [astro-rebuild.md](../plans/astro-rebuild.md) |

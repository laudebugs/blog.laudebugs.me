# Move the blog from Vercel to Cloudflare

**For:** the owner. A session cannot do most of this: it needs your Cloudflare and GitHub accounts, your DNS, and permission to push workflow files, which sessions do not have. Everything a session could prepare is already in the repository, and this guide says what each piece is and what you do with it.

**Time:** about an hour of work, plus a few days of watching before Vercel is retired.

**Decisions this follows:** [ADR 0002](../decisions/0002-rebuild-the-blog-on-astro.md) and the plan's [D12 and D13](../plans/astro-rebuild.md). The todo is [BL12](../todos/ready/BL12-cutover.md).

## The plan in one paragraph

The new site is a folder of static files, `dist/`, made by `pnpm site:build`. Cloudflare serves that folder with Workers static assets: no server code. You first deploy it to a Cloudflare address of its own (`*.workers.dev`) while Vercel keeps serving `blog.laudebugs.me`. A script checks that every old link still works on the new copy. Then you move the domain, watch for a few days, retire Vercel, and delete the old Vocs code. Nothing changes for readers until you move the domain, and moving it back undoes the switch.

## What is already in the repository

| File | What it does |
|---|---|
| `wrangler.jsonc` | Tells Cloudflare to serve `dist/`. Trailing slashes are dropped (`/posts/2025/slug`, as on the old site), and an unknown path gets `dist/404.html` with a 404. It has no domain yet, on purpose (step 8). |
| `public/_headers` | Caches `/_astro/*` for a year (those files are fingerprinted) and sends two safe headers. Everything else revalidates, so a new post shows at once. |
| `scripts/parity.mjs` (`pnpm site:parity <address>`) | Fetches the 21 old post addresses, their Markdown copies, the feed, sitemap, `llms.txt`, `posts-index.json` and every cover from a deployed copy, and lists what fails. It only reads. |
| `docs/guides/cloudflare/deploy.yml` | Staged workflow: builds with no secrets, then deploys from `main`. |
| `docs/guides/cloudflare/preview.yml` | Staged workflow: a preview address for each pull request, deleted when it closes. |
| `wrangler` 4.165.0 | A pinned dev dependency, for deploying from your machine. The workflows pin the same version. |

## Before you start: two things to check

1. **Where does the DNS for `laudebugs.me` live?** A Worker can only be attached to a domain whose zone is active on Cloudflare ([custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), read 2026-11-26). Run `dig NS laudebugs.me` or look at your registrar.
   - **On Cloudflare already:** step 8 is a few clicks.
   - **Somewhere else (Vercel DNS, your registrar):** you must either move the whole `laudebugs.me` zone to Cloudflare, which also affects `laudebugs.me` itself and any mail records, or find another way to point only the `blog` name at Cloudflare. I did not verify what Cloudflare offers for pointing a single subdomain from outside its DNS, or what it costs, so check that before choosing. If you move the zone, copy every existing record first and compare them afterwards.
2. **A Cloudflare account** and, in GitHub, admin rights on `laudebugs/blog.laudebugs.me` (secrets, environments and variables are repository settings).

## Steps

### 1. Make a Cloudflare API token

In the Cloudflare dashboard: **My Profile → API Tokens → Create Token → Create Custom Token**.

- **Permission:** Account → Workers Scripts → Edit. Nothing else. Attaching the domain is a dashboard action you do yourself in step 8, so the token needs no zone or DNS permission.
- **Account resources:** include only your account.
- Copy the token once; Cloudflare does not show it again. Also copy your **Account ID** (Workers & Pages overview, right-hand side).

### 2. Set up GitHub

In the repository's **Settings**:

1. **Environments → New environment → `cloudflare`.** Under deployment branches, allow `main` and pull requests from this repository if you want previews; otherwise only `main`. A required reviewer is optional.
2. In that environment add two **secrets**: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. (You can do it with `gh secret set CLOUDFLARE_API_TOKEN --env cloudflare`.)
3. Under **Variables**, add a repository variable `SITE_DEPLOY_ENABLED` with the value `false`. It is the switch: no workflow deploys until it is `true`.
4. Under **Branches**, protect `main`: require the `gate` check and allow squash merges only. (This is the setting from the CI guide; skip it if you did it.)

### 3. Install the two workflows

Copy the staged files into place and push them from your machine (a session cannot):

```sh
cp docs/guides/cloudflare/deploy.yml  .github/workflows/deploy.yml
cp docs/guides/cloudflare/preview.yml .github/workflows/preview.yml
```

What they do, so you can judge them before pushing:

- **`deploy.yml`** runs on every push to `main`. The `build` job has no secrets: it installs from the lockfile, builds the site and uploads `dist/`. The `deploy` job runs only when `SITE_DEPLOY_ENABLED` is `true`, in the `cloudflare` environment, downloads that artifact and runs `wrangler deploy`. It installs nothing from the repository, because this is the job that holds the token. Deploys never cancel each other.
- **`preview.yml`** runs for each pull request opened from a branch of this repository, never a fork (a fork's code must not get the secrets). It builds, creates a Cloudflare preview named `pr-<number>`, runs the parity script against it, and comments the address on the pull request. When the pull request closes, a cleanup job deletes the preview. Preview addresses are public.
- Both set `permissions: contents: read` and add `pull-requests: write` only to the job that comments.

If you change either file, change the staged copy in the repository too, so the two stay the same.  The existing CI workflow does not change.

### 4. Deploy once by hand

This gives you the address and proves the setup before any automation:

```sh
pnpm install
pnpm site:build
pnpm exec wrangler login      # opens a browser once
pnpm exec wrangler deploy
```

Wrangler prints the address, in the form `https://blog-laudebugs-me.<your-subdomain>.workers.dev`. The first deploy creates the Worker named `blog-laudebugs-me`. Open the address and look at the home page, one post, the archive and the 404 page (`/nothing-here`).

Limits to be aware of (from Cloudflare's [limits page](https://developers.cloudflare.com/workers/platform/limits/), read 2026-11-26): the free plan allows 20,000 static asset files per version and 25 MiB per file. The site has 190 files totalling 13 MB, so it is far inside both.

### 5. Run the parity check

```sh
pnpm site:parity https://blog-laudebugs-me.<your-subdomain>.workers.dev
```

It checks 71 paths and prints each failure, or `71 of 71 paths ok`. It exits with an error if anything fails, so it can gate a deploy. **Do not move the domain until it is clean.** On a clean run it has proven:

- all 21 old post addresses answer 200 with no trailing slash, and so do their `.md` copies;
- `/rss.xml`, `/sitemap-index.xml`, `/llms.txt`, `/llms-full.txt` and `/assets/posts-index.json` exist, and the index has version 1 and 21 posts (`laudebugs.me` reads it);
- every cover image under `/assets/post-covers/` answers.

It does not check what the pages look like. Look yourself at: the home page, an article with code (twoslash popup on hover, Copy button), the post with the live example (Edit and run), one of the three Angular posts (press "Load the example"), search (`/`), the theme toggle, and a phone-width window.

One thing differs from Vercel and is worth knowing: with `drop-trailing-slash`, `/posts/2025/slug/` redirects (307) to `/posts/2025/slug`. The canonical form is the one without a slash, which is what the old site and the feed use. Both forms work for a reader.

### 6. Let GitHub deploy

1. Merge the pull request to `main`. Vercel will also build `main` with `pnpm build` (the old Vocs site) until you retire it; that still works.
2. Set the variable `SITE_DEPLOY_ENABLED` to `true`.
3. Re-run the **Deploy** workflow (Actions → Deploy → Run workflow). Check that the run is green and that the `workers.dev` address shows the latest build.

From here, every merge to `main` deploys, and every pull request gets a preview with a comment.

### 7. Lower the DNS TTL (a day before the move)

If the current record for `blog` has a long TTL, lower it to 300 seconds a day ahead. When you move the domain, readers then pick up the change in minutes, and moving back is just as quick.

### 8. Move the domain

Do this when parity is clean and you have a quiet hour.

1. **Remove the old record.** Cloudflare cannot attach a custom domain to a name that already has a `CNAME` record. In the DNS for `laudebugs.me`, delete the record that points `blog` at Vercel (usually a `CNAME` to a `vercel-dns` name). Note its exact value first, in case you move back.
2. **Attach the domain.** Cloudflare dashboard → Workers & Pages → `blog-laudebugs-me` → Settings → Domains & Routes → Add → **Custom domain** → `blog.laudebugs.me`. Cloudflare creates the DNS record and the certificate. Wait until the status says active.
3. **Make it permanent in the repository.** Add this to `wrangler.jsonc` so deploys keep it, and merge it:

   ```jsonc
   "routes": [{ "pattern": "blog.laudebugs.me", "custom_domain": true }]
   ```

   Adding it only now matters: with it in place, a deploy tries to claim the domain, and before step 1 that would fail or fight with Vercel.
4. **Run parity again** against the real address: `pnpm site:parity https://blog.laudebugs.me`.

### 9. Check what depends on the old address

- **`laudebugs.me`** reads `/assets/posts.json` today. The new site does not serve that file; the replacement is `/assets/posts-index.json` and [BL4b](../todos/ready/BL4b-main-site-reads-posts-index.md) makes `laudebugs.me` read it, with a fallback. **Ship BL4b before you move the domain**, or the main site's post list will break when the old file disappears. This is the one step that can hurt readers.
- **Feed readers** that subscribed to the old site: the old site had no feed, so none can. The new feed is `/rss.xml`.
- **Search Console and analytics**, if you use them: the sitemap moves to `/sitemap-index.xml`. Resubmit it.
- **Links in `laudebugs.me`, GitHub profile and social profiles** keep working because the addresses did not change.

### 10. Watch for a few days

Open Workers & Pages → `blog-laudebugs-me` → Metrics. Look for requests that return 404 (an old link the parity list missed) and for errors. Read your own posts on a phone and a laptop. Keep Vercel exactly as it is for this time: it is the way back.

### 11. Retire Vercel

After a few days of real traffic with no problems:

1. In the Vercel project, remove the domain `blog.laudebugs.me`.
2. Delete the Vercel project (or pause it; deleting also stops its preview builds on pull requests).
3. Remove Vercel's GitHub app access to this repository if it is no longer used, and any `vercel` settings files if they exist.

### 12. Delete the old site (the last commit of BL12)

In one pull request, remove what only Vocs used. It is safe once Vercel is gone, because nothing builds it any more:

- `vocs.config.ts`, and under `docs/`: `pages/`, `components/`, `helpers/`, `public/`, `snippets/`, `styles.css`;
- `scripts/migrate-posts.mjs`;
- the dependencies `vocs`, `@uidotdev/usehooks`, `date-fns`, `gray-matter`, `@stackblitz/sdk` and `prettier`, plus the `prettier` block in `package.json`;
- the `dev`, `prebuild`, `build`, `preview` and `gen-types` scripts; rename the `site:*` scripts to the plain names and update the `Makefile` and the workflows to match;
- the audit exceptions in `docs/agents/ci-and-release.md` that came through Vocs, and re-run `pnpm audit`;
- the "posts exist twice" and "keep `pnpm build` for Vocs" lines in `AGENTS.md`, and the Vocs rows in `docs/agents/layout.md`.

Then run `make check` and `make test`, and move BL12 to `done/`.

## If something goes wrong

| Problem | What to do |
|---|---|
| The new site is wrong after the move | Delete the custom domain in Cloudflare (Settings → Domains & Routes), re-add the old `CNAME` you noted in step 8, and Vercel serves again within the TTL you set in step 7. Vercel must still be live for this, which is why it is retired last. |
| A deploy ships a bad build | In Cloudflare, Workers & Pages → the Worker → Deployments → roll back to the previous version, or revert the commit and let the workflow deploy again. |
| `wrangler deploy` fails to attach the domain | You added `routes` before removing the old record. Remove `routes`, deploy, then redo step 8. |
| Previews stop appearing | `SITE_DEPLOY_ENABLED` is not `true`, the pull request is from a fork, or the `cloudflare` environment does not allow the branch. |
| The token leaks | Delete it in Cloudflare (My Profile → API Tokens), make a new one, and replace the secret. The token can only edit Workers scripts on your account, which is why it is scoped that narrowly. |
| The main site's post list is empty | BL4b was not shipped first. Re-add the old domain target (above) or restore `posts.json` handling in `laudebugs.me`. |

## What is not verified

- Nothing in this guide has been run against a real Cloudflare account. The Cloudflare behaviour described comes from its documentation, read on 2026-11-26: [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [static site and 404 pages](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/), [headers](https://developers.cloudflare.com/workers/static-assets/headers/), [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [previews](https://developers.cloudflare.com/workers/previews/examples/) (the `wrangler preview` command needs Wrangler 4.135.0 or later) and [limits](https://developers.cloudflare.com/workers/platform/limits/).
- The two workflow files parse as YAML but have never run, and the parity script was run only against the local preview (71 of 71).
- Wrangler's exact output for `preview --json` (the workflow reads `.preview.urls[0]`) is taken from Cloudflare's example, not run.
- Cloudflare's pricing and any options for a domain whose DNS is elsewhere are not covered.

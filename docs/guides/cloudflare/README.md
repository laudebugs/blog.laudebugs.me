# Staged Cloudflare workflows

The deploy and preview workflows for the move to Cloudflare. A session cannot push `.github/workflows/*`, so they wait here until the owner copies them. The runbook is [../migrate-to-cloudflare.md](../migrate-to-cloudflare.md).

| File | Install as | What it does |
|---|---|---|
| [deploy.yml](deploy.yml) | `.github/workflows/deploy.yml` | Builds with no secrets, then deploys from `main` while `SITE_DEPLOY_ENABLED` is `true` |
| [preview.yml](preview.yml) | `.github/workflows/preview.yml` | A preview for each pull request from this repository, deleted when it closes |

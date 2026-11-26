import { defineConfig } from 'astro/config';

// The blog is a static site. `site` is the production origin; previews override it with ASTRO_SITE.
export default defineConfig({
  site: process.env.ASTRO_SITE ?? 'https://blog.laudebugs.me',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});

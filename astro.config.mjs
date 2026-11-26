import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { remarkCallouts } from './src/plugins/remark-callouts.mjs';

// The blog is a static site. `site` is the production origin; previews override it with ASTRO_SITE.
export default defineConfig({
  site: process.env.ASTRO_SITE ?? 'https://blog.laudebugs.me',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [mdx(), sitemap()],
  markdown: {
    // Astro 7's default processor runs no remark or rehype plugins, so the posts use `unified()`.
    // Both Shiki themes are emitted as CSS variables; src/styles/code.css picks one. BL5 restyles the blocks.
    processor: unified({
      remarkPlugins: [remarkDirective, remarkCallouts],
      shikiConfig: { themes: { light: 'github-light', dark: 'night-owl' }, defaultColor: false },
    }),
  },
});

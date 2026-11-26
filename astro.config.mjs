import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { transformerNotationDiff, transformerNotationFocus, transformerNotationHighlight } from '@shikijs/transformers';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { codeFrame } from './src/plugins/code-frame.mjs';
import { codeTheme } from './src/plugins/code-theme.mjs';
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
    // Shiki is configured here, not in `unified()`.
    processor: unified({ remarkPlugins: [remarkDirective, remarkCallouts] }),
    // Code blocks: focus and highlight notation, twoslash type popovers for blocks marked `twoslash` (as in Vocs),
    // and the frame with its label and Copy button.
    shikiConfig: {
      theme: codeTheme,
      transformers: [
        transformerNotationFocus(),
        transformerNotationHighlight(),
        transformerNotationDiff(),
        transformerTwoslash({ explicitTrigger: true, renderer: rendererRich() }),
        codeFrame(),
      ],
    },
  },
});

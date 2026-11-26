# Design

The agreed look of the blog, as mockups and assets. The mockups are single HTML files: open them in a browser. They are the reference for BL2 to BL5, not code to ship.

| File | What it is |
|---|---|
| [blog-site.html](blog-site.html) | **The final design.** Home, article, archive, topics, one topic, search and 404, with a Light and Dark toggle. Also published at https://claude.ai/artifact/UakAnvKGezMFGV7E67MAhQ |
| [body-fonts.html](body-fonts.html) | The body font exploration: 24 sans-serif fonts for the reading text, with Lora kept for titles. The chosen font is **Karla** (2026-11-26). Also at https://claude.ai/artifact/R1s3wHoenAxcb4KibA9Tdz |
| [blog-logos.html](blog-logos.html) | The logo exploration. The chosen mark is **A2**: a big L, a small B in the L's inner corner and an I standing to the right, no border |
| [logo/](logo/) | The chosen mark as files: `logo.svg` and `logo-dark.svg` (header), `favicon.svg` (follows the system theme), `icon-tile.svg` and the PNG icons (a dark square), `logo-sheet.png` (a preview) |

The mockups load their fonts from Google Fonts so they open anywhere. The site itself self-hosts them ([plan D4](../plans/astro-rebuild.md)).

## Decisions the mockups record

- **Type:** Lora (400, 500, 600 and the 400 italic) for titles, headings and the brand; **Karla** (400, 400 italic, 600) for the reading text, the intro, bylines, callouts and card text; DM Mono (400, 500) for labels, and IBM Plex Mono (400, 400 italic, 500) for code, chosen by the owner after the mockups. Code colours are the "Dusk" palette (light and dark values in `src/styles/code.css`, repeated in `FrameworkExample.tsx`), at least 4.5:1 on the code block. Karla runs small, so reading text is set at 1.28rem against Lora's 1.2rem. `blog-site.html` still shows Lora for the reading text because it predates this choice; `body-fonts.html` shows Karla.
- **Shape:** every corner square, no shadows, no borders around sections. Callouts, chips, cards and the live example are quiet tints. Only the header and footer rules remain (2px).
- **Page:** graph paper, 16px cells.
- **Code blocks:** frosted glass (a lilac tint, no border), a filename label and Copy; focus lines dimmed, an error band, a highlighted line.
- **Article:** the text on a white panel (dark purple in dark mode), a cover with its credit, an "On this page" rail, previous and next.
- **Theme:** light and dark, following the system, with a toggle that remembers the choice.

## Tokens

| Token | Light | Dark |
|---|---|---|
| paper (page) | `#fdf5fc` | `#17112b` |
| grid (lines) | `#f1dcf0` | `#261e44` |
| ink (text) | `#2b1530` | `#f0eaff` |
| dim (secondary text) | `#7a5a80` | `#a99dc9` |
| accent (orchid) | `#9a3fc4` | `#c78bf0` |
| mark (highlighted line) | `#ffd6ec` | `#4b2f78` |
| panel (article text) | `#ffffff` | `#211a3b` |
| tone a, tint / text | `#d9ccf5` / `#6b4fc0` | `#3a2d73` / `#b9a2ff` |
| tone b, tint / text | `#ffd3be` / `#b2502a` | `#5a3322` / `#ff9d78` |
| tone c, tint / text | `#c8ebdd` / `#1f7a5a` | `#1d4437` / `#6fd6a8` |
| tone d, tint / text | `#bedcf5` / `#2a6fa8` | `#233f66` / `#7ebcff` |

The logo uses the orchid in light (`#9a3fc4`) and the lighter orchid in dark (`#c78bf0`); the app icon sits on `#17112b`.

## Not decided here

- The main site's logo stays as it is (its own L mark with rounded tiles). Squaring its corners is a separate question, outside the blog plan.

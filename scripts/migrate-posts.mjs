#!/usr/bin/env node
// One-time conversion of the Vocs posts (docs/pages/posts) into the Astro content collection (src/content/posts).
// Run it again to regenerate every file; delete it with Vocs in BL12.
//   node scripts/migrate-posts.mjs
//
// What it changes, and nothing else:
//   - drops Vocs-only lines (the vocs/components import, the AuthorAndDate and CoverPhoto elements, the H1, a Markdown cover image)
//   - moves what those showed into front matter: `image` (cover file), `imageCredit` (from CoverPhoto), `heading` (the H1 when it differs from the title)
//   - points component imports at the Astro components in src/components
//   - inlines `// [!include ~/snippets/<file>[:region]]` from docs/snippets
//   - points images hosted in the private blog-posts repository (broken on the live site) at the copy in public/assets/images
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'docs/pages/posts';
const OUT = 'src/content/posts';
const COVERS = 'docs/public/assets/post-covers';
const SNIPPETS = 'docs/snippets';
const covers = readdirSync(COVERS);
const images = readdirSync('docs/public/assets/images');
const PRIVATE_IMAGE = /https:\/\/raw\.githubusercontent\.com\/laudebugs\/blog-posts\/main\/assets\/_\/([^"')\s]+)/g;
const report = [];

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

function snippet(ref) {
  const [file, region] = ref.split(':');
  const text = readFileSync(join(SNIPPETS, file.replace('~/snippets/', '')), 'utf8');
  let lines = text.split('\n');
  const cut = lines.findIndex((line) => line.trim() === '// ---cut---');
  if (cut >= 0) lines = lines.slice(cut + 1);
  if (region) {
    const start = lines.findIndex((line) => line.includes(`[!region ${region}]`));
    const end = lines.findIndex((line) => line.includes(`[!endregion ${region}]`));
    lines = lines.slice(start + 1, end);
  } else {
    lines = lines.filter((line) => !/\[!(end)?region /.test(line));
  }
  return lines.join('\n').replace(/\n+$/, '');
}

for (const year of readdirSync(SRC)) {
  for (const name of readdirSync(join(SRC, year))) {
    if (!name.endsWith('.mdx') || name.startsWith('_')) continue;
    const slug = name.replace(/\.mdx$/, '');
    const raw = readFileSync(join(SRC, year, name), 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) throw new Error(`${name}: no front matter`);
    let front = match[1];
    const lines = raw.slice(match[0].length).split('\n');
    const out = [];
    const notes = [];
    let inFence = false;
    let h1 = null;
    let credit = null;
    let usesCallout = false;
    const imports = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^```/.test(line)) inFence = !inFence;
      if (inFence || /^```/.test(line)) {
        const include = line.match(/^\/\/ \[!include (~\/snippets\/[^\]]+?)\]\s*$/);
        out.push(include ? snippet(include[1]) : line);
        continue;
      }
      if (/^import \{ Callout \} from 'vocs\/components'/.test(line)) {
        usesCallout = true;
        continue;
      }
      if (/^import \{ (CoverPhoto|AuthorAndDate) \}/.test(line)) continue;
      const component = line.match(/^import \{ (\w+) \} from '\.\.\/\.\.\/\.\.\/components\/(\w+)'/);
      if (component) {
        imports.push(`import ${component[1]} from '../../../components/${component[2]}.astro';`);
        continue;
      }
      if (/^export const \{[^}]*\} = frontmatter;?/.test(line)) continue;
      if (/^<AuthorAndDate /.test(line)) continue;
      if (/^<CoverPhoto /.test(line)) {
        let element = line;
        while (!element.includes('/>')) element += lines[++i];
        const found = element.match(/credit=\{"(.*)"\}\s*\/>/s);
        if (found) credit = found[1].replaceAll('\\"', '"');
        continue;
      }
      if (/^!\[Cover Image\]\(/.test(line)) continue;
      if (h1 === null && /^# /.test(line)) {
        h1 = line.slice(2).trim();
        continue;
      }
      if (/<Callout\b/.test(line)) usesCallout = true;
      out.push(
        line.replace(PRIVATE_IMAGE, (url, file) => {
          if (images.includes(file)) return `/assets/images/${file}`;
          notes.push(`image not found locally: ${file}`);
          return url;
        }),
      );
    }

    // Front matter: the cover file, the credit and the H1.
    const cover = covers.find((file) => file.includes(slug));
    const title = (front.match(/^title:\s*(.+)$/m)?.[1] ?? '').replace(/^['"]|['"]$/g, '');
    front = front.replace(/^image:.*\n?/m, '').replace(/^imageDescription:.*\n?/m, (m) => m);
    if (credit !== null) front = front.replace(/^imageCredit:.*(\n|$)/m, '');
    const add = [];
    if (cover) add.push(`image: ${quote(cover)}`);
    if (credit !== null) add.push(`imageCredit: ${quote(credit)}`);
    if (h1 !== null && h1.replaceAll('`', '') !== title) add.push(`heading: ${quote(h1)}`);
    front = `${front.replace(/\n+$/, '')}\n${add.join('\n')}`;
    if (!cover) notes.push('no cover file');
    if (title === '') notes.push('no title');

    const header = [...(usesCallout ? ["import Callout from '../../../components/Callout.astro';"] : []), ...imports];
    const body = out.join('\n').replace(/^\n+/, '');
    const dir = join(OUT, year);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), `---\n${front}\n---\n\n${header.length ? `${header.join('\n')}\n\n` : ''}${body}`);
    report.push(`${year}/${slug}${notes.length ? `  (${notes.join(', ')})` : ''}`);
  }
}
console.log(`${report.length} posts written to ${OUT}\n${report.join('\n')}`);

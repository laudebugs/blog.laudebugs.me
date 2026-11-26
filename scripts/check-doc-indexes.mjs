#!/usr/bin/env node
// Every docs/ folder has a README.md, and every markdown file in it is linked from that README.
// Exempt: TEMPLATE*.md, README.md itself, todo state folders (the board is derived, not indexed),
// and research notes / reference source mirrors (raw material, indexed by their topic README).
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DOCS = join(ROOT, "docs");
// docs/{components,helpers,pages,public,snippets} are the current Vocs site, and docs/dist is its (gitignored) build output; BL3 moves them out of docs/ and this exemption goes with them.
const SKIP = [/^docs\/(components|helpers|pages|public|snippets|dist)$/, /^docs\/todos\/(ready|ongoing|done)$/, /^docs\/research\/[^/]+\/(notes|sources)$/, /^docs\/reference\/[^/]+\/source$/];
const problems = [];
// A link target must match whole: "](name)", "](name#anchor)", or "](name/...)" (not a substring of another name).
const linked = (readme, target) => readme.includes(`](${target}`) && new RegExp(`\\]\\(${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\)|#|/)`).test(readme);

const walk = (dir) => {
  if (!existsSync(join(dir, "README.md"))) { problems.push(`${relative(ROOT, dir)}: missing README.md`); return; }
  const readme = readFileSync(join(dir, "README.md"), "utf8");
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP.some((re) => re.test(relative(ROOT, p)))) {
        walk(p);
        if (!linked(readme, `${name}/`) && !linked(readme, name)) problems.push(`${relative(ROOT, p)}: not linked from ${relative(ROOT, join(dir, "README.md"))}`);
      }
    } else if (name.endsWith(".md") && name !== "README.md" && !name.startsWith("TEMPLATE")) {
      if (!linked(readme, name)) problems.push(`${relative(ROOT, p)}: not listed in ${relative(ROOT, join(dir, "README.md"))}`);
    }
  }
};
walk(DOCS);
if (problems.length) { console.error(problems.map((p) => "doc-indexes: " + p).join("\n")); process.exit(1); }
console.log("doc-indexes: ok");

#!/usr/bin/env node
// Validates the todo board under docs/todos/. Zero dependencies.
//   node scripts/check-todos.mjs           validate (exit 1 on problems)
//   node scripts/check-todos.mjs --board   print the derived board
// The board is never committed: a committed board changes in every PR that moves a todo,
// and each merge would make every other open PR conflict.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASE = join(ROOT, "docs/todos");
const STATES = ["ready", "ongoing", "done"];

const field = (text, name) => {
  const m = text.match(new RegExp(`^\\|\\s*${name}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "mi"));
  return m ? m[1].replace(/`/g, "").trim() : null;
};

const NAME = /^([A-Z]+\d+[a-z]?)-[a-z0-9]+(-[a-z0-9]+)*\.md$/;
const ID = /^[A-Z]+\d+[a-z]?$/;
const todos = [];
const problems = [];
const seen = new Map();
for (const state of STATES) {
  const dir = join(BASE, state);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md") || f === "README.md") continue;
    const m = f.match(NAME);
    if (!m) { problems.push(`${state}/${f}: name must be <ID>-<kebab-slug>.md with an ID like BL4 or BL4a`); continue; }
    const text = readFileSync(join(dir, f), "utf8");
    const id = m[1];
    const key = id.toLowerCase();
    if (seen.has(key)) problems.push(`${state}/${f}: duplicate ID ${id} (also ${seen.get(key)})`);
    else seen.set(key, `${state}/${f}`);
    const status = field(text, "Status");
    if (status === null) problems.push(`${state}/${f}: no Status row in the field table`);
    else if (status !== state) problems.push(`${state}/${f}: Status "${status}" does not match its folder`);
    const dependsRaw = field(text, "Depends on") ?? "None";
    const depends = /^(none|—|-)$/i.test(dependsRaw) ? [] : dependsRaw.split(/[,\s]+/).filter(Boolean);
    for (const d of depends) if (!ID.test(d)) problems.push(`${state}/${f}: "Depends on" must be IDs separated by commas or "None", got "${d}"`);
    const title = (text.match(/^#\s+(.+)$/m) ?? [, f])[1];
    todos.push({ id, state, file: `docs/todos/${state}/${f}`, status, depends: depends.filter((d) => ID.test(d)), title });
    if (/^\|\s*Blocks\s*\|/mi.test(text)) problems.push(`${state}/${f}: has a "Blocks" row; "Depends on" is the only record of ordering`);
  }
}

const byId = new Map(todos.map((t) => [t.id, t]));
for (const t of todos) {
  for (const d of t.depends) {
    const dep = byId.get(d);
    if (!dep) problems.push(`${t.file}: depends on unknown todo ${d}`);
    else if (t.state === "done" && dep.state !== "done") problems.push(`${t.file}: is done but depends on unfinished ${d}`);
  }
}
const visiting = new Set(), visited = new Set();
const visit = (t, path) => {
  if (visited.has(t.id)) return;
  if (visiting.has(t.id)) { problems.push(`dependency cycle: ${[...path, t.id].join(" -> ")}`); return; }
  visiting.add(t.id);
  for (const d of t.depends) if (byId.has(d)) visit(byId.get(d), [...path, t.id]);
  visiting.delete(t.id); visited.add(t.id);
};
todos.forEach((t) => visit(t, []));

if (process.argv.includes("--board")) {
  for (const state of STATES) {
    console.log(`\n## ${state} (${todos.filter((t) => t.state === state).length})`);
    for (const t of todos.filter((x) => x.state === state)) {
      const blocked = t.state === "ready" && t.depends.some((d) => byId.get(d)?.state !== "done");
      const blocks = todos.filter((o) => o.depends.includes(t.id)).map((o) => o.id);
      console.log(`- ${t.id}  ${t.title}${blocked ? "  [blocked by " + t.depends.filter((d) => byId.get(d)?.state !== "done").join(", ") + "]" : ""}${blocks.length ? "  (unblocks " + blocks.join(", ") + ")" : ""}`);
    }
  }
  process.exit(0);
}
if (problems.length) { console.error(problems.map((p) => "todos: " + p).join("\n")); process.exit(1); }
console.log(`todos: ok (${todos.length} todo${todos.length === 1 ? "" : "s"})`);

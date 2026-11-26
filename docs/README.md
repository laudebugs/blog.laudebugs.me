# Docs

Everything the project knows, written down. Agents and humans read the same files.

| Folder | What it holds | Lifecycle |
|---|---|---|
| [agents/](agents/) | Detail behind `AGENTS.md`, one file per topic, loaded per area | Updated in the same PR as the change it describes |
| [decisions/](decisions/) | ADRs: one hard-to-reverse decision each | `NNNN-title.md`; never rewritten, only superseded |
| [plans/](plans/) | Roadmaps and feature designs: the what and why | Status line: Draft, In progress, Done, Abandoned |
| [todos/](todos/) | The work board: one todo is one PR | Folder is the state: `ready/`, `ongoing/`, `done/` |
| [bugs/](bugs/) | One folder per diagnosed bug: detail and resolution | Created on diagnosis; indexed in a table |
| [research/](research/) | Evidence behind plans: reports, fact-checks, raw notes | One folder per topic |
| [design/](design/) | The agreed look: mockups, tokens, logo files | Mockups are references, not code |
| [guidelines/](guidelines/) | How we work: MUST/SHOULD rules | Changed in their own PR |
| [standards/](standards/) | What good output looks like here: coding, writing, and so on | Tagged (Current) or (Target) |
| [guides/](guides/) | Runbooks, setup, how-tos | Written when someone would otherwise ask |
| [reference/](reference/) | External specs, vendored docs, reading lists | Cite version and date |

`pages/`, `components/`, `helpers/`, `public/` and `snippets/` also sit here today: they are the current Vocs site, not documentation. They stay until the cutover ([BL12](todos/ongoing/BL12-cutover.md)), because Vercel still builds them, and the doc-index check skips them until then.

## Every folder needs a README index

- File names are `kebab-case.md`. An ordered series uses a numeric prefix.
- **Every folder has a `README.md` index.** Add your file to it when you create one. `make check-docs` fails otherwise.
- Cite primary sources. Mark opinions and recommendations as such. Write "as of <month year>" for versions, counts, and status.
- Link to a todo or plan by file path, and name it by ID in text: files move between folders, so a bare section number goes stale.
- Plans and todos link to each other. A plan never holds todo specs; a todo never holds design.
- Prose rules and the review skills: [guidelines/docs-writing.md](guidelines/docs-writing.md).

## Research feeds plans, plans feed todos

```
research/  ->  plans/  ->  todos/  ->  PR  ->  done/
   evidence      design      one PR each      (+ decisions/ for hard-to-reverse choices,
                                               + bugs/ for diagnosed failures)
```

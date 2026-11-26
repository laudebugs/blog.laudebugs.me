# Research

Evidence behind plans. Research feeds a plan; a plan feeds todos.

One folder per topic:

```
research/<topic>/
  README.md              the report: thesis as the title, versions "as of <month year>", what was and was not verified
  fact-check-<topic>.md  claim-by-claim verdicts (format below)
  notes/                 raw per-subtopic material; the report and fact-check supersede notes where they disagree
```

Add each topic below in the same PR.

| Topic | Summary |
|---|---|
| [search-agent](search-agent/README.md) | What an in-browser search agent can run on: what was measured here (plain-search baseline, CPU models, the built-in model API), what was not, and what follows |

## Cite, date, and say what was not verified

- Cite a source for every factual claim. Prefer primary sources. Mark claims taken from search summaries as secondary.
- A research paper's claim is checked against the whole paper, not only its abstract. An abstract-only check is unverified, not confirmed.
- State plainly what was not run or verified. "Nothing here ran code" is a valid sentence.
- Raw drafts from another tool stay unreviewed until they pass the pipeline below.

## Every document passes a five-step pipeline

1. Draft with `/writing`.
2. Fact-check every claim against a primary source and log it.
3. Review the whole document with `/writing-review`.
4. Fix every finding.
5. Re-check every claim a fix touched; check that all relative links and anchors resolve.

Fact-check long documents section by section, right after each is written.

## Fact-check log format

```markdown
# Fact-check: <topic>
Date: YYYY-MM-DD · Scope: <what> · Legend: ✅ confirmed · ✏️ corrected · ⚠️ unverified

| # | Claim | Verdict | Source and reason |
|---|---|---|---|
| T31-1 | "X supports Y since v2" | ✅ | docs, "Changelog", v2.0.0 |
```

Row IDs are `<todo id>-<n>` so parallel PRs never collide. Never renumber. Correct a wrong claim in place and give the correction its own row, so every change stays visible.

# 0003. The search agent runs on the browser's built-in model, behind a small interface

- **Status:** Proposed. The owner's decision to run the model in the browser (2026-11-26) stands; this record picks the runtime and stays provisional until the check below is run on a real Chrome.
- **Date:** 2026-11-26
- **Plan:** [astro-rebuild.md](../plans/astro-rebuild.md), D8 and O2
- **Evidence:** [research/search-agent](../research/search-agent/README.md)

## Context

The plan asks for an "Ask" mode in the search dialog where a model that runs in the visitor's browser searches the posts and suggests some. Nothing the visitor types may leave the browser, and search must work without the model. In this session's container a CPU-only model was far too slow, the browser's built-in model could not be tried because this Chromium stubs it, and no GPU was available.

## Decision

- **Runtime:** the browser's Prompt API (`LanguageModel`), used where `availability()` is not `unavailable`. Elsewhere the Ask button is hidden and search is plain Pagefind.
- **Interface:** the agent sees only `ModelProvider` and `ModelSession` (`src/agent/model.ts`), so a WebGPU runtime can be added later without touching the loop.
- **Tools:** read only, over the published site: `search_posts` (Pagefind), `get_post` (the post's Markdown copy), `list_topics` (`posts-index.json`). No tool writes or reaches another host.
- **Grounding:** the answer is only posts the tools returned in that run. Invented addresses are dropped; if none is left, or the model fails or does not reply with JSON, the page shows the ordinary results.
- **Consent:** the model is never downloaded until the visitor presses a button that says so. Chrome owns the download and its progress is shown.
- **Not built:** a WebGPU model. It waits for measurements on real devices.

## Consequences

- Ask reaches desktop Chrome only, as of Chrome's documentation of 2026-10-21. Phones and other browsers get plain search.
- The page can run the agent against a scripted model in tests; no test here has run a real model.
- The evaluation set (`tests/fixtures/ask-questions.json`) is the check below.

## The check that confirms or changes this

On a desktop Chrome that has the model, run the 14 questions through Ask. The decision stands if the right post is in the first 3 suggestions for at least **11 of 14**, which beats plain search with hand-written keywords (9 of 14) by a clear margin. If it does not, the options are a larger prompt, a WebGPU model, or dropping Ask and improving plain search (for example, matching any word instead of all of them). Until this is run the record stays Proposed.

## Alternatives considered

- **A WebGPU model we ship (WebLLM, transformers.js).** Reaches more browsers, but it is a download of several hundred megabytes or more from us, and nothing here could measure it.
- **A CPU model in a worker.** Measured at about one token a second and it ignored the instruction. Rejected.
- **A server-side model.** The owner chose the browser, and a server would see the questions.
- **No model; better plain search.** Remains the fallback and the fix if the check fails.

# A search agent in the browser has one cheap runtime today and no measured quality yet

As of 2026-11-26. This is the spike for the plan's D8 and todo BL9. It says what we measured, what we could not, and what follows from both.

## What we measured

All runs used the Chromium that Playwright installs in this session's container: 4 CPU cores, 16 GB of memory, no real GPU. The numbers are for that machine, not for a phone or a laptop.

| Measurement | Result |
|---|---|
| Plain search with the whole question, 14 questions, right post in the top 3 | **5 of 14** (Pagefind needs every word to match, so a long question often finds nothing) |
| Plain search with the question cut down to its keywords by hand, widened when empty | **9 of 14** in the top 3, and the same 9 first |
| Qwen2.5 0.5B (4-bit), in-browser on the CPU, asked for one search query | 786 MB for the weights, 1.1 tokens per second, and it answered the question instead of giving a query |
| SmolLM2 360M (4-bit), the same test | 388 MB, 1.4 tokens per second, same failure |
| The browser's built-in model API in this Chromium | The API exists and reports `downloadable`, but `create()` returns a stub that repeats the prompt back, so no real answer could be measured |
| WebGPU in this Chromium | An adapter exists, but it is software emulation, so timings would mean nothing |

The questions and their right answers are in `tests/fixtures/ask-questions.json`. They were written from the post titles and summaries, before looking at any search results.

The weights sizes come from the `content-length` of each model's `model_q4.onnx` on Hugging Face. The speeds are one run each, so treat them as an order of magnitude.

## What we could not measure

- Any real model's answer quality, on any device.
- Download time, first-answer time and memory on a phone or a laptop with a GPU.
- How well Chrome's built-in model follows the JSON schema we give it.

These need a real desktop Chrome, and a phone for the WebGPU option. They are not done.

## What the browser's built-in model needs

From Chrome's documentation (as of 2026-10-21): the Prompt API works in desktop Chrome on Windows 10 or 11, macOS 13 or later, Linux, and Chromebook Plus. It does not work on Chrome for Android or iOS. It needs 22 GB of free disk space on the profile's volume, and either a GPU with more than 4 GB of video memory or 16 GB of memory and 4 CPU cores. The model download needs an unmetered connection and happens once; after that nothing is sent to Google or anyone else. `LanguageModel.availability()` takes the same options as `create()`, and `create()` needs a user gesture when the model must be downloaded. A JSON Schema passed as `responseConstraint` makes the reply follow it.

Source: [developer.chrome.com/docs/ai/prompt-api](https://developer.chrome.com/docs/ai/prompt-api), read 2026-11-26.

## What follows

- **A CPU-only model in the page is too slow.** At about one token a second, one reply takes tens of seconds, and the two small models did not follow a one-line instruction. This option is out.
- **The built-in model is the cheapest runtime.** We ship no weights and the browser owns the download. It reaches desktop Chrome only. Everyone else keeps plain search, which the design already says must always work.
- **A WebGPU model (WebLLM, or transformers.js on WebGPU) is the only way to reach other browsers and phones.** It costs a download of several hundred megabytes to a gigabyte or more from us. It stays unbuilt until it is measured on real devices.
- **Plain search is weak on questions.** Five of 14 is the floor the agent has to beat, and nine of 14 is what hand-written keywords reach. Rewriting a question into keywords is where a model helps most, so the agent's first move is a search with a query it writes.

## Proposed plan changes

None to the plan's goals. The decision is in [ADR 0003](../../decisions/0003-search-agent-on-the-browsers-built-in-model.md).

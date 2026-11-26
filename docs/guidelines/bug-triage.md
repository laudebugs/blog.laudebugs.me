# Bug triage

Work in this order. Do not skip to the fix.

1. **Reproduce it the way the user meets it.** Not the unit test: the real flow.
2. **Tell slow from stuck.** Wait, then measure.
3. **Measure every stage before guessing.** Timings, counts, sizes.
4. **Log every failure, including the expected ones.** A swallowed error is the next bug.
5. **Look for two definitions of one thing.** Most "impossible" bugs are two sources of truth disagreeing.
6. **Fix the cause, not the symptom.**
7. **Prove the fix.** A regression test that fails without it, plus a sweep of the inputs that matter.
8. **Record it** in `docs/bugs/<symptom>/` (`detail.md`, `resolution.md`) and add the index row.

## Report back in five answers

Answer five questions, in order: what was wrong, why (with numbers), what changed, how it was checked, what is left.

## Never patch to pass a test

Patch code only to make a test pass. Find out why it fails.

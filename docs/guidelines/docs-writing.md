# Writing docs

Applies to any prose a human reads. Draft with the `/writing` skill; review with `/writing-review`. Write "ADR (architecture decision record)" at first use in a file.

- **MUST** make headings state the rule or claim ("Every PR gets two review rounds"), not a topic ("Review"). Index READMEs and templates may use topic labels.
- **MUST** keep titles and descriptions to 160 characters or fewer, sentences to 40 words or fewer, paragraphs to 100 words or fewer.
- **MUST** use one term per thing.
- **MUST** give a rule its reason, and date a rule that came from an incident or a decision ("owner's rule, 2026-11-19").
- **MUST NOT** put internal IDs (todo IDs, ADR numbers) in reader-facing prose such as READMEs and guides. IDs belong in todos, branch names, commits, plans, and logs.
- **MUST NOT** use filler such as "simply", "easy", "obviously", or "just" as a softener.
- **SHOULD** show the wrong way beside the right way, and name the forbidden alternative.
- **SHOULD** link to detail instead of repeating it. Duplicated text drifts.
- Mark opinions and recommendations. Label evidence with "as of <month year>".

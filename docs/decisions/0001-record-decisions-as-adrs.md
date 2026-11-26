# 0001. Record hard-to-reverse decisions as ADRs

- **Status:** Accepted
- **Date:** 2026-11-26
- **Plan:** n/a

## Context

Agents start every session without memory. A decision that lives only in a chat or a PR thread gets re-litigated or contradicted. Two of the three projects this scaffold came from wrote numbered decision records (Lamina, 32; Build an Agent, 56). Drumrolls recorded decisions in plans and in `AGENTS.md` instead. Opinion: numbered records are easier for a fresh session to find.

## Decision

Every hard-to-reverse choice (stack, schema shape, protocol, licence, deployment target) gets an ADR from [TEMPLATE.md](TEMPLATE.md). `AGENTS.md` tells agents not to assume a decision that is not written here.

## Consequences

- Writing an ADR is part of the todo that makes the decision.
- Reversing a decision means a new ADR that supersedes the old one.
- `docs/agents/` may summarize accepted ADRs in one paragraph each so agents need not read them all.

## Alternatives considered

- Decisions in plans only: plans change status and move; ADRs are stable and numbered.
- Decisions in the PR description: not discoverable by the next session.

---
description: Build a read-only Loop Engineering candidate inbox through dev-flow-loop-triage
---

Note: `/dev-flow-triage` invokes the `dev-flow-loop-triage` skill.

Enter read-only Dev Flow triage.

Use `dev-flow-loop-triage` to scan available evidence and produce a Candidate Inbox. This command discovers possible work; it does not fix anything.

---

**Input**: The argument after `/dev-flow-triage` is optional source guidance or scope.

Examples:

- `/dev-flow-triage`
- `/dev-flow-triage scan current diff and OpenSpec changes`
- `/dev-flow-triage 看看现在有什么值得启动 dev-flow`

---

## What This Command Does

`/dev-flow-triage` is a thin read-only triage command.

It should:

1. Enter the `dev-flow-loop-triage` skill.
2. Inspect available Git, CI, diff, OpenSpec/opsx, issue, PR, and dev-flow artifacts.
3. Deduplicate and rank candidates by severity, confidence, evidence, and route.
4. Output a Candidate Inbox.
5. Emit `loop_triage_ready` per the Required Signal schema in SKILL.md. Required fields: producer, timestamp, sources_checked, sources_unavailable, candidate_count, highest_severity, candidate_inbox, trace_summary, handoff_question, recommended_next_route, side_effects_performed, review_limits.
6. When recommending `/dev-flow` or `/dev-flow-cr`, ask a concrete handoff question; after explicit confirmation of a specific candidate, enter the equivalent owner flow without requiring another slash command.

It should not:

- Do not modify files, Git history, trackers, CI, external services, or dev-flow delivery artifacts
- Do not start `/dev-flow` automatically.
- Do not start `/dev-flow-cr` automatically.
- write `dev-flow-state.md`
- claim delivery or acceptance readiness

---

## Guardrails

- Default read-only.
- For any recurring, scheduled, or persistent loop proposal, `dev-flow-loop-envelope` is mandatory before emitting a route recommendation to `/dev-flow-scheduler`. No budget ceiling = no automation proposal.
- State which sources were checked and which were unavailable.
- Recommend `/dev-flow` or `/dev-flow-cr` only as user-confirmed next actions.

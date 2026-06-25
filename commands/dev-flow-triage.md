---
description: Build a read-only Loop Engineering candidate inbox through dev-flow-loop-triage.
---

# Dev Flow Triage

Note: `/dev-flow-triage` invokes the `dev-flow-loop-triage` skill.

Use this command as the Codex slash-command entrypoint for read-only Loop Engineering triage.

## Workflow

1. Use the `dev-flow-loop-triage` skill as the owner.
2. Treat the argument after `/dev-flow-triage` as source guidance or scope.
3. Inspect available repo, CI, diff, OpenSpec/opsx, issue, PR, and dev-flow artifacts.
4. Build a Candidate Inbox with severity, confidence, evidence, and recommended next route.
5. Emit `loop_triage_ready` per the Required Signal schema in SKILL.md. Required fields: producer, timestamp, sources_checked, sources_unavailable, candidate_count, highest_severity, candidate_inbox, trace_summary, handoff_question, recommended_next_route, side_effects_performed, review_limits.
6. When recommending `/dev-flow` or `/dev-flow-cr`, ask a concrete handoff question; after explicit confirmation of a specific candidate, enter the equivalent owner flow without requiring another slash command.

## Rules

- Default read-only.
- For any recurring, scheduled, or persistent loop proposal, `dev-flow-loop-envelope` is mandatory before emitting a route recommendation to `/dev-flow-scheduler`. No budget ceiling = no automation proposal.
- Do not modify files, Git history, trackers, CI, external services, or dev-flow delivery artifacts.
- Do not start `/dev-flow` automatically.
- Do not start `/dev-flow-cr` automatically.
- Recommend `/dev-flow` or `/dev-flow-cr` only for user-confirmed next action.
- Do not write `dev-flow-state.md`; loop triage is outside governed delivery state.

## User Request

Apply the read-only triage workflow above to the user's current request and any arguments supplied after `/dev-flow-triage`.

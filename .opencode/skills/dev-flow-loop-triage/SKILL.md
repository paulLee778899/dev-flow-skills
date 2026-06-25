---
name: dev-flow-loop-triage
description: Use when the user asks to scan, triage, monitor, or build an inbox of candidate work from repo state, CI failures, diffs, issues, OpenSpec/opsx artifacts, dev-flow reports, or repeated Loop Engineering observations without modifying files.
---

# Dev Flow Loop Triage

Read-only observation skill for Loop Engineering. It produces a candidate inbox and route recommendations; it never fixes candidates directly.

## Boundary

- Default read-only. Do not modify implementation files, tests, configs, generated assets, Git history, trackers, CI, or external systems.
- Do not start `/dev-flow` or `/dev-flow-cr` automatically; ask for explicit confirmation of a specific candidate before entering the equivalent owner flow.
- Do not write `dev-flow-state.md`; loop triage is outside governed delivery state.
- Persist a triage report only when the user explicitly asks for a report file.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

1. Establish sources: current diff, branch, CI/test output, OpenSpec/opsx changes, dev-flow artifacts, CR reports, issues/PRs, or user-supplied logs.
2. Inspect strongest available evidence; do not invent missing CI/tracker data.
3. Record the trace: sources checked, sources unavailable, commands inspected, and side effects performed.
4. Deduplicate candidates by root cause, changed files, issue ID, OpenSpec change, or failing command.
5. Rank candidates by severity, confidence, owner route, and whether user approval is needed.
6. For `/dev-flow` or `/dev-flow-cr` recommendations, include a concrete handoff question; if the user confirms a specific candidate, enter that owner flow without requiring another slash command.

## References

- `references/triage-inbox.md`: Load before scanning sources, ranking candidates, writing a report, or emitting `loop_triage_ready`.

## Required Signal

```yaml
loop_triage_ready:
  producer: dev-flow-loop-triage
  timestamp: <ISO-8601>
  sources_checked: [list]
  sources_unavailable: [list or none]
  candidate_count: <integer>
  highest_severity: P0 | P1 | P2 | P3 | none
  candidate_inbox: <table or report path>
  trace_summary: <one line>
  handoff_question: <question or none>
  recommended_next_route: none | ask_user | /dev-flow | /dev-flow-cr | /dev-flow-scheduler | manual_action | external_tracker
  side_effects_performed: none
  review_limits: [list or none]
```

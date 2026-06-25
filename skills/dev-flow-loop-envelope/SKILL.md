---
name: dev-flow-loop-envelope
description: Use when defining budget, permissions, cadence, stop conditions, locks, safety limits, or approval boundaries for Loop Engineering, recurring scans, background agents, automation proposals, monitors, or repeated dev-flow triage.
---

# Dev Flow Loop Envelope

Define the safety envelope for any repeated, scheduled, background, or persistent Loop Engineering activity before it runs. This skill prepares the envelope; `dev-flow-scheduler` applies approved automation changes.

## Boundary

- Does not scan candidates, implement fixes, run `/dev-flow`, run `/dev-flow-cr`, or perform Git/external side effects.
- Does not create, update, pause, resume, or delete automations directly; it prepares the envelope that a user can approve and hand to `dev-flow-scheduler`.
- Writing `loop-envelope.md` is allowed only when the user explicitly asks to persist the envelope.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

1. Capture loop objective, scope, trigger, schedule policy, allowed sources, cadence, owner, and expected output.
2. Define budget limits: max iterations, max agents, max wall time, max changed files, token/cost note, and retry cap.
3. Define permission boundaries: `allowed_side_effects`, `forbidden_side_effects`, and `requires_user_approval`.
4. Define trace/eval requirements: what evidence must be recorded and what checkpoint decides readiness.
5. Define stop conditions and escalation conditions before any repeated loop is proposed.
6. Emit `loop_envelope_ready`; block the loop proposal if side effects or stop conditions are unclear, and route approved scheduler actions to `dev-flow-scheduler`.

## References

- `references/budget-and-safety.md`: Load before proposing a loop envelope, recurring automation, monitor, background run, or persistent loop state.

## Required Signal

```yaml
loop_envelope_ready:
  producer: dev-flow-loop-envelope
  timestamp: <ISO-8601>
  objective: <one line>
  scope: <repo | branch | diff | openspec_change | dev_flow_topic | external_source>
  trigger: manual | heartbeat | scheduled | event_triggered | background
  schedule_kind: manual | heartbeat | cron | interval | event | none
  cron_expression: <expression or none>
  timezone: <IANA timezone or local>
  max_overlap: 0 | 1
  missed_run_policy: skip | run_once | ask_user
  jitter: <duration or none>
  cadence: manual | scheduled | event_triggered | background
  allowed_sources: [list]
  allowed_side_effects: [read_only | write_loop_report]
  forbidden_side_effects: [implementation_changes, git_commit, git_push, pr_create, merge, external_mutation, paid_service]
  requires_user_approval: [list]
  budget: <structured: max_iterations, max_wall_time, retry_cap, cost_ceiling; free-text only accepted when trigger is manual; see budget-and-safety.md>
  trace_requirements: [list]
  eval_checkpoint: <score_threshold | candidate_confidence | user_review | none>
  stop_conditions: [list]
  escalation_conditions: [list or none]
  lock_policy: <repo_writer_lock | none>
  status: ready | blocked
```

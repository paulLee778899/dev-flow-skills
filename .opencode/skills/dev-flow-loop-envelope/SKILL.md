---
name: dev-flow-loop-envelope
description: Use when defining budget, permissions, cadence, stop conditions, locks, safety limits, auto-continue boundaries, baseline approval scope, or approval boundaries for Loop Engineering, recurring scans, background agents, delivery loops, automation proposals, monitors, or repeated dev-flow triage.
---

# Dev Flow Loop Envelope

Define the safety envelope for any repeated, scheduled, background, persistent, or auto-continuing Loop Engineering activity before it runs. This skill prepares the envelope; `dev-flow-scheduler` applies approved automation changes.

## Boundary

- Does not scan candidates, implement fixes, run `/dev-flow` as a phase owner, run `/dev-flow-cr` as a reviewer, or perform Git/external side effects.
- Does not create, update, pause, resume, or delete automations directly; it prepares the envelope that a user can approve and hand to `dev-flow-scheduler`.
- Writing `loop-envelope.md` is allowed when the user approves persisted loop artifacts. Persist `loop_envelope_ready` to `loop-state.md` in the loop artifact directory; never write it to `dev-flow-state.md`.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

1. Capture loop objective, scope, trigger, schedule policy, allowed sources, cadence, owner, and expected output.
2. Define budget limits: max iterations, max phase repair rounds, max full-loop passes, max agents, max wall time, token/cost note, and retry cap.
3. Define permission boundaries: `allowed_side_effects`, `forbidden_side_effects`, `requires_user_approval`, and `auto_continue_scope`.
4. Define trace/eval requirements: what evidence must be recorded and what checkpoint decides readiness.
5. Define stop conditions and escalation conditions before any repeated or auto-continuing loop is proposed.
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
  baseline_authority: none | confirmed_loop_baseline
  auto_continue_scope: disabled | within_confirmed_baseline | ask_user
  allowed_side_effects: [read_only | write_loop_report | write_loop_artifacts | dev_flow_phase_handoff]
  forbidden_side_effects: [implementation_changes, git_commit, git_push, pr_create, merge, external_mutation, paid_service]
  requires_user_approval: [list]
  budget: <structured: max_iterations, max_phase_repair_rounds, max_full_loop_passes, max_agents, max_wall_time, retry_cap, cost_ceiling; free-text only accepted when trigger is manual; see budget-and-safety.md>
  trace_requirements: [list]
  eval_checkpoint: <score_threshold | candidate_confidence | user_review | none>
  stop_conditions: [list]
  escalation_conditions: [list or none]
  lock_policy: <repo_writer_lock | none>
  status: ready | blocked
```

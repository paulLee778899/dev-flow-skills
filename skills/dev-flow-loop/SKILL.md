---
name: dev-flow-loop
description: Use when the user asks for Loop Engineering, loop control, recurring or repeated agent workflows, task discovery inboxes, automation guardrails, loop review, or deciding how an outer loop should hand off to /dev-flow without automatically implementing.
---

# Dev Flow Loop

Loop Engineering is the outer control plane around dev-flow. It observes signals, defines goals and triggers, shapes a safe loop envelope, runs read-only triage, checks trace/eval evidence, and recommends the next route; it does not become a `/dev-flow` phase or scheduler implementation.

## Boundary

- Default read-only. Do not modify implementation files, tests, configs, generated assets, Git history, or external systems.
- Do not run as a dev-flow stage, do not emit `routing_decided`, `execution_settled`, `acceptance_ready`, or `cr_report_ready`.
- Do not start `/dev-flow` automatically.
- Do not start `/dev-flow-cr` automatically.
- Do not create, update, pause, resume, or delete schedulers/automations; route those requests to `dev-flow-scheduler`.
- Do not start commits, pushes, PRs, merges, worktrees, or paid/external actions automatically.
- Writing a loop report or loop state file is allowed only when the user explicitly asks to persist loop artifacts.
- Route automation create/update/pause/resume/delete requests to `dev-flow-scheduler`; do not apply scheduler changes from this skill.
- Keep loop state separate from `dev-flow-state.md`; the latter belongs only to governed dev-flow delivery.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

1. Establish loop scope: workflow design, repository triage, completed-run review, automation proposal, or dispatch handoff.
2. Identify the loop goal, trigger type, expected evidence trace, and evaluation checkpoint.
3. Load `dev-flow-loop-envelope` before any repeated, scheduled, background, or persistent loop is proposed.
4. Load `dev-flow-loop-triage` when observing repo/CI/diff/issues/OpenSpec/dev-flow artifacts to produce a candidate inbox.
5. Use maker-checker separation for loop design: one pass proposes candidates or an envelope, a separate review pass checks boundaries before any handoff recommendation.
6. When a candidate route is `/dev-flow` or `/dev-flow-cr`, ask a concrete handoff question; after explicit user confirmation of a specific candidate, enter the equivalent owner flow without requiring the user to retype a slash command. Recommend a next route only after evidence is collected: none, ask_user, `/dev-flow`, `/dev-flow-cr`, `/dev-flow-scheduler`, manual action, or external tracker handoff.

## References

- `references/control-plane.md`: Load before reviewing a loop design, proposing automation, writing loop artifacts, or emitting `loop_control_ready`.

## Required Signal

```yaml
loop_control_ready:
  producer: dev-flow-loop
  timestamp: <ISO-8601>
  scope: workflow_design | repository_triage | completed_run_review | automation_proposal | dispatch_handoff
  loop_goal: <one line>
  trigger_type: manual | heartbeat | scheduled | event_triggered | background
  evidence_reviewed: [list]
  trace_or_eval_evidence: [list or none]
  envelope_required: true | false
  maker_checker_completed: true | false
  triage_report_path: <path or none>
  handoff_question: <question or none>
  recommended_next_route: none | ask_user | /dev-flow | /dev-flow-cr | /dev-flow-scheduler | manual_action | external_tracker
  side_effects_performed: none
  score: <0-100>
  unresolved_risks: [list or none]
  review_limits: [list or none]
```

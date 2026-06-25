---
description: Inspect Loop Engineering control, envelope, triage, and safe handoff through dev-flow-loop.
---

# Dev Flow Loop

Use this command as the Claude slash-command entrypoint for Loop Engineering around Dev Flow.

## Workflow

1. Use the `dev-flow-loop` skill as the owner.
2. Treat the argument after `/dev-flow-loop` as the loop scope or question.
3. Identify the loop goal, trigger type, trace/eval evidence, and maker-checker separation.
4. Load `dev-flow-loop-envelope` before proposing repeated, scheduled, background, or persistent loops. Wait for `loop_envelope_ready` signal with status: ready before proceeding to route recommendation. If loop_envelope_ready has status: blocked, present the blocking reason and stop.
5. Load `dev-flow-loop-triage` when scanning repo, CI, diff, OpenSpec/opsx, issue, PR, or dev-flow artifacts.
6. Emit `loop_control_ready` per the Required Signal schema in SKILL.md. Required fields: producer, timestamp, scope, loop_goal, trigger_type, evidence_reviewed, trace_or_eval_evidence, envelope_required, maker_checker_completed, triage_report_path, handoff_question, recommended_next_route, side_effects_performed, score, unresolved_risks, review_limits.
7. When recommending `/dev-flow`, `/dev-flow-cr`, or `/dev-flow-scheduler`, ask a concrete handoff question; after explicit confirmation of a specific candidate, enter the equivalent owner flow without requiring another slash command.

## Rules

- Default read-only.
- For any recurring, scheduled, or persistent loop proposal, `dev-flow-loop-envelope` is mandatory before emitting a route recommendation to `/dev-flow-scheduler`. No budget ceiling = no automation proposal.
- Do not start `/dev-flow` automatically.
- Do not start `/dev-flow-cr` automatically.
- Do not start commits, pushes, PRs, merges, worktrees, schedulers, or external mutations automatically.
- Do not create, update, pause, resume, or delete schedulers/automations; route those actions to `dev-flow-scheduler`.
- Do not emit dev-flow delivery-stage signals such as `routing_decided`, `execution_settled`, `acceptance_ready`, or `cr_report_ready`.
- Persist loop reports only when the user explicitly asks for persisted loop artifacts.
- Keep trace/eval evidence in the loop report or reply; keep loop state separate from `dev-flow-state.md`.

## User Request

Apply the Loop Engineering control workflow above to the user's current request and any arguments supplied after `/dev-flow-loop`.

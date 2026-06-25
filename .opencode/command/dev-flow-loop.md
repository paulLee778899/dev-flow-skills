---
description: Inspect Loop Engineering control, envelope, triage, and safe handoff through dev-flow-loop
---

Enter Dev Flow Loop Engineering control.

Use `dev-flow-loop` as the owner for outer-loop review, envelope definition, read-only triage coordination, and safe handoff recommendations.

---

**Input**: The argument after `/dev-flow-loop` is the loop scope, review target, automation idea, or Loop Engineering question.

Examples:

- `/dev-flow-loop 看看这套自动 triage loop 应该怎么设计`
- `/dev-flow-loop review current dev-flow run for loop risks`
- `/dev-flow-loop 给这个 repo 设计只读巡检 envelope`

---

## What This Command Does

`/dev-flow-loop` is a thin Loop Engineering entry command.

It should:

1. Enter the `dev-flow-loop` skill.
2. Identify the loop goal, trigger type, trace/eval evidence, and maker-checker separation.
3. Load `dev-flow-loop-envelope` before proposing repeated, scheduled, background, or persistent loops. Wait for `loop_envelope_ready` signal with status: ready before proceeding to route recommendation. If loop_envelope_ready has status: blocked, present the blocking reason and stop.
4. Load `dev-flow-loop-triage` when repository, CI, diff, OpenSpec/opsx, issue, PR, or dev-flow artifacts must be scanned.
5. Produce `trace_or_eval_evidence`, score, unresolved risks, and a recommended next route.
6. Emit `loop_control_ready`. See SKILL.md for the full loop_control_ready signal schema.
7. When recommending `/dev-flow`, `/dev-flow-cr`, or `/dev-flow-scheduler`, ask a concrete handoff question; after explicit confirmation of a specific candidate, enter the equivalent owner flow without requiring another slash command.

It should not:

- run as a `/dev-flow` phase
- Do not start `/dev-flow` automatically.
- Do not start `/dev-flow-cr` automatically.
- Do not create, update, pause, resume, or delete schedulers/automations; route those actions to `dev-flow-scheduler`
- Do not start commits, pushes, PRs, merges, worktrees, schedulers, or external mutations automatically
- emit delivery-stage signals such as `routing_decided`, `execution_settled`, `acceptance_ready`, or `cr_report_ready`

---

## Guardrails

- Default read-only.
- For any recurring, scheduled, or persistent loop proposal, `dev-flow-loop-envelope` is mandatory before emitting a route recommendation to `/dev-flow-scheduler`. No budget ceiling = no automation proposal.
- Persist loop reports only when the user explicitly asks for persisted loop artifacts.
- Keep trace/eval evidence in the loop report or reply.
- Keep loop state separate from `dev-flow-state.md`.
- Recommend `/dev-flow` or `/dev-flow-cr` only as user-confirmed next actions.

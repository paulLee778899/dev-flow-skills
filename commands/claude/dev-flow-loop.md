---
description: Run or inspect Loop Engineering control, loop-only baseline artifacts, phase DAG, envelope, triage, eval, and safe handoff through dev-flow-loop.
---

# Dev Flow Loop

Use this command as the slash-command entrypoint for Loop Engineering around Dev Flow.

## Workflow

1. Use the `dev-flow-loop` skill as the owner.
2. Treat the argument after `/dev-flow-loop` as the loop scope or question.
3. Load `references/control-plane.md` through the owner skill before delivery-loop design, Loop Phase DAG work, automation proposal, or `loop_control_ready`.
4. Identify scope, trigger type, trace_or_eval_evidence, and maker-checker separation before any route or execution recommendation.
5. For delivery loops, require Baseline Docs Gate before implementation: loop-only requirements, high-level design, detailed design, test plan (`test-plan.md`), and test case workbook (`test-cases.xlsx`) artifacts reviewed by a checker subagent with `checker_score` recorded and checker score >= 95. These are outer-loop control artifacts, not `/dev-flow` implementation documents.
6. Require Execution Envelope Gate before phase handoff: Loop Phase DAG, `auto_continue_scope`, `dev_flow_phase_handoff`, budgets, stop conditions, and side-effect boundaries. Before the gate, spawn a checker subagent to score the DAG and Envelope against the `DAG and Envelope Quality Checklist`; record the score in `dag_envelope_checker_score`; auto-revise until checker score ≥ 95.
7. Persist delivery-loop control artifacts under `Docs/<topic>/loop/` or `docs/<topic>/loop/`, including `loop-state.md`; keep OpenSpec/opsx originals in `openspec/changes/<change-id>/` or the project's standard OpenSpec/opsx location.
8. Maintain `phase-artifacts.md` or `opsx-index.md` as the phase artifact index. Do not move or copy OpenSpec/opsx originals into the loop artifact directory.
9. Only after both gates are approved, phase-level dev-flow may auto-continue within baseline. Before starting execution, verify `openspec_artifact_ready.checker_score` ≥ 95 and `task_orchestration_ready.checker_score` ≥ 95 from dev-flow-planning; do not start implementation if either is absent or below threshold. Phase execution must provide phase-level OpenSpec/opsx, TDD per task via superpowers or equivalent fallback, detailed test matrix, system-level acceptance evidence, and `phase_eval` by a checker subagent with `phase_eval_result.checker_score` recorded, checker score >= 95, and no P0/P1 finding.
10. Load `dev-flow-loop-envelope` before repeated, scheduled, background, persistent, or auto-continuing loops. If `loop_envelope_ready` is blocked, present the blocker and stop.
11. Load `dev-flow-loop-triage` when scanning repo, CI, diff, OpenSpec/opsx, issue, PR, or dev-flow artifacts.
12. Emit `loop_baseline_ready` and `loop_control_ready` per the owner skill schemas.
13. When recommending `/dev-flow`, `/dev-flow-cr`, or `/dev-flow-scheduler` from triage, ask a concrete handoff question; after explicit confirmation of a specific candidate, enter the equivalent owner flow without requiring another slash command.

## Rules

- Default read-only.
- For any recurring, scheduled, or persistent loop proposal, `dev-flow-loop-envelope` is mandatory before emitting a route recommendation to `/dev-flow-scheduler`. No budget ceiling = no automation proposal.
- Do not start `/dev-flow` automatically from unconfirmed triage candidates.
- Do not start `/dev-flow-cr` automatically from unconfirmed triage candidates.
- After Baseline Docs Gate and Execution Envelope Gate are both approved, phase-level dev-flow handoff may auto-continue within baseline.
- Freezing the initial baseline, approving the Loop Phase DAG, and enabling `within_confirmed_baseline` require explicit user approval; exceeding baseline, budget, retry, stop-condition, or side-effect boundaries requires stopping and asking the user.
- Do not start commits, pushes, PRs, merges, worktrees, schedulers, or external mutations automatically.
- Do not create, update, pause, resume, or delete schedulers/automations; route those actions to `dev-flow-scheduler`.
- Do not emit dev-flow delivery-stage signals such as `routing_decided`, `execution_settled`, `acceptance_ready`, or `cr_report_ready`.
- Persist delivery-loop baseline/state/DAG/envelope/index artifacts under the approved loop artifact directory; for read-only triage or workflow design, persist reports only when the user explicitly asks.
- Keep trace/eval evidence in the loop report or reply; keep loop state separate from `dev-flow-state.md`.

## User Request

Apply the Loop Engineering control workflow above to the user's current request and any arguments supplied after `/dev-flow-loop`.
